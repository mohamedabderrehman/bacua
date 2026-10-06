import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { StreamId } from '@/data/curriculum';
import type { TextScaleName } from '@/theme/typography';
import { toIsoDate } from '@/utils/date';

/**
 * The Algerian BAC sits in mid-June. Default to the next one that hasn't happened yet.
 *
 * Formatted with `toIsoDate` rather than `toISOString().slice(0,10)`: the latter converts
 * local midnight to UTC, which lands on the previous day for any timezone east of
 * Greenwich — Algiers included. That silently shifted the default to 12 June.
 */
export function defaultExamDate(now = new Date()): string {
  const year = now.getFullYear();
  const thisYear = new Date(year, 5, 13); // June is month 5
  const target = now <= thisYear ? thisYear : new Date(year + 1, 5, 13);
  return toIsoDate(target);
}

export function daysUntil(isoDate: string, now = new Date()): number {
  const target = new Date(`${isoDate}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

interface SettingsState {
  name: string;
  streamId: StreamId;
  examDate: string;

  textScale: TextScaleName;
  reduceMotion: boolean;
  /**
   * Whether the user has touched the reduce-motion switch. Until they do, we follow the
   * OS accessibility preference — after that, their choice wins.
   */
  reduceMotionTouched: boolean;

  haptics: boolean;
  sound: boolean;
  saveHistory: boolean;

  hydrated: boolean;

  setName: (name: string) => void;
  setStream: (streamId: StreamId) => void;
  setExamDate: (examDate: string) => void;
  setTextScale: (textScale: TextScaleName) => void;
  setReduceMotion: (value: boolean, fromSystem?: boolean) => void;
  setHaptics: (value: boolean) => void;
  setSound: (value: boolean) => void;
  setSaveHistory: (value: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      name: '',
      streamId: 'sci',
      examDate: defaultExamDate(),

      textScale: 'md',
      reduceMotion: false,
      reduceMotionTouched: false,

      haptics: true,
      sound: true,
      saveHistory: true,

      hydrated: false,

      setName: (name) => set({ name }),
      setStream: (streamId) => set({ streamId }),
      setExamDate: (examDate) => set({ examDate }),
      setTextScale: (textScale) => set({ textScale }),
      setReduceMotion: (value, fromSystem = false) =>
        set(fromSystem ? { reduceMotion: value } : { reduceMotion: value, reduceMotionTouched: true }),
      setHaptics: (haptics) => set({ haptics }),
      setSound: (sound) => set({ sound }),
      setSaveHistory: (saveHistory) => set({ saveHistory }),
    }),
    {
      name: 'bacua.settings.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _hydrated, ...rest }) => rest,
      // Gates the splash screen — we hold the app until stored settings are back, so
      // the UI never flashes defaults before the user's real values load.
      onRehydrateStorage: () => () => {
        useSettings.setState({ hydrated: true });
      },
    },
  ),
);
