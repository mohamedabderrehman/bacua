import { mockProvider } from './mock';
import type { AIProvider } from './types';

/**
 * The app's active AI provider.
 *
 * Swapping to a real backend is this one line — write a module exporting an `AIProvider`
 * (Claude, OpenAI, or a RAG service over the curriculum files) and re-point this export.
 * Nothing in `src/components` or `app/` imports a concrete provider.
 */
export const ai: AIProvider = mockProvider;

export * from './types';
