import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ArrowUp, ChevronDown, Globe, Paperclip, Square, X, Zap } from 'lucide-react-native';

import { GlassCard } from '../ui/GlassCard';
import { Chip } from '../ui/Chip';
import { Pressable } from '../ui/Pressable';
import { Row } from '../ui/Row';
import { Text } from '../ui/Text';
import { SubjectSheet } from './SubjectSheet';
import { ar } from '@/i18n/ar';
import { getSubject } from '@/data/curriculum';
import { colors, radius, shadow, space, springSnappy } from '@/theme/tokens';
import { fonts, textScales, variants } from '@/theme/typography';
import { useChat } from '@/store/chat';
import { useSettings } from '@/store/settings';

export type ComposerProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
};

/**
 * Input pill plus the control row beneath it.
 *
 * The third chip is a subject selector rather than the model picker in the reference
 * mockup — it is how a student tells BACUA which slice of the curriculum to ground the
 * answer in, and it is exactly the parameter a real RAG backend would need.
 */
export function Composer({ value, onChangeText, onSubmit }: ComposerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const scaleName = useSettings((s) => s.textScale);
  const scale = textScales[scaleName];

  const deepThink = useChat((s) => s.deepThink);
  const search = useChat((s) => s.search);
  const subjectId = useChat((s) => s.subjectId);
  const isGenerating = useChat((s) => s.isGenerating);
  const lessonContext = useChat((s) => s.lessonContext);

  const toggleDeepThink = useChat((s) => s.toggleDeepThink);
  const toggleSearch = useChat((s) => s.toggleSearch);
  const setSubject = useChat((s) => s.setSubject);
  const setLessonContext = useChat((s) => s.setLessonContext);
  const stop = useChat((s) => s.stop);

  const canSend = value.trim().length > 0;
  const subjectName = subjectId ? (getSubject(subjectId)?.name ?? ar.chat.subjectAll) : ar.chat.subjectAll;

  // The send button grows in only once there is something to send, so an empty
  // composer stays visually quiet.
  const sendStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(canSend || isGenerating ? 1 : 0.6, springSnappy) }],
    opacity: withSpring(canSend || isGenerating ? 1 : 0.35, springSnappy),
  }));

  return (
    <View style={styles.root}>
      {lessonContext ? (
        <Row gap={space.sm} style={styles.contextBanner}>
          <Pressable
            onPress={() => setLessonContext(null)}
            scaleTo={0.9}
            accessibilityLabel={ar.chat.clearContext}
            style={styles.contextClose}
          >
            <X size={13} color={colors.accent.light} strokeWidth={2.4} />
          </Pressable>
          <Text variant="caption" color={colors.accent.light} numberOfLines={1} style={styles.contextLabel}>
            {ar.chat.lessonContext(lessonContext.lessonTitle)}
          </Text>
        </Row>
      ) : null}

      <GlassCard r={radius.xl} intensity={50} style={styles.card}>
        <Row gap={space.sm} align="flex-end" style={styles.inputRow}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={ar.chat.placeholder}
            placeholderTextColor={colors.text.low}
            multiline
            style={[
              styles.input,
              {
                fontFamily: fonts.regular,
                fontSize: Math.round(variants.body.fontSize * scale),
                lineHeight: Math.round(variants.body.lineHeight * scale),
              },
            ]}
            textAlign="right"
            textAlignVertical="center"
          />

          <Pressable scaleTo={0.9} accessibilityLabel="إرفاق" style={styles.iconButton}>
            <Paperclip size={19} color={colors.text.low} strokeWidth={2} />
          </Pressable>

          <Animated.View style={sendStyle}>
            <Pressable
              onPress={isGenerating ? stop : onSubmit}
              disabled={!isGenerating && !canSend}
              scaleTo={0.88}
              haptic="medium"
              accessibilityLabel={isGenerating ? ar.chat.stop : 'إرسال'}
              style={styles.sendButton}
            >
              {isGenerating ? (
                <Square size={14} color={colors.text.onAccent} strokeWidth={3} fill={colors.text.onAccent} />
              ) : (
                <ArrowUp size={20} color={colors.text.onAccent} strokeWidth={2.8} />
              )}
            </Pressable>
          </Animated.View>
        </Row>
      </GlassCard>

      <Row gap={space.sm} style={styles.chipRow}>
        <Chip
          label={ar.chat.deepThink}
          active={deepThink}
          onPress={toggleDeepThink}
          size="sm"
          icon={
            <Zap
              size={13}
              color={deepThink ? colors.accent.light : colors.text.low}
              strokeWidth={2.2}
              fill={deepThink ? colors.accent.light : 'transparent'}
            />
          }
        />
        <Chip
          label={ar.chat.webSearch}
          active={search}
          onPress={toggleSearch}
          size="sm"
          icon={<Globe size={13} color={search ? colors.accent.light : colors.text.low} strokeWidth={2.2} />}
        />
        <Chip
          label={subjectName}
          active={subjectId !== null}
          onPress={() => setSheetOpen(true)}
          size="sm"
          trailing={
            <ChevronDown
              size={13}
              color={subjectId ? colors.accent.light : colors.text.low}
              strokeWidth={2.2}
            />
          }
        />
      </Row>

      <SubjectSheet
        visible={sheetOpen}
        selected={subjectId}
        onSelect={setSubject}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    gap: space.sm,
  },
  contextBanner: {
    alignSelf: 'flex-end',
    maxWidth: '100%',
    backgroundColor: colors.accent.wash,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent.washBorder,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 5,
  },
  contextLabel: {
    flexShrink: 1,
  },
  contextClose: {
    padding: 2,
  },
  card: {
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
  },
  inputRow: {
    paddingRight: space.sm,
  },
  input: {
    flex: 1,
    color: colors.text.hi,
    maxHeight: 132,
    minHeight: 40,
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    writingDirection: 'rtl',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.accent.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.glow,
  },
  chipRow: {
    paddingHorizontal: space.xs,
  },
});
