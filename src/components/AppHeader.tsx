import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Menu } from 'lucide-react-native';

import { LogoMark } from './LogoMark';
import { Pressable } from './ui/Pressable';
import { Text } from './ui/Text';
import { useDrawer } from './DrawerShell';
import { colors, radius, space } from '@/theme/tokens';

export type AppHeaderProps = {
  title?: string;
  /** Show the animated mark beside the title. Used on the chat screen only. */
  showLogo?: boolean;
  right?: ReactNode;
};

/**
 * Shared top bar.
 *
 * Laid out left-to-right despite the RTL app: the brief puts the menu button in the top
 * *left* corner, so this row is one of the few places where explicit LTR is correct.
 * The title is absolutely centred so it stays put regardless of what the side slots hold.
 */
export function AppHeader({ title, showLogo = false, right }: AppHeaderProps) {
  const drawer = useDrawer();

  return (
    <View style={styles.root}>
      <Pressable
        onPress={drawer.toggle}
        scaleTo={0.9}
        haptic="medium"
        accessibilityRole="button"
        accessibilityLabel="القائمة"
        style={styles.iconButton}
      >
        <Menu size={22} color={colors.text.hi} strokeWidth={2.2} />
      </Pressable>

      <View style={styles.center}>
        {showLogo ? <LogoMark size={20} /> : null}
        {title ? (
          <Text variant="subheading" weight="semibold" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightSlot}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    height: 52,
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    // Centred over the side slots, so it must never intercept their touches.
    pointerEvents: 'none',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSlot: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
