import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, Info, LogIn } from 'lucide-react-native';

import { CtaButton } from '@/components/auth/CtaButton';
import { Field } from '@/components/auth/Field';
import { LogoMark } from '@/components/LogoMark';
import { Pressable } from '@/components/ui/Pressable';
import { Row } from '@/components/ui/Row';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { ar } from '@/i18n/ar';
import { colors, radius, space } from '@/theme/tokens';
import { useAuth } from '@/store/auth';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signIn = useAuth((s) => s.signIn);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  function submit() {
    const found: typeof errors = {};
    if (identifier.trim().length === 0) found.identifier = ar.login.errIdentifier;
    if (password.length === 0) found.password = ar.login.errPassword;
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // No backend yet: any credentials are accepted. The short delay is honest UI —
    // a real request will take at least this long, so the button should behave now
    // the way it will behave then.
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      signIn(identifier, password);
    }, 550);
  }

  return (
    <Screen style={styles.root}>
      <Row style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          scaleTo={0.9}
          accessibilityLabel={ar.common.back}
          style={styles.backButton}
        >
          <ChevronRight size={22} color={colors.text.hi} strokeWidth={2.2} />
        </Pressable>
      </Row>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 60}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
            <LogoMark size={56} />
            <Text variant="title" weight="semibold" align="center" style={styles.title}>
              {ar.login.title}
            </Text>
            <Text variant="body" color={colors.text.mid} align="center">
              {ar.login.subtitle}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(140).duration(460).springify().damping(20)}
            style={styles.form}
          >
            <Field
              label={ar.login.identifier}
              placeholder={ar.login.identifierPlaceholder}
              value={identifier}
              onChangeText={setIdentifier}
              error={errors.identifier}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              ltr
            />
            <Field
              label={ar.login.password}
              placeholder={ar.login.passwordPlaceholder}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secure
              autoCapitalize="none"
              ltr
            />

            <Pressable onPress={() => undefined} scaleTo={0.97} style={styles.forgot}>
              <Text variant="caption" color={colors.accent.light}>
                {ar.login.forgot}
              </Text>
            </Pressable>

            <CtaButton
              label={ar.login.submit}
              onPress={submit}
              loading={busy}
              icon={<LogIn size={18} color={colors.text.onAccent} strokeWidth={2.4} />}
            />

            <Row gap={space.sm} align="flex-start" style={styles.demoNote}>
              <Info size={15} color={colors.accent.base} strokeWidth={2} style={styles.demoIcon} />
              <Text variant="caption" color={colors.accent.light} style={styles.demoText}>
                {ar.login.demoNote}
              </Text>
            </Row>
          </Animated.View>
        </ScrollView>

        <Row gap={6} justify="center" style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
          <Text variant="caption" color={colors.text.mid}>
            {ar.login.noAccount}
          </Text>
          <Pressable onPress={() => router.replace('/signup')} scaleTo={0.96}>
            <Text variant="caption" weight="semibold" color={colors.accent.light}>
              {ar.login.createOne}
            </Text>
          </Pressable>
        </Row>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: space.xl,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingVertical: space.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -space.md,
  },
  content: {
    paddingBottom: space.xl,
  },
  hero: {
    alignItems: 'center',
    gap: space.xs,
    marginTop: space.xl,
    marginBottom: space.xxl,
  },
  title: {
    marginTop: space.lg,
  },
  form: {
    gap: space.lg,
  },
  forgot: {
    alignSelf: 'flex-start',
    marginTop: -space.sm,
  },
  demoNote: {
    backgroundColor: colors.accent.wash,
    borderRadius: radius.md,
    padding: space.md,
  },
  demoIcon: {
    marginTop: 3,
  },
  demoText: {
    flex: 1,
  },
  footer: {
    paddingTop: space.md,
  },
});
