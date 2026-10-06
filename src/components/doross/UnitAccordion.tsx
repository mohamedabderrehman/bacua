import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { Check, ChevronLeft, ChevronUp } from 'lucide-react-native';

import { Pressable } from '../ui/Pressable';
import { Row } from '../ui/Row';
import { Text } from '../ui/Text';
import { ar } from '@/i18n/ar';
import type { Unit } from '@/data/curriculum';
import { colors, radius, space } from '@/theme/tokens';
import { useProgress } from '@/store/progress';

export type UnitAccordionProps = {
  unit: Unit;
  hue: string;
  defaultOpen?: boolean;
  onOpenLesson: (lessonId: string) => void;
};

/**
 * One unit, expanding in place to reveal its lessons.
 *
 * Kept as an accordion rather than a pushed route so browsing stays two levels deep —
 * subject, then lesson — instead of three.
 */
export function UnitAccordion({ unit, hue, defaultOpen = false, onOpenLesson }: UnitAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const read = useProgress((s) => s.read);

  const doneCount = unit.lessons.filter((lesson) => read[lesson.id]).length;

  return (
    <Animated.View layout={LinearTransition.springify().damping(20)} style={styles.root}>
      <Pressable onPress={() => setOpen((v) => !v)} scaleTo={0.99} style={styles.header}>
        <Row justify="space-between">
          <Row gap={space.sm} style={styles.headerLeft}>
            <View style={[styles.marker, { backgroundColor: hue }]} />
            <Text variant="bodyStrong" numberOfLines={2} style={styles.headerTitle}>
              {unit.title}
            </Text>
          </Row>

          <Row gap={space.sm}>
            <Text variant="caption" color={colors.text.low} ltr>
              {`${doneCount}/${unit.lessons.length}`}
            </Text>
            {open ? (
              <ChevronUp size={17} color={colors.text.low} strokeWidth={2.2} />
            ) : (
              <ChevronLeft size={17} color={colors.text.low} strokeWidth={2.2} />
            )}
          </Row>
        </Row>
      </Pressable>

      {open ? (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} style={styles.lessons}>
          {unit.lessons.map((lesson) => {
            const isRead = Boolean(read[lesson.id]);
            return (
              <Pressable
                key={lesson.id}
                onPress={() => onOpenLesson(lesson.id)}
                scaleTo={0.98}
                style={styles.lessonRow}
              >
                <Row gap={space.md} align="flex-start">
                  <View
                    style={[
                      styles.readDot,
                      isRead ? { backgroundColor: hue, borderColor: hue } : null,
                    ]}
                  >
                    {isRead ? <Check size={11} color={colors.bg.base} strokeWidth={3.4} /> : null}
                  </View>

                  <View style={styles.lessonText}>
                    <Text variant="bodyStrong" color={isRead ? colors.text.mid : colors.text.hi}>
                      {lesson.title}
                    </Text>
                    <Text variant="caption" color={colors.text.low} numberOfLines={2}>
                      {lesson.summary}
                    </Text>
                  </View>

                  <ChevronLeft size={16} color={colors.text.low} strokeWidth={2} style={styles.chevron} />
                </Row>
              </Pressable>
            );
          })}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glass.border,
  },
  header: {
    paddingVertical: space.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    flex: 1,
  },
  marker: {
    width: 3,
    height: 18,
    borderRadius: 2,
  },
  lessons: {
    paddingBottom: space.sm,
    gap: 2,
  },
  lessonRow: {
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    backgroundColor: colors.glass.fill,
  },
  lessonText: {
    flex: 1,
    gap: 2,
  },
  readDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  chevron: {
    marginTop: 5,
  },
});
