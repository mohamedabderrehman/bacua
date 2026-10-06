import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, LinearGradient, RoundedRect, vec } from '@shopify/react-native-skia';
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors } from '@/theme/tokens';
import { isSkiaAvailable } from '@/utils/skiaLoader';
import { useSettings } from '@/store/settings';

const BAR_COUNT = 9;
const TAU = Math.PI * 2;

/** Height envelope: tallest at the centre, tapering symmetrically to the edges. */
function envelopeAt(index: number): number {
  const mid = (BAR_COUNT - 1) / 2;
  return Math.cos(((index - mid) / mid) * (Math.PI / 2.35));
}

export type LogoMarkProps = {
  /** Overall width. Height is derived at a 1:1.15 ratio to match the mark's proportions. */
  size?: number;
  /**
   * Amplifies the motion while a response is generating, turning the mark into the
   * app's loading indicator instead of adding a separate spinner.
   */
  thinking?: boolean;
};

/**
 * The BACUA mark: a diamond of vertical bars under a copper gradient.
 *
 * Every bar draws its own gradient, but they all share the same canvas-space start and
 * end points, so the result reads as one continuous gradient across the whole mark.
 */
export function LogoMark({ size = 72, thinking = false }: LogoMarkProps) {
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const height = size * 1.15;
  const clock = useSharedValue(0);

  const animate = !reduceMotion;

  useEffect(() => {
    if (!animate) {
      cancelAnimation(clock);
      clock.value = 0;
      return;
    }
    clock.value = withRepeat(
      withTiming(1, { duration: thinking ? 1100 : 3600, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(clock);
  }, [animate, thinking, clock]);

  const barWidth = size / (BAR_COUNT * 1.9);
  const gap = (size - barWidth * BAR_COUNT) / (BAR_COUNT - 1);
  const amplitude = thinking ? 0.34 : 0.07;

  // Web without CanvasKit: draw the same silhouette with plain views rather than
  // mounting a Skia canvas, which would throw and crash the app.
  if (!isSkiaAvailable()) {
    return (
      <View style={[styles.fallback, { width: size, height }]}>
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <View
            key={i}
            style={{
              width: barWidth,
              height: height * (0.16 + 0.84 * envelopeAt(i)),
              borderRadius: barWidth / 2,
              backgroundColor: i % 2 === 0 ? colors.accent.base : colors.accent.light,
            }}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={{ width: size, height }}>
      <Canvas style={{ width: size, height }}>
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <Bar
            key={i}
            index={i}
            clock={clock}
            x={i * (barWidth + gap)}
            width={barWidth}
            canvasHeight={height}
            amplitude={amplitude}
          />
        ))}
      </Canvas>
    </View>
  );
}

function Bar({
  index,
  clock,
  x,
  width,
  canvasHeight,
  amplitude,
}: {
  index: number;
  clock: SharedValue<number>;
  x: number;
  width: number;
  canvasHeight: number;
  amplitude: number;
}) {
  const restHeight = canvasHeight * (0.16 + 0.84 * envelopeAt(index));
  const phase = (index / BAR_COUNT) * TAU;

  const barHeight = useDerivedValue(() => {
    'worklet';
    const wave = Math.sin(clock.value * TAU + phase);
    return restHeight * (1 + wave * amplitude);
  }, [restHeight, amplitude]);

  const y = useDerivedValue(() => {
    'worklet';
    return (canvasHeight - barHeight.value) / 2;
  }, [canvasHeight]);

  return (
    <RoundedRect x={x} y={y} width={width} height={barHeight} r={width / 2}>
      <LinearGradient
        start={vec(0, 0)}
        end={vec(0, canvasHeight)}
        colors={[colors.accent.light, colors.accent.base, colors.accent.deep]}
      />
    </RoundedRect>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
