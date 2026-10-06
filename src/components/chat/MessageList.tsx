import { useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Bubble } from './Bubble';
import { StreamingBubble } from './StreamingBubble';
import { space } from '@/theme/tokens';
import type { Message } from '@/services/ai/types';

/** Stable sentinel — a fresh object each render would churn the list's key diffing. */
const STREAMING_ITEM = { __streaming: true } as const;
type Item = Message | typeof STREAMING_ITEM;

function isStreaming(item: Item): item is typeof STREAMING_ITEM {
  return '__streaming' in item;
}

/**
 * Inverted list, the standard chat pattern: new messages land at the visual bottom with
 * no scroll-to-end bookkeeping, and the keyboard pushes content correctly for free.
 */
export function MessageList({
  messages,
  generating,
}: {
  messages: Message[];
  generating: boolean;
}) {
  const data = useMemo<Item[]>(() => {
    const reversed = [...messages].reverse();
    return generating ? [STREAMING_ITEM, ...reversed] : reversed;
  }, [messages, generating]);

  return (
    <FlatList
      data={data}
      inverted
      keyExtractor={(item) => (isStreaming(item) ? '__streaming' : item.id)}
      renderItem={({ item, index }) => {
        if (isStreaming(item)) return <StreamingBubble />;
        // Index 0 of an inverted list is the newest message.
        return <Bubble message={item} isLast={index === 0 && !generating} />;
      }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      // The list only grows at one end, so windowing gains little and the extra
      // mount/unmount churn during streaming costs more than it saves.
      removeClippedSubviews={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.lg,
  },
});
