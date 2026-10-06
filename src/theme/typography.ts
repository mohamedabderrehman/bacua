/**
 * Typography for an Arabic-first UI.
 *
 * Two rules drive everything here:
 *  1. Arabic needs noticeably more leading than Latin — body runs at 1.75, not 1.4.
 *  2. Never apply letterSpacing to Arabic. It breaks glyph joining and renders the
 *     word as disconnected letters. No variant below sets it.
 */

export const fonts = {
  light: 'IBMPlexSansArabic_300Light',
  regular: 'IBMPlexSansArabic_400Regular',
  medium: 'IBMPlexSansArabic_500Medium',
  semibold: 'IBMPlexSansArabic_600SemiBold',
  bold: 'IBMPlexSansArabic_700Bold',
} as const;

export type FontWeightName = keyof typeof fonts;

export type TypeVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'mono';

type VariantSpec = {
  fontSize: number;
  lineHeight: number;
  font: FontWeightName;
};

export const variants: Record<TypeVariant, VariantSpec> = {
  display: { fontSize: 30, lineHeight: 44, font: 'bold' },
  title: { fontSize: 24, lineHeight: 36, font: 'semibold' },
  heading: { fontSize: 19, lineHeight: 30, font: 'semibold' },
  subheading: { fontSize: 17, lineHeight: 28, font: 'medium' },
  body: { fontSize: 16, lineHeight: 28, font: 'regular' },
  bodyStrong: { fontSize: 16, lineHeight: 28, font: 'medium' },
  caption: { fontSize: 13, lineHeight: 22, font: 'regular' },
  label: { fontSize: 14, lineHeight: 22, font: 'medium' },
  // Latin-only contexts (formulas, code). Arabic never routes here.
  mono: { fontSize: 14, lineHeight: 24, font: 'regular' },
};

/** User-selectable text scale from settings. Applied in the Text primitive. */
export const textScales = {
  sm: 0.92,
  md: 1,
  lg: 1.12,
} as const;

export type TextScaleName = keyof typeof textScales;
