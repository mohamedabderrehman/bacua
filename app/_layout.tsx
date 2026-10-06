import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  IBMPlexSansArabic_300Light,
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
  useFonts,
} from '@expo-google-fonts/ibm-plex-sans-arabic';

import { colors } from '@/theme/tokens';
import { loadSkia } from '@/utils/skiaLoader';
import { useAuth } from '@/store/auth';
import { useSettings } from '@/store/settings';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexSansArabic_300Light,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  });

  // On web this fetches CanvasKit's WebAssembly; on native it resolves immediately.
  // Nothing may render until it settles — the first Skia view would otherwise throw.
  const [skiaReady, setSkiaReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void loadSkia().finally(() => {
      if (!cancelled) setSkiaReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const settingsHydrated = useSettings((s) => s.hydrated);
  const authHydrated = useAuth((s) => s.hydrated);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  const segments = useSegments();
  const router = useRouter();

  const fontsReady = fontsLoaded || Boolean(fontError);
  const ready = fontsReady && settingsHydrated && authHydrated && skiaReady;

  // Follow the OS accessibility preference until the user overrides it in settings.
  useEffect(() => {
    if (!settingsHydrated) return;
    if (useSettings.getState().reduceMotionTouched) return;

    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!cancelled && enabled) useSettings.getState().setReduceMotion(true, true);
    });
    return () => {
      cancelled = true;
    };
  }, [settingsHydrated]);

  /**
   * Auth gate. Runs only once everything is hydrated, otherwise the first frame would
   * bounce a signed-in user out to the welcome screen before storage has loaded.
   */
  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) router.replace('/welcome');
    else if (isAuthenticated && inAuthGroup) router.replace('/');
  }, [ready, isAuthenticated, segments, router]);

  // Hold the splash until fonts, stored state and Skia are all ready — otherwise the UI
  // flashes system fonts and default values for a frame.
  const onReady = useCallback(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Text style={{color:colors.text.mid,textAlign:"center",padding:6,fontSize:12}}>عرض واجهة — تسجيل الدخول والمساعد محاكاة محلية</Text>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg.base },
            // Group-level swaps are instant; each group animates internally.
            animation: 'none',
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
});
