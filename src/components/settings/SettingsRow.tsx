import type { ReactNode } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Pressable } from '../ui/Pressable';
import { Row } from '../ui/Row';
import { Text } from '../ui/Text';
import { colors, radius, space } from '@/theme/tokens';

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="caption" color={colors.text.low} style={styles.sectionTitle}>
        {title}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export type SettingsRowProps = {
  label: string;
  hint?: string;
  /** Right-hand control: a switch, value text, chevron, whatever the row needs. */
  right?: ReactNode;
  onPress?: () => void;
  danger?: boolean;
  /** Renders below the label row — used for full-width controls like the size picker. */
  below?: ReactNode;
  /** Drops the divider so the section doesn't end on a stray hairline. */
  last?: boolean;
};

export function SettingsRow({ label, hint, right, onPress, danger, below, last }: SettingsRowProps) {
  const content = (
    <View style={[styles.row, last ? styles.rowLast : null]}>
      <Row justify="space-between" gap={space.md}>
        <View style={styles.labelBlock}>
          <Text variant="subheading" color={danger ? colors.danger : colors.text.hi}>
            {label}
          </Text>
          {hint ? (
            <Text variant="caption" color={colors.text.low}>
              {hint}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.rightSlot}>{right}</View> : null}
      </Row>
      {below ? <View style={styles.below}>{below}</View> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} scaleTo={0.985} haptic={danger ? 'medium' : 'light'}>
      {content}
    </Pressable>
  );
}

/** Switch styled to the app's accent, with the platform defaults neutralised. */
export function SettingsSwitch({
  value,
  onValueChange,
  disabled,
}: {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: colors.glass.fillHi, true: colors.accent.deep }}
      thumbColor={value ? colors.accent.light : colors.text.low}
      ios_backgroundColor={colors.glass.fillHi}
      style={disabled ? styles.disabled : undefined}
    />
  );
}

/** Segmented picker used for the text-size setting. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <Row gap={4} style={styles.segmented}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            scaleTo={0.95}
            style={[styles.segment, active ? styles.segmentActive : null]}
          >
            <Text
              variant="caption"
              weight={active ? 'semibold' : 'regular'}
              color={active ? colors.accent.light : colors.text.mid}
              align="center"
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </Row>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: space.xl,
  },
  sectionTitle: {
    marginBottom: space.sm,
    paddingHorizontal: space.xs,
  },
  sectionBody: {
    backgroundColor: colors.glass.fill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glass.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  labelBlock: {
    flex: 1,
    gap: 1,
  },
  rightSlot: {
    alignItems: 'flex-start',
  },
  below: {
    marginTop: space.md,
  },
  disabled: {
    opacity: 0.5,
  },
  segmented: {
    backgroundColor: colors.bg.sunken,
    borderRadius: radius.md,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.accent.wash,
  },
});
