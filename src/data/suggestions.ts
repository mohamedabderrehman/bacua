/**
 * Prompt suggestions for the chat empty state.
 *
 * Written the way an Algerian student actually types — light darija rather than formal
 * MSA. A chip that reads like a textbook does not get tapped.
 */

export interface Suggestion {
  id: string;
  text: string;
  /** Pre-selects the composer subject chip when tapped. */
  subjectId?: string;
}

export const generalSuggestions: Suggestion[] = [
  { id: 's1', text: 'لخّص لي درس الدوال اللوغاريتمية', subjectId: 'math' },
  { id: 's2', text: 'وش راهي أهم دروس الفيزياء في الباك؟', subjectId: 'physics' },
  { id: 's3', text: 'اعملي برنامج مراجعة لهذا الأسبوع' },
  { id: 's4', text: 'اشرحلي تركيب البروتين بالتبسيط', subjectId: 'svt' },
  { id: 's5', text: 'كيفاش نحضّر للباك في شهرين؟' },
  { id: 's6', text: 'كيفاش نكتب مقالة فلسفية جدلية؟', subjectId: 'philo' },
];

/** Shown after a lesson hand-off, tailored to reading a specific lesson. */
export const lessonSuggestions: Suggestion[] = [
  { id: 'l1', text: 'لخّصلي هذا الدرس في نقاط' },
  { id: 'l2', text: 'أعطيني تمرين على هذا الدرس' },
  { id: 'l3', text: 'وش هي الأخطاء الشائعة فيه؟' },
];
