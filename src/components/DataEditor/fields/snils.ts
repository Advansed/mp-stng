/** Маска СНИЛС: 000-000-000 00 */
export const SNILS_MASK: Array<RegExp | string> = [
  /\d/,
  /\d/,
  /\d/,
  '-',
  /\d/,
  /\d/,
  /\d/,
  '-',
  /\d/,
  /\d/,
  /\d/,
  ' ',
  /\d/,
  /\d/,
];

export function snilsDigits(value: string): string {
  return (value || '').replace(/\D/g, '').slice(0, 11);
}

export function formatSnils(value: string): string {
  const digits = snilsDigits(value);
  if (!digits) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)} ${digits.slice(9)}`;
}

export function isValidSnils(value: string): boolean {
  const digits = snilsDigits(value);
  if (digits.length !== 11) return false;
  if (digits === '00000000000') return false;

  const body = parseInt(digits.slice(0, 9), 10);
  const control = parseInt(digits.slice(9, 11), 10);

  // Номера до 001-001-998 выпускались без контрольной суммы
  if (body <= 1001998) return true;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * (9 - i);
  }

  let check = sum % 101;
  if (check === 100) check = 0;

  return check === control;
}

export function snilsValidationError(value: string, required: boolean): string | null {
  const digits = snilsDigits(value);
  if (!digits) return required ? 'Обязательное поле' : null;
  if (digits.length !== 11) return 'Введите СНИЛС полностью';
  if (!isValidSnils(value)) return 'Некорректный номер СНИЛС';
  return null;
}
