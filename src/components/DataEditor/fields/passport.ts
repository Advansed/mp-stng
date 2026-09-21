/** Серия паспорта: 00 00 */
export const PASSPORT_SERIES_MASK: Array<RegExp | string> = [
  /\d/,
  /\d/,
  ' ',
  /\d/,
  /\d/,
];

/** Номер паспорта: 000000 */
export const PASSPORT_NUMBER_MASK: Array<RegExp | string> = [
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

export function passportDigits(value: string, max: number): string {
  return (value || '').replace(/\D/g, '').slice(0, max);
}

export function seriesValidationError(value: string, required: boolean): string | null {
  const digits = passportDigits(value, 4);
  if (!digits) return required ? 'Обязательное поле' : null;
  if (digits.length !== 4) return 'Введите серию полностью';
  if (digits === '0000') return 'Некорректная серия паспорта';
  return null;
}

export function passNumberValidationError(value: string, required: boolean): string | null {
  const digits = passportDigits(value, 6);
  if (!digits) return required ? 'Обязательное поле' : null;
  if (digits.length !== 6) return 'Введите номер паспорта полностью';
  if (digits === '000000') return 'Некорректный номер паспорта';
  return null;
}
