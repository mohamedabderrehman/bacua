import { useEffect } from 'react';
import { AppState, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Canvas, Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';
import { LinearGradient } from 'expo-linear-gradient';
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { auroraColors, colors } from '@/theme/tokens';
import { isSkiaAvailable } from '@/utils/skiaLoader';
import { useSettings } from '@/store/settings';

/**
 * Each blob orbits on its own ellipse at its own rate. Co-prime-ish periods keep the
 * composition from visibly looping — the eye spots a repeat almost immediately when
 * every blob shares one period.
 */
const BLOBS = [
  { size: 0.95, ox: 0.16, oy: 0.14, ax: 0.22, ay: 0.1, speed: 1, phase: 0 },
  { size: 1.1, ox: 0.86, oy: 0.3, ax: 0.18, ay: 0.14, speed: 0.72, phase: 1.7 },
  { size: 0.85, ox: 0.3, oy: 0.72, ax: 0.24, ay: 0.12, speed: 0.55, phase: 3.1 },
  { size: 0.7, ox: 0.78, oy: 0.88, ax: 0.16, ay: 0.16, speed: 0.86, phase: 4.4 },
] as const;

const CYCLE_MS = 32_000;
const TAU = Math.PI * 2;

export type AuroraProps = {
  /** Freeze the animation — passed while the drawer is open, where it isn't visible. */
  paused?: boolean;
};

/**
 * The animated backdrop that gives the app its depth.
 *
 * Two deliberate perf choices:
 *  - No blur layer. Radial gradients with a fully transparent outer stop already read as
 *    soft blobs; a Skia blur pass over a full-screen canvas costs far more than it adds.
 *  - One clock drives every blob through `useDerivedValue`, so the whole backdrop
 *    animates on the UI thread with zero React re-renders.
 *
 * When reduce-motion is on we drop Skia entirely rather than merely stopping the clock —
 * on low-end Android even a static GPU canvas is worth reclaiming.
 */
export function Aurora({ paused = false }: AuroraProps) {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const clock = useSharedValue(0);

  // On web, CanvasKit may have failed to load. Mounting a Skia <Canvas> then throws
  // "CanvasKit is not defined" and takes the whole app down, so fall back instead.
  const canUseSkia = isSkiaAvailable();
  const shouldAnimate = !reduceMotion && !paused && canUseSkia;

  useEffect(() => {
    if (!shouldAnimate) {
      cancelAnimation(clock);
      return;
    }
    clock.value = withRepeat(
      withTiming(1, { duration: CYCLE_MS, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(clock);
  }, [shouldAnimate, clock]);

  // Backgrounded apps should not be driving a render loop.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') cancelAnimation(clock);
      else if (shouldAnimate) {
        clock.value = withRepeat(
          withTiming(1, { duration: CYCLE_MS, easing: Easing.linear }),
          -1,
          false,
        );
      }
    });
    return () => sub.remove();
  }, [shouldAnimate, clock]);

  if (reduceMotion || !canUseSkia) {
    return <StaticAurora />;
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.noTouch]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg.base }]} />
      <Canvas style={StyleSheet.absoluteFill}>
        {BLOBS.map((blob, index) => (
          <Blob key={index} blob={blob} index={index} clock={clock} w={width} h={height} />
        ))}
      </Canvas>
    </View>
  );
}

function Blob({
  blob,
  index,
  clock,
  w,
  h,
}: {
  blob: (typeof BLOBS)[number];
  index: number;
  clock: SharedValue<number>;
  w: number;
  h: number;
}) {
  const radius = Math.max(w, h) * 0.55 * blob.size;
  const palette = auroraColors[index % auroraColors.length]!;

  const transform = useDerivedValue(() => {
    'worklet';
    const t = clock.value * TAU * blob.speed + blob.phase;
    return [
      { translateX: w * blob.ox + Math.sin(t) * w * blob.ax },
      { translateY: h * blob.oy + Math.cos(t * 0.8) * h * blob.ay },
    ];
  }, [w, h]);

  return (
    <Group transform={transform}>
      <Circle c={vec(0, 0)} r={radius}>
        <RadialGradient c={vec(0, 0)} r={radius} colors={[palette[0], palette[1]]} />
      </Circle>
    </Group>
  );
}

const styles = StyleSheet.create({
  noTouch: {
    pointerEvents: 'none',
  },
});

/** Reduce-motion fallback: no canvas, no clock, two cheap gradients. */
function StaticAurora() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.noTouch, { backgroundColor: colors.bg.base }]}>
      <LinearGradient
        colors={['rgba(232,134,63,0.16)', 'transparent']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.8, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(120,86,196,0.14)']}
        start={{ x: 0.2, y: 0.4 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
