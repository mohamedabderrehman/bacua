import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { StreamId } from '@/data/curriculum';
import { useSettings } from './settings';

export interface Account {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streamId: StreamId;
  /** Subject ids the student said they want to improve in. Drives future prioritisation. */
  weakSubjects: string[];
  createdAt: number;
}

export interface SignUpDraft {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streamId: StreamId | null;
  weakSubjects: string[];
}

interface AuthState {
  account: Account | null;
  /** True once signed in. Everything under app/(app) is gated on this. */
  isAuthenticated: boolean;
  hydrated: boolean;

  signUp: (draft: SignUpDraft) => void;
  signIn: (identifier: string, password: string) => void;
  signOut: () => void;
}

/**
 * Account state.
 *
 * There is no backend yet, so `signIn` accepts any credentials — it exists to exercise the
 * screen, not to authenticate. When a real API arrives, these two actions are the only
 * places that change; nothing else in the app talks to auth directly.
 */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      account: null,
      isAuthenticated: false,
      hydrated: false,

      signUp: (draft) => {
        const account: Account = {
          firstName: draft.firstName.trim(),
          lastName: draft.lastName.trim(),
          email: draft.email.trim(),
          phone: draft.phone.trim(),
          streamId: draft.streamId ?? 'sci',
          weakSubjects: draft.weakSubjects,
          createdAt: Date.now(),
        };

        // Onboarding already asked for the stream and the student's name, so push them
        // into settings rather than asking a second time in الإعدادات.
        const settings = useSettings.getState();
        settings.setName(account.firstName);
        settings.setStream(account.streamId);

        set({ account, isAuthenticated: true });
      },

      // Mock: no credential check. The parameters are kept so the call site is already
      // shaped correctly for a real endpoint.
      signIn: (identifier) => {
        const isEmail = identifier.includes('@');
        set((state) => ({
          isAuthenticated: true,
          account: state.account ?? {
            firstName: '',
            lastName: '',
            email: isEmail ? identifier.trim() : '',
            phone: isEmail ? '' : identifier.trim(),
            streamId: useSettings.getState().streamId,
            weakSubjects: [],
            createdAt: Date.now(),
          },
        }));
      },

      signOut: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'bacua.auth.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ account, isAuthenticated }) => ({ account, isAuthenticated }),
      onRehydrateStorage: () => () => {
        useAuth.setState({ hydrated: true });
      },
    },
  ),
);
