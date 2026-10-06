/**
 * Algerian month names.
 *
 * Algeria uses the French-derived set (جانفي, فيفري, أفريل, جوان, جويلية, أوت) rather
 * than the Levantine one (يناير, فبراير…). Hard-coding these is also why the app doesn't
 * depend on Intl being present in the JS engine.
 */
const MONTHS_DZ = [
  'جانفي',
  'فيفري',
  'مارس',
  'أفريل',
  'ماي',
  'جوان',
  'جويلية',
  'أوت',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
] as const;

/** "13 جوان 2027" */
export function formatDateAr(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  const month = MONTHS_DZ[date.getMonth()] ?? '';
  return `${date.getDate()} ${month} ${date.getFullYear()}`;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}
