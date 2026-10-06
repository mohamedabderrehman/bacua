import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search } from 'lucide-react-native';

import { AppHeader } from '@/components/AppHeader';
import { SubjectCard } from '@/components/doross/SubjectCard';
import { UnitAccordion } from '@/components/doross/UnitAccordion';
import { Chip } from '@/components/ui/Chip';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable } from '@/components/ui/Pressable';
import { Row } from '@/components/ui/Row';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { ar } from '@/i18n/ar';
import { allLessons, streams, subjectsForStream } from '@/data/curriculum';
import { normalizeArabic } from '@/utils/arabic';
import { colors, radius, space } from '@/theme/tokens';
import { fonts, textScales, variants } from '@/theme/typography';
import { subjectProgress, useProgress } from '@/store/progress';
import { useSettings } from '@/store/settings';

export default function DorossScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [query, setQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const streamId = useSettings((s) => s.streamId);
  const setStream = useSettings((s) => s.setStream);
  const scaleName = useSettings((s) => s.textScale);
  const read = useProgress((s) => s.read);

  const subjects = useMemo(() => subjectsForStream(streamId), [streamId]);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) ?? null;

  const cardWidth = (width - space.lg * 2 - space.md) / 2;

  // Search spans only the stream's own subjects — results from another stream's
  // curriculum would be noise, not helpfulness.
  const results = useMemo(() => {
    const normalized = normalizeArabic(query.trim());
    if (normalized.length < 2) return [];
    const allowed = new Set(subjects.map((s) => s.id));
    return allLessons()
      .filter((entry) => allowed.has(entry.subject.id))
      .filter((entry) =>
        `${normalizeArabic(entry.lesson.title)} ${normalizeArabic(entry.lesson.summary)} ${normalizeArabic(entry.unit.title)}`.includes(
          normalized,
        ),
      )
      .slice(0, 24);
  }, [query, subjects]);

  const searching = normalizeArabic(query.trim()).length >= 2;

  function selectSubject(id: string) {
    setSelectedSubjectId((current) => (current === id ? null : id));
  }

  return (
    <Screen>
      <AppHeader title={ar.doross.title} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="caption" color={colors.text.low} style={styles.subtitle}>
          {ar.doross.subtitle}
        </Text>

        <GlassCard r={radius.pill} intensity={30} style={styles.searchCard}>
          <Row gap={space.sm} style={styles.searchRow}>
            <Search size={17} color={colors.text.low} strokeWidth={2} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={ar.doross.searchPlaceholder}
              placeholderTextColor={colors.text.low}
              style={[
                styles.searchInput,
                {
                  fontFamily: fonts.regular,
                  fontSize: Math.round(variants.caption.fontSize * textScales[scaleName]),
                },
              ]}
              textAlign="right"
            />
          </Row>
        </GlassCard>

        {searching ? (
          <SearchResults results={results} onOpen={(id) => router.push(`/lesson/${id}`)} />
        ) : (
          <>
            <Text variant="caption" color={colors.text.low} style={styles.sectionLabel}>
              {ar.doross.stream}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.streamRow}
            >
              {streams.map((stream) => (
                <Chip
                  key={stream.id}
                  label={stream.name}
                  active={stream.id === streamId}
                  onPress={() => {
                    setStream(stream.id);
                    setSelectedSubjectId(null);
                  }}
                />
              ))}
            </ScrollView>

            <View style={styles.grid}>
              {subjects.map((subject) => (
                <View key={subject.id} style={{ width: cardWidth }}>
                  <SubjectCard
                    subject={subject}
                    coefficient={subject.coefficient}
                    ratio={subjectProgress(subject.id, read).ratio}
                    selected={subject.id === selectedSubjectId}
                    onPress={() => selectSubject(subject.id)}
                  />
                </View>
              ))}
            </View>

            {selectedSubject ? (
              <Animated.View
                key={selectedSubject.id}
                entering={FadeIn.duration(220)}
                layout={LinearTransition.springify().damping(20)}
                style={styles.units}
              >
                <Row gap={space.sm} style={styles.unitsHeader}>
                  <View style={[styles.unitsMarker, { backgroundColor: selectedSubject.hue }]} />
                  <Text variant="heading" weight="semibold">
                    {selectedSubject.name}
                  </Text>
                </Row>

                {selectedSubject.units.map((unit, index) => (
                  <UnitAccordion
                    key={unit.id}
                    unit={unit}
                    hue={selectedSubject.hue}
                    defaultOpen={index === 0}
                    onOpenLesson={(lessonId) => router.push(`/lesson/${lessonId}`)}
                  />
                ))}
              </Animated.View>
            ) : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function SearchResults({
  results,
  onOpen,
}: {
  results: ReturnType<typeof allLessons>;
  onOpen: (lessonId: string) => void;
}) {
  if (results.length === 0) {
    return (
      <View style={styles.noResults}>
        <Text variant="subheading" color={colors.text.mid} align="center">
          {ar.doross.noResults}
        </Text>
        <Text variant="caption" color={colors.text.low} align="center">
          {ar.doross.noResultsHint}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.resultList}>
      {results.map((entry) => (
        <Pressable key={entry.lesson.id} onPress={() => onOpen(entry.lesson.id)} scaleTo={0.98}>
          <GlassCard r={radius.md} blur={false} style={styles.resultCard}>
            <Row gap={space.md} align="flex-start">
              <View style={[styles.resultMarker, { backgroundColor: entry.subject.hue }]} />
              <View style={styles.resultText}>
                <Text variant="bodyStrong">{entry.lesson.title}</Text>
                <Text variant="caption" color={colors.text.low}>
                  {`${entry.subject.name} · ${entry.unit.title}`}
                </Text>
              </View>
              <ChevronLeft size={16} color={colors.text.low} strokeWidth={2} />
            </Row>
          </GlassCard>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  subtitle: {
    marginBottom: space.lg,
  },
  searchCard: {
    paddingHorizontal: space.md,
  },
  searchRow: {
    paddingHorizontal: space.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text.hi,
    paddingVertical: space.md,
    writingDirection: 'rtl',
  },
  sectionLabel: {
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  streamRow: {
    gap: space.sm,
    paddingVertical: 2,
    // Chips read right-to-left inside a horizontal scroller.
    flexDirection: 'row-reverse',
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: space.md,
    marginTop: space.xl,
  },
  units: {
    marginTop: space.xxl,
  },
  unitsHeader: {
    marginBottom: space.md,
  },
  unitsMarker: {
    width: 4,
    height: 22,
    borderRadius: 2,
  },
  resultList: {
    marginTop: space.xl,
    gap: space.sm,
  },
  resultCard: {
    padding: space.md,
  },
  resultMarker: {
    width: 3,
    height: 34,
    borderRadius: 2,
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  noResults: {
    marginTop: space.xxxl,
    gap: space.xs,
  },
});
