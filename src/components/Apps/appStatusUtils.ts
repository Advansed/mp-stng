/** Коды статусов заявки (значение поля `status` с бэка). */
export type AppStatusCode = 'new' | 'checked' | 'edit' | 'created' | 'signed' | 'denied'

export const STATUS_LABELS: Record<AppStatusCode, string> = {
  new: 'Новая',
  checked: 'Проверка пройдена',
  edit: 'На редактировании',
  created: 'Договор создан',
  signed: 'Договор подписан',
  denied: 'Отказано',
}

/** Подписи для устаревших кодов с бэка. */
const LEGACY_STATUS_LABELS: Record<string, string> = {
  ai_checked: 'Проверка пройдена',
}

export function normalizeAppStatus(status: string): string {
  return (status || '').toLowerCase().trim()
}

export function statusLabel(status: string): string {
  const key = normalizeAppStatus(status)
  if (key in STATUS_LABELS) return STATUS_LABELS[key as AppStatusCode]
  if (key in LEGACY_STATUS_LABELS) return LEGACY_STATUS_LABELS[key]
  return status.replace(/_/g, ' ')
}

export function badgeColor(
  status: string
): 'success' | 'warning' | 'danger' | 'medium' | 'primary' {
  const s = normalizeAppStatus(status)
  switch (s) {
    case 'new':
      return 'medium'
    case 'checked':
    case 'ai_checked':
      return 'primary'
    case 'edit':
    case 'denied':
      return 'danger'
    case 'created':
      return 'warning'
    case 'signed':
      return 'success'
    default:
      return 'primary'
  }
}

export function isNewStatus(status: string): boolean {
  return normalizeAppStatus(status) === 'new'
}

/** Проверка пройдена, договор на создании. */
export function isCheckedStatus(status: string): boolean {
  const s = normalizeAppStatus(status)
  return s === 'checked' || s === 'ai_checked' || s.includes('проверено ии')
}

export function isEditStatus(status: string): boolean {
  return normalizeAppStatus(status) === 'edit'
}

export function isDeniedStatus(status: string): boolean {
  return normalizeAppStatus(status) === 'denied'
}

/** Статусы с пояснением причины в comment / comments. */
export function hasStatusComments(status: string): boolean {
  return isEditStatus(status) || isDeniedStatus(status)
}

export function isCreatedStatus(status: string): boolean {
  return normalizeAppStatus(status) === 'created'
}

export function isSignedStatus(status: string): boolean {
  return normalizeAppStatus(status) === 'signed'
}

/** Краткое пояснение под бейджем в истории статусов. */
export function statusHint(status: string): string | null {
  const s = normalizeAppStatus(status)
  switch (s) {
    case 'new':
      return 'Заявка создана и редактируется'
    case 'checked':
    case 'ai_checked':
      return 'Договор на создании'
    case 'edit':
    case 'denied':
      return null
    case 'created':
      return 'Ожидает подписания'
    case 'signed':
      return null
    default:
      return null
  }
}

type CommentSource = Record<string, unknown>

function toCommentStrings(value: unknown): string[] {
  if (value == null) return []
  if (typeof value === 'string') {
    const t = value.trim()
    return t ? [t] : []
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => toCommentStrings(item))
  }
  return []
}

/** Комментарии к статусу (поля `comment` / `comments` с бэка, для `edit` и `denied`). */
export function extractStatusComments(source: CommentSource): string[] {
  const direct = [...toCommentStrings(source.comment), ...toCommentStrings(source.comments)]
  if (direct.length > 0) return direct

  const payload =
    typeof source.payload === 'object' && source.payload != null
      ? (source.payload as CommentSource)
      : null
  if (payload) {
    const fromPayload = [
      ...toCommentStrings(payload.comment),
      ...toCommentStrings(payload.comments),
    ]
    if (fromPayload.length > 0) return fromPayload
  }

  return []
}
