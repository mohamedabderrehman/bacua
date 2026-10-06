import {
  fallbackAnswers,
  lessonIntro,
  mockAnswers,
  type MockAnswer,
} from '@/data/mockAnswers';
import { findLesson } from '@/data/curriculum';
import { normalizeArabic } from '@/utils/arabic';
import type { AIEvent, AIProvider, SendOptions, SourceRef } from './types';

/** Keywords are normalised once at module load rather than on every keystroke. */
const indexedAnswers: Array<MockAnswer & { normalizedKeywords: string[] }> = mockAnswers.map(
  (entry) => ({
    ...entry,
    normalizedKeywords: entry.keywords.map(normalizeArabic),
  }),
);

function scoreAnswer(
  entry: (typeof indexedAnswers)[number],
  query: string,
  subjectId?: string,
): number {
  let score = 0;
  for (const keyword of entry.normalizedKeywords) {
    if (keyword.length > 0 && query.includes(keyword)) {
      // Longer keywords are more specific, so they should outrank a pile of short ones.
      score += keyword.length;
    }
  }
  if (score === 0) return 0;

  if (subjectId) {
    if (entry.subjectId === subjectId) score *= 1.5;
    else if (entry.subjectId) score *= 0.4; // wrong subject — still possible, but demoted
  }
  return score;
}

function pickAnswer(query: string, subjectId?: string): MockAnswer | null {
  const normalized = normalizeArabic(query);
  let best: MockAnswer | null = null;
  let bestScore = 0;

  for (const entry of indexedAnswers) {
    const score = scoreAnswer(entry, normalized, subjectId);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return best;
}

function resolveSources(lessonIds: string[] | undefined): SourceRef[] {
  if (!lessonIds) return [];
  return lessonIds.flatMap((id) => {
    const found = findLesson(id);
    if (!found) return [];
    return [
      {
        lessonId: id,
        subjectName: found.subject.name,
        lessonTitle: found.lesson.title,
      },
    ];
  });
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      resolve();
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/** Deterministic-ish fallback rotation so two unmatched questions don't read identically. */
let fallbackCursor = 0;

/**
 * Mock provider.
 *
 * Deliberately streams on a *jittered* interval rather than a fixed one — a metronomic
 * reveal reads as a progress bar, while variable pacing reads as generation. The
 * difference is obvious side by side.
 */
export const mockProvider: AIProvider = {
  id: 'mock',
  isMock: true,

  async *send({
    messages,
    subjectId,
    lessonContext,
    deepThink,
    search,
    signal,
  }: SendOptions): AsyncIterable<AIEvent> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const query = lastUser?.content ?? '';

    // Think before answering. Deep think visibly takes longer — the toggle should
    // cost something, otherwise it reads as decorative.
    await sleep(deepThink ? 900 + Math.random() * 700 : 320 + Math.random() * 380, signal);
    if (signal?.aborted) return;

    const match = pickAnswer(query, subjectId ?? lessonContext?.subjectId);

    let text: string;
    if (match) {
      text = deepThink && match.deepAnswer ? match.deepAnswer : match.answer;
    } else {
      text = fallbackAnswers[fallbackCursor % fallbackAnswers.length]!;
      fallbackCursor += 1;
    }

    if (lessonContext) {
      text = lessonIntro(lessonContext.lessonTitle, lessonContext.subjectName) + text;
    }

    // Split keeping whitespace so re-joining reproduces the markdown exactly.
    const tokens = text.split(/(\s+)/);
    let buffer = '';
    let sinceFlush = 0;
    const groupSize = 2 + Math.floor(Math.random() * 3);

    for (const token of tokens) {
      if (signal?.aborted) return;
      buffer += token;
      sinceFlush += 1;

      if (sinceFlush >= groupSize) {
        yield { type: 'delta', text: buffer };
        buffer = '';
        sinceFlush = 0;
        await sleep(18 + Math.random() * 42, signal);
      }
    }

    if (buffer.length > 0 && !signal?.aborted) {
      yield { type: 'delta', text: buffer };
    }
    if (signal?.aborted) return;

    if (search && match?.sourceLessonIds) {
      const sources = resolveSources(match.sourceLessonIds);
      if (sources.length > 0) {
        await sleep(180, signal);
        if (signal?.aborted) return;
        yield { type: 'sources', sources };
      }
    }

    yield { type: 'done' };
  },
};
