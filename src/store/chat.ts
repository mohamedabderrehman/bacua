import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ai } from '@/services/ai';
import type { LessonContext, Message, SourceRef } from '@/services/ai/types';
import { useSettings } from './settings';

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

let idCounter = 0;
function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}`;
}

function titleFrom(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > 34 ? `${clean.slice(0, 34)}…` : clean || 'محادثة جديدة';
}

/**
 * Lives outside the store on purpose: an AbortController is neither serialisable nor
 * something any component should re-render for.
 */
let activeController: AbortController | null = null;

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;

  /**
   * Text of the in-flight response. Held separately from `messages` so that streaming
   * re-renders only the streaming bubble — if we mutated the messages array on every
   * delta, the whole FlatList would reconcile ~30 times a second.
   */
  streamingText: string;
  isGenerating: boolean;

  // Composer state
  deepThink: boolean;
  search: boolean;
  subjectId: string | null;
  lessonContext: LessonContext | null;

  newConversation: () => string;
  setActive: (id: string) => void;
  deleteConversation: (id: string) => void;
  clearAll: () => void;

  send: (text: string) => Promise<void>;
  stop: () => void;
  regenerate: () => Promise<void>;

  toggleDeepThink: () => void;
  toggleSearch: () => void;
  setSubject: (subjectId: string | null) => void;
  setLessonContext: (context: LessonContext | null) => void;
}

export const useChat = create<ChatState>()(
  persist(
    (set, get) => {
      /** Shared by send() and regenerate() — both stream into the same sink. */
      async function runGeneration(conversationId: string) {
        const controller = new AbortController();
        activeController = controller;
        set({ isGenerating: true, streamingText: '' });

        const { subjectId, lessonContext, deepThink, search } = get();
        const conversation = get().conversations.find((c) => c.id === conversationId);
        if (!conversation) {
          set({ isGenerating: false });
          return;
        }

        let accumulated = '';
        let sources: SourceRef[] | undefined;

        try {
          for await (const event of ai.send({
            messages: conversation.messages,
            subjectId: subjectId ?? undefined,
            lessonContext,
            deepThink,
            search,
            signal: controller.signal,
          })) {
            if (event.type === 'delta') {
              accumulated += event.text;
              set({ streamingText: accumulated });
            } else if (event.type === 'sources') {
              sources = event.sources;
            }
          }
        } finally {
          const stopped = controller.signal.aborted;
          activeController = null;

          // Commit whatever we got. A stopped generation keeps its partial text —
          // discarding it would throw away something the student may already be reading.
          if (accumulated.trim().length > 0) {
            const assistant: Message = {
              id: makeId('m'),
              role: 'assistant',
              content: accumulated,
              createdAt: Date.now(),
              ...(sources ? { sources } : {}),
              ...(stopped ? { stopped: true } : {}),
            };
            set((state) => ({
              conversations: state.conversations.map((c) =>
                c.id === conversationId
                  ? { ...c, messages: [...c.messages, assistant], updatedAt: Date.now() }
                  : c,
              ),
            }));
          }

          set({ isGenerating: false, streamingText: '' });
        }
      }

      return {
        conversations: [],
        activeId: null,
        streamingText: '',
        isGenerating: false,

        deepThink: false,
        search: false,
        subjectId: null,
        lessonContext: null,

        newConversation: () => {
          const id = makeId('c');
          const now = Date.now();
          set((state) => ({
            conversations: [
              { id, title: 'محادثة جديدة', messages: [], createdAt: now, updatedAt: now },
              ...state.conversations,
            ],
            activeId: id,
            lessonContext: null,
            streamingText: '',
          }));
          return id;
        },

        setActive: (id) => set({ activeId: id, streamingText: '' }),

        deleteConversation: (id) =>
          set((state) => {
            const conversations = state.conversations.filter((c) => c.id !== id);
            return {
              conversations,
              activeId: state.activeId === id ? (conversations[0]?.id ?? null) : state.activeId,
            };
          }),

        clearAll: () => {
          activeController?.abort();
          set({
            conversations: [],
            activeId: null,
            streamingText: '',
            isGenerating: false,
            lessonContext: null,
          });
        },

        send: async (text) => {
          const trimmed = text.trim();
          if (trimmed.length === 0 || get().isGenerating) return;

          let conversationId = get().activeId;
          if (!conversationId || !get().conversations.some((c) => c.id === conversationId)) {
            conversationId = get().newConversation();
          }

          const userMessage: Message = {
            id: makeId('m'),
            role: 'user',
            content: trimmed,
            createdAt: Date.now(),
          };

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: [...c.messages, userMessage],
                    // Name the conversation from its opening question, like ChatGPT does.
                    title: c.messages.length === 0 ? titleFrom(trimmed) : c.title,
                    updatedAt: Date.now(),
                  }
                : c,
            ),
          }));

          await runGeneration(conversationId);
        },

        stop: () => {
          activeController?.abort();
        },

        regenerate: async () => {
          const { activeId, conversations, isGenerating } = get();
          if (!activeId || isGenerating) return;

          const conversation = conversations.find((c) => c.id === activeId);
          if (!conversation) return;

          const lastIndex = conversation.messages.length - 1;
          if (lastIndex < 0 || conversation.messages[lastIndex]?.role !== 'assistant') return;

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === activeId ? { ...c, messages: c.messages.slice(0, lastIndex) } : c,
            ),
          }));

          await runGeneration(activeId);
        },

        toggleDeepThink: () => set((s) => ({ deepThink: !s.deepThink })),
        toggleSearch: () => set((s) => ({ search: !s.search })),
        setSubject: (subjectId) => set({ subjectId }),
        setLessonContext: (lessonContext) => set({ lessonContext }),
      };
    },
    {
      name: 'bacua.chat.v1',
      storage: createJSONStorage(() => AsyncStorage),
      // Honour the "save conversations" setting at write time. When it's off nothing
      // reaches disk, so closing the app genuinely discards history.
      partialize: (state) => {
        const keepHistory = useSettings.getState().saveHistory;
        return {
          conversations: keepHistory ? state.conversations : [],
          activeId: keepHistory ? state.activeId : null,
          subjectId: state.subjectId,
        };
      },
    },
  ),
);

/** Selector helper — components use this rather than searching the array themselves. */
export function selectActiveConversation(state: ChatState): Conversation | undefined {
  return state.conversations.find((c) => c.id === state.activeId);
}
