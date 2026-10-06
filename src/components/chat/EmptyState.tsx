import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';

import { LogoMark } from '../LogoMark';
import { Pressable } from '../ui/Pressable';
import { Row } from '../ui/Row';
import { Text } from '../ui/Text';
import { ar } from '@/i18n/ar';
import { generalSuggestions, lessonSuggestions, type Suggestion } from '@/data/suggestions';
import { colors, radius, space } from '@/theme/tokens';
import { useChat } from '@/store/chat';
import { useSettings } from '@/store/settings';

export function EmptyState({ onPick }: { onPick: (suggestion: Suggestion) => void }) {
  const name = useSettings((s) => s.name.trim());
  const lessonContext = useChat((s) => s.lessonContext);

  // After a lesson hand-off the generic prompts are noise — swap in ones about the lesson.
  const suggestions = lessonContext ? lessonSuggestions : generalSuggestions;

  return (
    <View style={styles.root}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
        <LogoMark size={64} />
        <Text variant="title" weight="semibold" align="center" style={styles.greeting}>
          {name ? ar.chat.greetingNamed(name) : ar.chat.greeting}
        </Text>
        <Text variant="body" color={colors.text.mid} align="center">
          {ar.chat.subtitle}
        </Text>
      </Animated.View>

      <View style={styles.suggestions}>
        <Row gap={6} style={styles.suggestionsHeader}>
          <Sparkles size={15} color={colors.accent.base} strokeWidth={2.2} />
          <Text variant="label" color={colors.accent.base}>
            {ar.chat.askMeAnything}
          </Text>
        </Row>

        {suggestions.map((suggestion, index) => (
          <Animated.View
            key={suggestion.id}
            entering={FadeInDown.delay(120 + index * 55)
              .duration(320)
              .springify()
              .damping(20)}
          >
            <Pressable onPress={() => onPick(suggestion)} scaleTo={0.97} style={styles.chip}>
              <Text variant="caption" color={colors.text.mid}>
                {suggestion.text}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    paddingBottom: space.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.xxxl,
  },
  greeting: {
    marginTop: space.lg,
  },
  suggestions: {
    // Right-aligned: an Arabic list reads from the right edge inward.
    alignItems: 'flex-end',
    gap: space.sm,
  },
  suggestionsHeader: {
    marginBottom: space.xs,
  },
  chip: {
    backgroundColor: colors.glass.fill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.md - 2,
  },
});
