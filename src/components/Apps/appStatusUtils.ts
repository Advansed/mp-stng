/** Коды статусов заявки (значение поля `status` с бэка). */
export type AppStatusCode = 'new' | 'checked' | 'edit' | 'created' | 'signed' | 'denied'

export const STATUS_LABELS: Record<AppStatusCode, string> = {
  new: 'Новая',
  checked: 'Договор на создании',
  edit: 'Проверка не пройдена',
  created: 'Договор на подписании',
  signed: 'Договор готов',
  denied: 'Отказано',
}

/** Подписи для устаревших кодов с бэка. */
const LEGACY_STATUS_LABELS: Record<string, string> = {
  ai_checked: 'Договор на создании',
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
      return 'warning'
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
      return null
    case 'edit':
    case 'denied':
      return null
    case 'created':
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

const CHECK_LABELS: Record<string, string> = {
  passport_front: 'Паспорт',
  passport_reg: 'Прописка',
  egrn: 'ЕГРН',
  akt: 'Акт вентканала',
}

export type AiCheckErrorItem = { field?: string; error?: string }

export type AiCheckErrorGroup = {
  key: string
  label: string
  errors: AiCheckErrorItem[]
}

function parsePossibleObject(value: unknown): Record<string, unknown> | null {
  if (!value) return null
  if (typeof value === 'object') return value as Record<string, unknown>
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>
    } catch {
      return null
    }
  }
  return null
}

function normalizeErrorItems(raw: unknown): AiCheckErrorItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return []
  const out: AiCheckErrorItem[] = []
  for (const item of raw) {
    if (typeof item === 'string') {
      const t = item.trim()
      if (t) out.push({ error: t })
      continue
    }
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>
      const field = typeof o.field === 'string' ? o.field : undefined
      const error =
        typeof o.error === 'string'
          ? o.error
          : typeof o.message === 'string'
            ? o.message
            : undefined
      if (field || error) out.push({ field, error: error || 'Ошибка проверки' })
    }
  }
  return out
}

function checksFromSource(source: CommentSource): Record<string, unknown> | null {
  const ai = parsePossibleObject(source.ai_status)
  if (ai?.checks && typeof ai.checks === 'object') {
    return ai.checks as Record<string, unknown>
  }
  if (source.checks && typeof source.checks === 'object') {
    return source.checks as Record<string, unknown>
  }
  const payload = parsePossibleObject(source.payload)
  if (payload?.checks && typeof payload.checks === 'object') {
    return payload.checks as Record<string, unknown>
  }
  return null
}

/**
 * Группы ошибок проверки из `ai_status.checks` (для статуса `edit`).
 * Источники: запись статуса, затем уровень заявки.
 */
export function extractAiCheckErrorGroups(
  ...sources: Array<CommentSource | null | undefined>
): AiCheckErrorGroup[] {
  for (const source of sources) {
    if (!source) continue
    const checks = checksFromSource(source)
    if (!checks) continue

    const groups: AiCheckErrorGroup[] = []
    for (const [key, rawCheck] of Object.entries(checks)) {
      if (rawCheck == null || typeof rawCheck !== 'object') continue
      const check = rawCheck as Record<string, unknown>
      const errors = normalizeErrorItems(check.errors)
      if (errors.length === 0) continue
      groups.push({
        key,
        label: CHECK_LABELS[key] || key.replace(/_/g, ' '),
        errors,
      })
    }
    if (groups.length > 0) return groups
  }
  return []
}
