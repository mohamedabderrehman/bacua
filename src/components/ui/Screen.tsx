import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ScreenProps = ViewProps & {
  /** Apply top safe-area padding. Off when the screen renders its own floating header. */
  topInset?: boolean;
  bottomInset?: boolean;
  children?: React.ReactNode;
};

/**
 * Screen container. Deliberately transparent — the Aurora canvas lives behind all
 * screens inside the drawer shell, so an opaque background here would hide it.
 */
export function Screen({
  topInset = true,
  bottomInset = false,
  style,
  children,
  ...rest
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      {...rest}
      style={[
        {
          flex: 1,
          paddingTop: topInset ? insets.top : 0,
          paddingBottom: bottomInset ? insets.bottom : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
