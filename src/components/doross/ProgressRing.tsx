import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '../ui/Text';
import { colors } from '@/theme/tokens';

export type ProgressRingProps = {
  /** 0–1. */
  ratio: number;
  size?: number;
  stroke?: number;
  color?: string;
  /** Percentage label in the middle. Off for very small rings. */
  showLabel?: boolean;
};

/**
 * Small completion ring on each subject card.
 *
 * Drawn with react-native-svg rather than Skia on purpose: this renders once per card in
 * a scrolling grid, and a dozen Skia canvases cost far more than a dozen SVG views for a
 * shape this simple. Skia earns its keep on the full-screen Aurora, not here.
 */
export function ProgressRing({
  ratio,
  size = 44,
  stroke = 4,
  color = colors.accent.base,
  showLabel = true,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.glass.fillHi}
          strokeWidth={stroke}
          fill="none"
        />
        {clamped > 0 ? (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference * clamped} ${circumference}`}
            // Start the arc at 12 o'clock instead of 3 o'clock.
            transform={`rotate(-90 ${center} ${center})`}
          />
        ) : null}
      </Svg>
      {showLabel ? (
        <Text variant="caption" weight="semibold" color={colors.text.mid} ltr style={{ fontSize: size * 0.24 }}>
          {`${Math.round(clamped * 100)}%`}
        </Text>
      ) : null}
    </View>
  );
}
