import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Eye, EyeOff } from 'lucide-react-native';

import { Pressable } from '../ui/Pressable';
import { Row } from '../ui/Row';
import { Text } from '../ui/Text';
import { colors, radius, space } from '@/theme/tokens';
import { fonts, textScales, variants } from '@/theme/typography';
import { useSettings } from '@/store/settings';

export type FieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string | null;
  /** Renders a show/hide toggle and masks the value. */
  secure?: boolean;
  /** Latin content (email, phone) reads left-to-right even in an RTL screen. */
  ltr?: boolean;
};

/**
 * Labelled input for the auth screens.
 *
 * Focus is signalled with the accent border rather than a platform outline, and the error
 * replaces nothing — it appears beneath, so the field never jumps as validation toggles.
 */
export function Field({ label, error, secure = false, ltr = false, ...rest }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);
  const scaleName = useSettings((s) => s.textScale);
  const scale = textScales[scaleName];

  const borderColor = error
    ? colors.danger
    : focused
      ? colors.accent.base
      : colors.glass.border;

  return (
    <View style={styles.root}>
      <Text variant="caption" color={colors.text.mid} style={styles.label}>
        {label}
      </Text>

      <Row
        gap={space.sm}
        style={[
          styles.box,
          { borderColor, backgroundColor: focused ? colors.glass.fillHi : colors.glass.fill },
        ]}
      >
        <TextInput
          {...rest}
          secureTextEntry={secure && hidden}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={colors.text.low}
          style={[
            styles.input,
            {
              fontFamily: fonts.regular,
              fontSize: Math.round(variants.body.fontSize * scale),
              textAlign: ltr ? 'left' : 'right',
              writingDirection: ltr ? 'ltr' : 'rtl',
            },
          ]}
        />

        {secure ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            scaleTo={0.9}
            accessibilityLabel={hidden ? 'إظهار كلمة السر' : 'إخفاء كلمة السر'}
            style={styles.eye}
          >
            {hidden ? (
              <Eye size={18} color={colors.text.low} strokeWidth={2} />
            ) : (
              <EyeOff size={18} color={colors.accent.base} strokeWidth={2} />
            )}
          </Pressable>
        ) : null}
      </Row>

      {error ? (
        <Animated.View entering={FadeIn.duration(160)}>
          <Text variant="caption" color={colors.danger} style={styles.error}>
            {error}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 6,
  },
  label: {
    paddingHorizontal: space.xs,
  },
  box: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: space.md,
  },
  input: {
    flex: 1,
    color: colors.text.hi,
    paddingVertical: space.md + 2,
  },
  eye: {
    padding: space.xs,
  },
  error: {
    paddingHorizontal: space.xs,
  },
});
