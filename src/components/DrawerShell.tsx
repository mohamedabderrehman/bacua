import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { Aurora } from './Aurora';
import { DrawerContent } from './DrawerContent';
import { colors, radius, shadow, spring } from '@/theme/tokens';

interface DrawerApi {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
  progress: SharedValue<number>;
}

const DrawerContext = createContext<DrawerApi | null>(null);

export function useDrawer(): DrawerApi {
  const api = useContext(DrawerContext);
  if (!api) throw new Error('useDrawer must be used inside <DrawerShell>');
  return api;
}

/** Width of the right-edge strip that starts an opening drag. */
const EDGE_ZONE = 28;
/** Keeps the edge strip clear of the header, whose right slot holds a real button. */
const EDGE_TOP_OFFSET = 60;

/**
 * Custom drawer, built directly on Reanimated + gesture-handler rather than on the
 * navigator's built-in one.
 *
 * Two reasons: the transition needs direct access to a progress value to drive a
 * perspective transform, and the panel has to sit on the right for an RTL layout.
 *
 * The gesture deliberately does *not* wrap the screen content. An always-on Pan over the
 * whole app swallows taps on children, which was verified in the browser: every button
 * under it stopped responding. Instead the pan lives on two small surfaces, a right-edge
 * strip that exists only while closed and the scrim that exists only while open. Content
 * is never underneath a gesture handler, so presses always reach it.
 */
export function DrawerShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(320, width * 0.82);

  const progress = useSharedValue(0);
  const [isOpen, setIsOpen] = useState(false);
  const startProgress = useSharedValue(0);

  const open = useCallback(() => {
    setIsOpen(true);
    progress.value = withSpring(1, spring);
  }, [progress]);

  const close = useCallback(() => {
    setIsOpen(false);
    progress.value = withSpring(0, spring);
  }, [progress]);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  /** One pan definition, instantiated twice: a Gesture object can only be attached once. */
  const makePan = useCallback(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .failOffsetY([-18, 18])
        .onBegin(() => {
          startProgress.value = progress.value;
        })
        .onUpdate((e) => {
          // Dragging left (negative translationX) opens the right-hand drawer.
          const delta = -e.translationX / drawerWidth;
          progress.value = Math.min(1, Math.max(0, startProgress.value + delta));
        })
        .onEnd((e) => {
          const flungOpen = -e.velocityX > 550;
          const flungClosed = e.velocityX > 550;
          const shouldOpen = flungOpen || (!flungClosed && progress.value > 0.5);
          progress.value = withSpring(shouldOpen ? 1 : 0, spring);
          runOnJS(setIsOpen)(shouldOpen);
        }),
    [drawerWidth, progress, startProgress],
  );

  const edgePan = useMemo(() => makePan(), [makePan]);

  // On the scrim, a tap closes and a drag scrubs. Race so whichever the finger does wins.
  const scrimGesture = useMemo(
    () =>
      Gesture.Race(
        makePan(),
        Gesture.Tap().onEnd(() => {
          runOnJS(close)();
        }),
      ),
    [makePan, close],
  );

  /**
   * The 3D tip. `perspective` must come first in the transform list: without it rotateY
   * flattens into a horizontal squash and the depth effect disappears entirely.
   */
  const contentStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      transform: [
        { perspective: 900 },
        { translateX: interpolate(p, [0, 1], [0, -drawerWidth * 0.78]) },
        { scale: interpolate(p, [0, 1], [1, 0.86]) },
        { rotateY: `${interpolate(p, [0, 1], [0, 8])}deg` },
      ],
      borderRadius: interpolate(p, [0, 1], [0, radius.xl]),
    };
  });

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.55]),
  }));

  const panelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.35, 1], [0, 0.2, 1]),
    transform: [{ translateX: interpolate(progress.value, [0, 1], [drawerWidth * 0.25, 0]) }],
  }));

  const api = useMemo<DrawerApi>(
    () => ({ open, close, toggle, isOpen, progress }),
    [open, close, toggle, isOpen, progress],
  );

  return (
    <DrawerContext.Provider value={api}>
      <View style={styles.root}>
        <Animated.View style={[styles.panel, { width: drawerWidth }, panelStyle]}>
          <DrawerContent onNavigate={close} />
        </Animated.View>

        <Animated.View style={[styles.content, contentStyle]}>
          <Aurora paused={isOpen} />
          {children}

          {isOpen ? (
            <GestureDetector gesture={scrimGesture}>
              <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]} />
            </GestureDetector>
          ) : null}
        </Animated.View>

        {/* Sits above the content so an edge swipe wins, but only while closed. */}
        {!isOpen ? (
          <GestureDetector gesture={edgePan}>
            <View style={[styles.edgeStrip, { width: EDGE_ZONE }]} />
          </GestureDetector>
        ) : null}
      </View>
    </DrawerContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.raised,
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.bg.base,
    ...shadow.drawerLift,
  },
  scrim: {
    backgroundColor: colors.bg.scrim,
  },
  edgeStrip: {
    position: 'absolute',
    top: EDGE_TOP_OFFSET,
    bottom: 0,
    right: 0,
  },
});
