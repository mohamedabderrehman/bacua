import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Pressable } from '../ui/Pressable';
import { Row } from '../ui/Row';
import { Text } from '../ui/Text';
import { colors, radius, shadow, space } from '@/theme/tokens';

export type CtaButtonProps = {
  label: string;
  onPress?: () => void;
  /** `primary` is the copper gradient; `ghost` is a glass surface. */
  variant?: 'primary' | 'ghost';
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
};

/**
 * The app's call-to-action button.
 *
 * Primary uses a real gradient plus a copper halo rather than a flat fill — at this size
 * a solid block reads cheap against the dark canvas, while the gradient picks up the same
 * light direction as the glass cards.
 */
export function CtaButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
}: CtaButtonProps) {
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      scaleTo={0.97}
      haptic="medium"
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      style={[styles.base, isPrimary && !inactive ? shadow.glow : null]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={
            inactive
              ? [colors.glass.fillHi, colors.glass.fill]
              : [colors.accent.light, colors.accent.base]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.ghost]} />
      )}

      <Row gap={space.sm} justify="center" style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={isPrimary ? colors.text.onAccent : colors.text.hi}
          />
        ) : (
          <>
            {icon}
            <Text
              variant="bodyStrong"
              color={
                inactive
                  ? colors.text.low
                  : isPrimary
                    ? colors.text.onAccent
                    : colors.text.hi
              }
            >
              {label}
            </Text>
          </>
        )}
      </Row>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  ghost: {
    backgroundColor: colors.glass.fill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    borderRadius: radius.md,
  },
  content: {
    paddingVertical: space.lg - 1,
    paddingHorizontal: space.lg,
  },
});
