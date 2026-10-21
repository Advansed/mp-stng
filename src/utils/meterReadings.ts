export interface ReadingResult {
  error: boolean;
  message: string;
  refreshFailed?: boolean;
}

export const UNCONFIRMED_READING = 'Не удалось подтвердить передачу показаний. Проверьте историю перед повторной отправкой.';

export function parseReading(value: string, previous: number) {
  if (!/^\d+$/.test(value)) return null;
  const reading = Number(value);
  if (!Number.isSafeInteger(reading) || reading <= 0 || !Number.isFinite(previous) ||
      reading < previous || reading - previous > 10000) return null;
  return reading;
}

/** Save acknowledgement is independent of a subsequent account refresh. */
export async function sendReading(
  save: () => Promise<any>,
  refresh: () => Promise<void>,
): Promise<ReadingResult> {
  let response: any;
  try { response = await save(); }
  catch { return { error: true, message: UNCONFIRMED_READING }; }
  if (!response || !(response.error === false || response.error === 0) || response.success === false) {
    return { error: true, message: 'Не удалось передать показания. Проверьте введённое значение и состояние лицевого счёта.' };
  }
  // The current server can return error=0 without inserting a row.
  if (response.message === 'Нет показаний для сохранения (все показания нулевые или NULL)') {
    return { error: true, message: 'Показания не сохранены. Проверьте введённое значение.' };
  }
  try { await refresh(); }
  catch { return { error: false, refreshFailed: true, message: 'Показания переданы. Обновить данные счёта не удалось; повторно отправлять показания не нужно.' }; }
  return { error: false, message: 'Показания переданы' };
}
