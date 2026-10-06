import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, ChevronRight } from 'lucide-react-native';

import { CtaButton } from '@/components/auth/CtaButton';
import { Field } from '@/components/auth/Field';
import { Pressable } from '@/components/ui/Pressable';
import { Row } from '@/components/ui/Row';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { ar } from '@/i18n/ar';
import { streams, subjectsForStream, type StreamId } from '@/data/curriculum';
import { colors, radius, space } from '@/theme/tokens';
import { useAuth, type SignUpDraft } from '@/store/auth';

const TOTAL_STEPS = 4;

/** Arabic letters and spaces only — the brief asks for the name in Arabic. */
const ARABIC_NAME = /^[ء-يٰ-ۓ\s]{2,}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Algerian mobile: 05/06/07 followed by eight digits. */
const DZ_PHONE = /^0[5-7]\d{8}$/;

type Errors = Partial<Record<'firstName' | 'lastName' | 'email' | 'phone' | 'stream', string>>;

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signUp = useAuth((s) => s.signUp);

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [draft, setDraft] = useState<SignUpDraft>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streamId: null,
    weakSubjects: [],
  });

  const patch = (next: Partial<SignUpDraft>) => setDraft((d) => ({ ...d, ...next }));

  const streamSubjects = useMemo(
    () => (draft.streamId ? subjectsForStream(draft.streamId) : []),
    [draft.streamId],
  );

  function validate(current: number): Errors {
    const found: Errors = {};
    if (current === 0) {
      if (!ARABIC_NAME.test(draft.firstName.trim())) found.firstName = ar.signup.errName;
      if (!ARABIC_NAME.test(draft.lastName.trim())) found.lastName = ar.signup.errLastName;
    }
    if (current === 1) {
      if (!EMAIL.test(draft.email.trim())) found.email = ar.signup.errEmail;
      if (!DZ_PHONE.test(draft.phone.replace(/\s/g, ''))) found.phone = ar.signup.errPhone;
    }
    if (current === 2 && !draft.streamId) found.stream = ar.signup.errStream;
    return found;
  }

  function goNext() {
    const found = validate(step);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      return;
    }
    // Last step: create the account. The auth gate in app/_layout.tsx sees
    // isAuthenticated flip and moves us into the app.
    signUp(draft);
  }

  function goBack() {
    setErrors({});
    if (step === 0) router.back();
    else setStep(step - 1);
  }

  function toggleWeak(subjectId: string) {
    setDraft((d) => ({
      ...d,
      weakSubjects: d.weakSubjects.includes(subjectId)
        ? d.weakSubjects.filter((id) => id !== subjectId)
        : [...d.weakSubjects, subjectId],
    }));
  }

  const isLast = step === TOTAL_STEPS - 1;

  return (
    <Screen style={styles.root}>
      <Row justify="space-between" style={styles.header}>
        <Pressable onPress={goBack} scaleTo={0.9} accessibilityLabel={ar.signup.back} style={styles.backButton}>
          <ChevronRight size={22} color={colors.text.hi} strokeWidth={2.2} />
        </Pressable>
        <Text variant="caption" color={colors.text.low}>
          {ar.signup.stepOf(step + 1, TOTAL_STEPS)}
        </Text>
      </Row>

      <Row gap={6} style={styles.progress}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View
            key={i}
            style={[styles.progressSegment, i <= step ? styles.progressSegmentOn : null]}
          />
        ))}
      </Row>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 90}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Keyed on step so each step mounts fresh and animates in on its own. */}
          <Animated.View
            key={step}
            entering={FadeInDown.duration(300).springify().damping(22)}
            exiting={FadeOut.duration(120)}
            style={styles.stepBody}
          >
            {step === 0 ? (
              <StepShell title={ar.signup.nameTitle} subtitle={ar.signup.nameSubtitle}>
                <Field
                  label={ar.signup.firstName}
                  placeholder={ar.signup.firstNamePlaceholder}
                  value={draft.firstName}
                  onChangeText={(t) => patch({ firstName: t })}
                  error={errors.firstName}
                  autoCorrect={false}
                />
                <Field
                  label={ar.signup.lastName}
                  placeholder={ar.signup.lastNamePlaceholder}
                  value={draft.lastName}
                  onChangeText={(t) => patch({ lastName: t })}
                  error={errors.lastName}
                  autoCorrect={false}
                />
              </StepShell>
            ) : null}

            {step === 1 ? (
              <StepShell title={ar.signup.contactTitle} subtitle={ar.signup.contactSubtitle}>
                <Field
                  label={ar.signup.email}
                  placeholder={ar.signup.emailPlaceholder}
                  value={draft.email}
                  onChangeText={(t) => patch({ email: t })}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  ltr
                />
                <Field
                  label={ar.signup.phone}
                  placeholder={ar.signup.phonePlaceholder}
                  value={draft.phone}
                  onChangeText={(t) => patch({ phone: t })}
                  error={errors.phone}
                  keyboardType="phone-pad"
                  ltr
                />
              </StepShell>
            ) : null}

            {step === 2 ? (
              <StepShell title={ar.signup.streamTitle} subtitle={ar.signup.streamSubtitle}>
                <View style={styles.streamGrid}>
                  {streams.map((stream) => {
                    const selected = draft.streamId === stream.id;
                    return (
                      <Pressable
                        key={stream.id}
                        onPress={() => {
                          // Changing stream invalidates subject picks from the old one.
                          patch({ streamId: stream.id as StreamId, weakSubjects: [] });
                          setErrors({});
                        }}
                        scaleTo={0.96}
                        style={[styles.streamCard, selected ? styles.streamCardOn : null]}
                      >
                        <Text
                          variant="bodyStrong"
                          color={selected ? colors.accent.light : colors.text.hi}
                          align="center"
                        >
                          {stream.name}
                        </Text>
                        <Text variant="caption" color={colors.text.low} align="center">
                          {`${stream.subjects.length} مواد`}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {errors.stream ? (
                  <Animated.View entering={FadeIn.duration(160)}>
                    <Text variant="caption" color={colors.danger}>
                      {errors.stream}
                    </Text>
                  </Animated.View>
                ) : null}
              </StepShell>
            ) : null}

            {step === 3 ? (
              <StepShell title={ar.signup.weakTitle} subtitle={ar.signup.weakSubtitle}>
                <Row gap={space.sm} wrap style={styles.subjectWrap}>
                  {streamSubjects.map((subject) => {
                    const selected = draft.weakSubjects.includes(subject.id);
                    return (
                      <Pressable
                        key={subject.id}
                        onPress={() => toggleWeak(subject.id)}
                        scaleTo={0.94}
                        style={[
                          styles.subjectChip,
                          selected
                            ? { backgroundColor: `${subject.hue}22`, borderColor: subject.hue }
                            : null,
                        ]}
                      >
                        <Row gap={6}>
                          {selected ? (
                            <Check size={14} color={subject.hue} strokeWidth={3} />
                          ) : (
                            <View style={[styles.subjectDot, { backgroundColor: subject.hue }]} />
                          )}
                          <Text
                            variant="caption"
                            color={selected ? colors.text.hi : colors.text.mid}
                          >
                            {subject.name}
                          </Text>
                        </Row>
                      </Pressable>
                    );
                  })}
                </Row>
                <Text variant="caption" color={colors.text.low}>
                  {ar.signup.weakSelected(draft.weakSubjects.length)}
                </Text>
              </StepShell>
            ) : null}
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
          <CtaButton label={isLast ? ar.signup.finish : ar.signup.next} onPress={goNext} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.shell}>
      <View style={styles.shellHead}>
        <Text variant="title" weight="semibold">
          {title}
        </Text>
        <Text variant="body" color={colors.text.mid}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.shellBody}>{children}</View>
    </View>
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
  progress: {
    marginBottom: space.xl,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.glass.fillHi,
  },
  progressSegmentOn: {
    backgroundColor: colors.accent.base,
  },
  content: {
    paddingBottom: space.xl,
  },
  stepBody: {
    flex: 1,
  },
  shell: {
    gap: space.xl,
  },
  shellHead: {
    gap: space.xs,
  },
  shellBody: {
    gap: space.lg,
  },
  streamGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: space.md,
  },
  streamCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    paddingHorizontal: space.md,
    gap: 2,
  },
  streamCardOn: {
    backgroundColor: colors.accent.wash,
    borderColor: colors.accent.base,
  },
  subjectWrap: {
    justifyContent: 'flex-start',
  },
  subjectChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glass.border,
    backgroundColor: colors.glass.fill,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingTop: space.md,
  },
});
