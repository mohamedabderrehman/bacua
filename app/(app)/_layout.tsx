import { Stack } from 'expo-router';

import { DrawerShell } from '@/components/DrawerShell';

/**
 * The signed-in app: drawer shell wrapping the screens.
 *
 * `animation: 'none'` fixes the flicker where screens visibly overlapped mid-navigation.
 * Every screen here is transparent so the Aurora inside DrawerShell shows through, and a
 * sliding transition draws both the outgoing and incoming screen over that one backdrop
 * at the same time — two sets of Arabic text sliding across each other. Chat, دروس and
 * الإعدادات are peer destinations reached from the drawer, so they should swap instantly
 * anyway; the drawer's own close animation already supplies the sense of movement.
 *
 * The lesson route is a push rather than a peer swap, so it animates its content in
 * itself, inside the screen, where nothing can overlap.
 */
export default function AppLayout() {
  return (
    <DrawerShell>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'none',
        }}
      />
    </DrawerShell>
  );
}
