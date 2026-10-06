import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';

import { AppHeader } from '@/components/AppHeader';
import { Composer } from '@/components/chat/Composer';
import { EmptyState } from '@/components/chat/EmptyState';
import { MessageList } from '@/components/chat/MessageList';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { ar } from '@/i18n/ar';
import type { Suggestion } from '@/data/suggestions';
import { colors, radius, space } from '@/theme/tokens';
import { selectActiveConversation, useChat } from '@/store/chat';

export default function ChatScreen() {
  const [draft, setDraft] = useState('');
  const insets = useSafeAreaInsets();

  const conversation = useChat(selectActiveConversation);
  const isGenerating = useChat((s) => s.isGenerating);
  const send = useChat((s) => s.send);
  const newConversation = useChat((s) => s.newConversation);
  const setSubject = useChat((s) => s.setSubject);

  const messages = conversation?.messages ?? [];
  const showEmptyState = messages.length === 0 && !isGenerating;

  function submit() {
    const text = draft;
    setDraft('');
    void send(text);
  }

  function pickSuggestion(suggestion: Suggestion) {
    if (suggestion.subjectId) setSubject(suggestion.subjectId);
    setDraft('');
    void send(suggestion.text);
  }

  return (
    <Screen>
      <AppHeader
        title={ar.app.name}
        showLogo
        right={
          <Pressable
            onPress={() => newConversation()}
            scaleTo={0.9}
            haptic="medium"
            accessibilityLabel={ar.drawer.newChat}
            style={styles.headerAction}
          >
            <Plus size={22} color={colors.text.hi} strokeWidth={2.2} />
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 52 : 0}
      >
        <View style={styles.flex}>
          {showEmptyState ? (
            <EmptyState onPick={pickSuggestion} />
          ) : (
            <MessageList messages={messages} generating={isGenerating} />
          )}
        </View>

        <View style={{ paddingBottom: insets.bottom + space.sm }}>
          <Composer value={draft} onChangeText={setDraft} onSubmit={submit} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
