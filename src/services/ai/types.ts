/**
 * The only contract the UI knows about.
 *
 * Screens and components import from here and never from a concrete provider, so
 * replacing the mock with Claude, OpenAI or a RAG backend means adding one file that
 * satisfies `AIProvider` and changing the export in `./index.ts` — no UI changes.
 */

export type Role = 'user' | 'assistant';

export interface SourceRef {
  lessonId: string;
  subjectName: string;
  lessonTitle: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  /** Populated on assistant messages when the answer was grounded in lessons. */
  sources?: SourceRef[];
  /** Set when generation was cancelled mid-stream. */
  stopped?: boolean;
}

export interface LessonContext {
  lessonId: string;
  lessonTitle: string;
  subjectId: string;
  subjectName: string;
  summary: string;
}

export interface SendOptions {
  /** Full conversation so far, oldest first. The last entry is the new user turn. */
  messages: Message[];
  /** Scopes the answer to one subject. `undefined` means all subjects. */
  subjectId?: string;
  lessonContext?: LessonContext | null;
  deepThink?: boolean;
  search?: boolean;
  signal?: AbortSignal;
}

export type AIEvent =
  | { type: 'delta'; text: string }
  | { type: 'sources'; sources: SourceRef[] }
  | { type: 'done' };

export interface AIProvider {
  readonly id: string;
  /** True when answers are canned — the UI shows a notice in settings. */
  readonly isMock: boolean;
  send(options: SendOptions): AsyncIterable<AIEvent>;
}
