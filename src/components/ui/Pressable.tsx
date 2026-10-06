import { useCallback } from 'react';
import { Pressable as RNPressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { springSnappy } from '@/theme/tokens';
import { useSettings } from '@/store/settings';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export type PressProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** How far the surface sinks on press. Large surfaces need less. */
  scaleTo?: number;
  haptic?: 'light' | 'medium' | 'none';
  children?: React.ReactNode;
};

/**
 * Every tappable surface in the app.
 *
 * The scale + haptic pairing is the app's core touch feel — routing all presses through
 * here is what keeps it consistent, and gives the haptics setting a single kill switch.
 */
export function Pressable({
  style,
  scaleTo = 0.97,
  haptic = 'light',
  onPressIn,
  disabled,
  children,
  ...rest
}: PressProps) {
  const hapticsEnabled = useSettings((s) => s.haptics);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    (e) => {
      scale.value = withSpring(scaleTo, springSnappy);
      if (hapticsEnabled && haptic !== 'none') {
        void Haptics.impactAsync(
          haptic === 'medium'
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light,
        );
      }
      onPressIn?.(e);
    },
    [scale, scaleTo, hapticsEnabled, haptic, onPressIn],
  );

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={() => {
        scale.value = withSpring(1, springSnappy);
      }}
      style={[style, animatedStyle, disabled ? { opacity: 0.4 } : null]}
    >
      {children}
    </AnimatedPressable>
  );
}
