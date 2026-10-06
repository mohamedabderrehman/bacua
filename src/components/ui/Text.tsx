import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { colors } from '@/theme/tokens';
import {
  fonts,
  variants,
  textScales,
  type FontWeightName,
  type TypeVariant,
} from '@/theme/typography';
import { useSettings } from '@/store/settings';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  weight?: FontWeightName;
  color?: string;
  align?: TextStyle['textAlign'];
  /** Opt out of RTL defaults for Latin-only content (version numbers, formulas). */
  ltr?: boolean;
};

/**
 * The only Text in the app.
 *
 * Carries the RTL defaults (right align + rtl writing direction) so no screen has to
 * remember them, and applies the user's text-scale setting to both fontSize and
 * lineHeight — scaling one without the other is what makes Arabic text collide.
 */
export function Text({
  variant = 'body',
  weight,
  color = colors.text.hi,
  align,
  ltr = false,
  style,
  ...rest
}: TextProps) {
  const scaleName = useSettings((s) => s.textScale);
  const scale = textScales[scaleName];

  const spec = variants[variant];
  const fontFamily = fonts[weight ?? spec.font];

  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily,
          fontSize: Math.round(spec.fontSize * scale),
          lineHeight: Math.round(spec.lineHeight * scale),
          color,
          textAlign: align ?? (ltr ? 'left' : 'right'),
          writingDirection: ltr ? 'ltr' : 'rtl',
        },
        style,
      ]}
    />
  );
}
