import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Pressable } from './Pressable';
import { Row } from './Row';
import { Text } from './Text';
import { colors, radius, shadow, space } from '@/theme/tokens';

export type ChipProps = {
  label: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
};

/**
 * Pill control used for the composer toggles, stream selector and suggestion prompts.
 * Active state uses the accent wash plus a soft halo rather than a solid fill — a solid
 * copper pill overpowers the dark canvas at this size.
 */
export function Chip({
  label,
  icon,
  trailing,
  active = false,
  onPress,
  size = 'md',
  disabled = false,
}: ChipProps) {
  const pad = size === 'sm' ? space.sm : space.md;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.94}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      style={[
        styles.base,
        {
          paddingHorizontal: pad + 2,
          paddingVertical: size === 'sm' ? 6 : 9,
          backgroundColor: active ? colors.accent.wash : colors.glass.fill,
          borderColor: active ? colors.accent.washBorder : colors.glass.border,
        },
        active ? styles.activeGlow : null,
      ]}
    >
      <Row gap={6}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text
          variant={size === 'sm' ? 'caption' : 'label'}
          color={active ? colors.accent.light : colors.text.mid}
          numberOfLines={1}
        >
          {label}
        </Text>
        {trailing ? <View style={styles.icon}>{trailing}</View> : null}
      </Row>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeGlow: {
    ...shadow.glow,
    shadowOpacity: 0.28,
    shadowRadius: 12,
  },
});
