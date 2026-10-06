import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronRight, Sparkles } from 'lucide-react-native';

import { Markdown } from '@/components/Markdown';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable } from '@/components/ui/Pressable';
import { Row } from '@/components/ui/Row';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { ar } from '@/i18n/ar';
import { findLesson } from '@/data/curriculum';
import { colors, radius, shadow, space } from '@/theme/tokens';
import { useChat } from '@/store/chat';
import { useProgress } from '@/store/progress';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const read = useProgress((s) => s.read);
  const toggleRead = useProgress((s) => s.toggleRead);
  const setLessonContext = useChat((s) => s.setLessonContext);
  const setSubject = useChat((s) => s.setSubject);
  const newConversation = useChat((s) => s.newConversation);

  const found = id ? findLesson(id) : undefined;

  if (!found) {
    return (
      <Screen style={styles.centered}>
        <Text variant="heading" color={colors.text.mid}>
          {ar.lesson.notFound}
        </Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text variant="label" color={colors.accent.light}>
            {ar.common.back}
          </Text>
        </Pressable>
      </Screen>
    );
  }

  const { lesson, unit, subject } = found;
  const isRead = Boolean(read[lesson.id]);

  /**
   * The point of this screen: carry the lesson into the chat as context and pre-select
   * its subject, so the very next question is already grounded.
   */
  function askAboutLesson() {
    // Order matters: newConversation() clears lessonContext (that's what the "+" button
    // in the header relies on), so the context has to be set *after* it, not before.
    newConversation();
    setLessonContext({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      subjectId: subject.id,
      subjectName: subject.name,
      summary: lesson.summary,
    });
    setSubject(subject.id);
    router.replace('/');
  }

  return (
    <Screen>
      <Row justify="space-between" style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          scaleTo={0.9}
          accessibilityLabel={ar.common.back}
          style={styles.iconButton}
        >
          <ChevronRight size={22} color={colors.text.hi} strokeWidth={2.2} />
        </Pressable>

        <Pressable
          onPress={() => toggleRead(lesson.id)}
          scaleTo={0.94}
          haptic="medium"
          style={[styles.readToggle, isRead ? { backgroundColor: `${subject.hue}22`, borderColor: subject.hue } : null]}
        >
          <Row gap={6}>
            <Check size={14} color={isRead ? subject.hue : colors.text.low} strokeWidth={2.6} />
            <Text variant="caption" color={isRead ? subject.hue : colors.text.low}>
              {isRead ? ar.doross.completed : ar.doross.markRead}
            </Text>
          </Row>
        </Pressable>
      </Row>

      {/* The route itself has no transition (see app/(app)/_layout.tsx), so the entrance
          happens here, inside the screen, where nothing can overlap the outgoing one. */}
      <Animated.ScrollView
        entering={FadeInDown.duration(320).springify().damping(22)}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <Row gap={space.sm} style={styles.breadcrumb}>
          <View style={[styles.marker, { backgroundColor: subject.hue }]} />
          <Text variant="caption" color={colors.text.low} numberOfLines={1} style={styles.breadcrumbText}>
            {`${subject.name} · ${unit.title}`}
          </Text>
        </Row>

        <Text variant="display" weight="bold" style={styles.title}>
          {lesson.title}
        </Text>
        <Text variant="body" color={colors.text.mid}>
          {lesson.summary}
        </Text>

        <GlassCard r={radius.lg} blur={false} style={styles.section}>
          <Text variant="label" color={colors.accent.light} style={styles.sectionTitle}>
            {ar.lesson.objectives}
          </Text>
          <View style={styles.objectives}>
            {lesson.objectives.map((objective, index) => (
              <Row key={index} gap={space.sm} align="flex-start">
                <View style={[styles.objectiveDot, { backgroundColor: subject.hue }]} />
                <Text variant="caption" color={colors.text.mid} style={styles.objectiveText}>
                  {objective}
                </Text>
              </Row>
            ))}
          </View>
        </GlassCard>

        <View style={styles.body}>
          <Markdown source={lesson.body} />
        </View>

        {lesson.formulas && lesson.formulas.length > 0 ? (
          <GlassCard r={radius.lg} blur={false} style={styles.section}>
            <Text variant="label" color={colors.accent.light} style={styles.sectionTitle}>
              {ar.lesson.formulas}
            </Text>
            <View style={styles.formulas}>
              {lesson.formulas.map((formula, index) => (
                <ScrollView
                  key={index}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.formulaRow}
                  contentContainerStyle={styles.formulaContent}
                >
                  <Text variant="mono" color={colors.text.hi} ltr>
                    {formula}
                  </Text>
                </ScrollView>
              ))}
            </View>
          </GlassCard>
        ) : null}
      </Animated.ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
        <Pressable onPress={askAboutLesson} scaleTo={0.97} haptic="medium" style={styles.askButton}>
          <Row gap={space.sm} justify="center">
            <Sparkles size={17} color={colors.text.onAccent} strokeWidth={2.4} />
            <Text variant="bodyStrong" color={colors.text.onAccent}>
              {ar.lesson.askBacua}
            </Text>
          </Row>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
  },
  backLink: {
    padding: space.md,
  },
  header: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readToggle: {
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    backgroundColor: colors.glass.fill,
    paddingHorizontal: space.md,
    paddingVertical: 7,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  breadcrumb: {
    marginBottom: space.md,
  },
  breadcrumbText: {
    flex: 1,
  },
  marker: {
    width: 3,
    height: 14,
    borderRadius: 2,
  },
  title: {
    marginBottom: space.sm,
  },
  section: {
    padding: space.lg,
    marginTop: space.xl,
  },
  sectionTitle: {
    marginBottom: space.md,
  },
  objectives: {
    gap: space.sm,
  },
  objectiveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 9,
  },
  objectiveText: {
    flex: 1,
  },
  body: {
    marginTop: space.xl,
  },
  formulas: {
    gap: space.sm,
  },
  formulaRow: {
    backgroundColor: colors.bg.sunken,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
  },
  formulaContent: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: colors.bg.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glass.border,
  },
  askButton: {
    backgroundColor: colors.accent.base,
    borderRadius: radius.md,
    paddingVertical: space.lg - 2,
    ...shadow.glow,
  },
});
