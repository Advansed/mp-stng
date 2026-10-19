export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
export function assertAttachmentSize(size: number): void {
  if (!Number.isSafeInteger(size) || size < 1) throw new Error('Файл пустой или недоступен. Выберите документ ещё раз.');
  if (size > MAX_ATTACHMENT_BYTES) throw new Error('Файл больше 20 МиБ. Уменьшите размер фотографии или выберите другой файл.');
}
