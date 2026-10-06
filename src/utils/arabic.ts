/**
 * Normalises Arabic for matching and search.
 *
 * Students type without diacritics and mix alef and ta-marbuta forms freely —
 * "اللوغاريتمية", "اللوغاريتميه" and "اللوغَاريتمية" must all compare equal. Every
 * comparison in the app (mock-answer keywords, lesson search) runs both sides through
 * this, so the two never disagree.
 */
export function normalizeArabic(input: string): string {
  return input
    .replace(/[ً-ْٰ]/g, '') // harakat
    .replace(/ـ/g, '') // tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ئ/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}
