/** Explicit UI action; never infer submission from an omitted legacy field. */
export function submissionPayload(payload: Record<string, any>, action: 'submit' | 'draft' | 'edit') {
  const result: Record<string, any> = { ...payload, intent: action };
  if (action === 'submit') result.Проведен = 0;
  if (action === 'draft') result.Проведен = 2;
  return result;
}

export function assertSaved(response: any): void {
  if (!response || response.error === true || response.success === false ||
      !(response.success === true || response.error === false)) {
    throw new Error('Не удалось подтвердить сохранение. Данные остались в форме.');
  }
}
