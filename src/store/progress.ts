import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { countLessons, getSubject } from '@/data/curriculum';

interface ProgressState {
  /** Lesson id → read. Stored as a record rather than a Set so it survives JSON. */
  read: Record<string, boolean>;
  toggleRead: (lessonId: string) => void;
  setRead: (lessonId: string, value: boolean) => void;
  reset: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      read: {},
      toggleRead: (lessonId) =>
        set((state) => {
          const next = { ...state.read };
          if (next[lessonId]) delete next[lessonId];
          else next[lessonId] = true;
          return { read: next };
        }),
      setRead: (lessonId, value) =>
        set((state) => {
          const next = { ...state.read };
          if (value) next[lessonId] = true;
          else delete next[lessonId];
          return { read: next };
        }),
      reset: () => set({ read: {} }),
    }),
    {
      name: 'bacua.progress.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/**
 * Read count and ratio for one subject.
 *
 * Takes the `read` map as an argument rather than reading the store itself so callers
 * can subscribe to just that slice and avoid re-rendering the whole grid on every toggle.
 */
export function subjectProgress(subjectId: string, read: Record<string, boolean>) {
  const subject = getSubject(subjectId);
  if (!subject) return { done: 0, total: 0, ratio: 0 };

  const total = countLessons(subject);
  let done = 0;
  for (const unit of subject.units) {
    for (const lesson of unit.lessons) {
      if (read[lesson.id]) done += 1;
    }
  }
  return { done, total, ratio: total === 0 ? 0 : done / total };
}
