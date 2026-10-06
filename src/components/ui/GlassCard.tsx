import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, radius } from '@/theme/tokens';

export type GlassCardProps = ViewProps & {
  /** Corner radius. Must be passed to the blur layer too, or blur leaks past the corners. */
  r?: number;
  intensity?: number;
  /**
   * Real gaussian blur is expensive — a full BlurView per row will drop frames on
   * mid-range Android. Chrome (header, composer, drawer) uses blur; anything inside a
   * scrolling list should pass `blur={false}` and rely on the translucent fill alone,
   * which is visually near-identical over the dark canvas.
   */
  blur?: boolean;
  /** Slightly brighter fill, for focused or active surfaces. */
  active?: boolean;
  /** The 1px top-edge highlight. Off for small pills where it reads as an artifact. */
  highlight?: boolean;
  fill?: string;
  borderColor?: string;
  children?: React.ReactNode;
};

/**
 * The app's one elevated surface.
 *
 * Depth comes from three stacked layers, not a single fill: blur, a translucent white
 * wash, and a hairline border topped by a bright edge. That top edge is doing most of
 * the work — without it the card reads as a flat rectangle.
 */
export function GlassCard({
  r = radius.lg,
  intensity = 40,
  blur = true,
  active = false,
  highlight = true,
  fill,
  borderColor,
  style,
  children,
  ...rest
}: GlassCardProps) {
  const surface: ViewStyle = {
    borderRadius: r,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: borderColor ?? colors.glass.border,
    backgroundColor: fill ?? (active ? colors.glass.fillHi : colors.glass.fill),
  };

  return (
    <View {...rest} style={[surface, style]}>
      {blur ? (
        <BlurView
          intensity={intensity}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={[StyleSheet.absoluteFill, styles.noTouch, { borderRadius: r }]}
        />
      ) : null}

      {/* Fill sits above the blur so the wash reads consistently on both platforms. */}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.noTouch,
          { backgroundColor: fill ?? (active ? colors.glass.fillHi : colors.glass.fill) },
        ]}
      />

      {highlight ? (
        <LinearGradient
          colors={['transparent', colors.glass.highlight, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topEdge}
        />
      ) : null}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  noTouch: {
    pointerEvents: 'none',
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: '8%',
    right: '8%',
    height: 1,
    pointerEvents: 'none',
  },
});
