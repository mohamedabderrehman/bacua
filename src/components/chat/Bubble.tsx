import { memo, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { Check, Copy, RefreshCw, Square, ThumbsUp, Volume2 } from 'lucide-react-native';

import { Markdown } from '../Markdown';
import { Pressable } from '../ui/Pressable';
import { Row } from '../ui/Row';
import { Text } from '../ui/Text';
import { ar } from '@/i18n/ar';
import { colors, radius, space } from '@/theme/tokens';
import type { Message } from '@/services/ai/types';
import { useChat } from '@/store/chat';
import { useSettings } from '@/store/settings';

/**
 * User turn.
 *
 * Aligned left, which is the RTL mirror of the familiar right-aligned outgoing bubble —
 * the same convention Arabic WhatsApp, Telegram and ChatGPT use.
 */
function UserBubble({ message }: { message: Message }) {
  return (
    <Animated.View entering={FadeInDown.duration(220).springify().damping(18)} style={styles.userWrap}>
      <View style={styles.userBubble}>
        <Text variant="body">{message.content}</Text>
      </View>
    </Animated.View>
  );
}

/**
 * Assistant turn.
 *
 * No bubble chrome — near full width text on the canvas with a copper rule on the right
 * edge, which is where Arabic text begins. Matches the quoted-answer block in the mockup.
 */
function AssistantBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const regenerate = useChat((s) => s.regenerate);
  const isGenerating = useChat((s) => s.isGenerating);
  const soundEnabled = useSettings((s) => s.sound);

  const onCopy = useCallback(async () => {
    await Clipboard.setStringAsync(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, [message.content]);

  const onSpeak = useCallback(async () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    // Strip markdown markers so the engine doesn't read out asterisks and pipes.
    const plain = message.content.replace(/[#*`>|_-]/g, ' ').replace(/\s+/g, ' ');
    Speech.speak(plain, {
      language: 'ar',
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, [message.content, speaking]);

  return (
    <Animated.View entering={FadeInDown.duration(260).springify().damping(18)} style={styles.assistantWrap}>
      <View style={styles.assistantBody}>
        <Markdown source={message.content} />
      </View>

      {message.stopped ? (
        <Text variant="caption" color={colors.text.low} style={styles.stoppedNote}>
          {ar.chat.stopped}
        </Text>
      ) : null}

      {message.sources && message.sources.length > 0 ? (
        <View style={styles.sources}>
          <Text variant="caption" color={colors.text.low}>
            {ar.chat.sources}
          </Text>
          <Row gap={space.sm} wrap style={styles.sourceList}>
            {message.sources.map((source) => (
              <View key={source.lessonId} style={styles.sourceTag}>
                <Text variant="caption" color={colors.accent.light}>
                  {`${source.subjectName} · ${source.lessonTitle}`}
                </Text>
              </View>
            ))}
          </Row>
        </View>
      ) : null}

      <Row gap={space.xs} style={styles.actions}>
        <ActionButton
          label={copied ? ar.chat.copied : ar.chat.copy}
          onPress={onCopy}
          icon={
            copied ? (
              <Check size={15} color={colors.success} strokeWidth={2.2} />
            ) : (
              <Copy size={15} color={colors.text.low} strokeWidth={2} />
            )
          }
        />
        {isLast ? (
          <ActionButton
            label={ar.chat.regenerate}
            onPress={() => void regenerate()}
            disabled={isGenerating}
            icon={<RefreshCw size={15} color={colors.text.low} strokeWidth={2} />}
          />
        ) : null}
        <ActionButton
          label={ar.chat.like}
          onPress={() => setLiked((v) => !v)}
          icon={
            <ThumbsUp
              size={15}
              color={liked ? colors.accent.base : colors.text.low}
              strokeWidth={2}
              fill={liked ? colors.accent.base : 'transparent'}
            />
          }
        />
        {soundEnabled ? (
          <ActionButton
            label={speaking ? ar.chat.stop : ar.chat.speak}
            onPress={() => void onSpeak()}
            icon={
              speaking ? (
                <Square size={13} color={colors.accent.base} strokeWidth={2.4} fill={colors.accent.base} />
              ) : (
                <Volume2 size={15} color={colors.text.low} strokeWidth={2} />
              )
            }
          />
        ) : null}
      </Row>
    </Animated.View>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.88}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.actionButton}
    >
      {icon}
    </Pressable>
  );
}

export const Bubble = memo(function Bubble({
  message,
  isLast,
}: {
  message: Message;
  isLast: boolean;
}) {
  return message.role === 'user' ? (
    <UserBubble message={message} />
  ) : (
    <AssistantBubble message={message} isLast={isLast} />
  );
});

export const styles = StyleSheet.create({
  userWrap: {
    alignItems: 'flex-start',
    marginBottom: space.lg,
  },
  userBubble: {
    maxWidth: '84%',
    backgroundColor: colors.accent.wash,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent.washBorder,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  assistantWrap: {
    marginBottom: space.xl,
  },
  assistantBody: {
    borderRightWidth: 2,
    borderRightColor: colors.accent.base,
    paddingRight: space.lg,
  },
  stoppedNote: {
    marginTop: space.sm,
    paddingRight: space.lg,
  },
  sources: {
    marginTop: space.md,
    paddingRight: space.lg,
    gap: space.xs,
  },
  sourceList: {
    marginTop: 2,
  },
  sourceTag: {
    backgroundColor: colors.accent.wash,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent.washBorder,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 4,
  },
  actions: {
    marginTop: space.md,
    paddingRight: space.md,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
