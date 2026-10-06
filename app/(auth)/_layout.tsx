import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';

import { Aurora } from '@/components/Aurora';
import { colors } from '@/theme/tokens';

/**
 * Auth shell: the Aurora, and nothing else.
 *
 * `animation: 'none'` is deliberate. Screens here are transparent so the single shared
 * Aurora shows through, and a sliding transition between two transparent screens renders
 * both of them over that one backdrop at once — which reads as the screens overlapping
 * and flashing. Motion inside a screen (the sign-up steps) is animated instead, where
 * only one screen is ever on-screen and the effect is clean.
 */
export default function AuthLayout() {
  return (
    <View style={styles.root}>
      <Aurora />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'none',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
});
