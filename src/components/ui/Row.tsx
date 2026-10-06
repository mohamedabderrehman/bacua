import { View, type ViewProps, type ViewStyle } from 'react-native';

export type RowProps = ViewProps & {
  gap?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  /** Lay out left-to-right instead. Used for content that is inherently LTR. */
  ltr?: boolean;
  wrap?: boolean;
};

/**
 * Horizontal stack that flows right-to-left by default.
 *
 * We do not use `I18nManager.forceRTL` (see the RTL note in the plan), so direction is
 * expressed explicitly here: `row-reverse` puts the first child on the right, which is
 * where an Arabic reader starts.
 */
export function Row({
  gap = 0,
  align = 'center',
  justify = 'flex-start',
  ltr = false,
  wrap = false,
  style,
  ...rest
}: RowProps) {
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: ltr ? 'row' : 'row-reverse',
          alignItems: align,
          justifyContent: justify,
          gap,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
    />
  );
}
