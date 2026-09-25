import { api } from '../Store/api'

/** URL или dataUrl из ответа `getsignedurl`. */
export function parseSignedUrlResponse(res: {
  error?: boolean
  message?: string
  data?: unknown
  url?: string
} | null | undefined): string | null {
  if (!res || res.error) return null
  const d = res.data
  if (typeof d === 'string' && d.trim()) return d.trim()
  if (d && typeof d === 'object') {
    const obj = d as Record<string, unknown>
    for (const key of ['url', 'dataUrl', 'signedUrl', 'href']) {
      if (typeof obj[key] === 'string' && (obj[key] as string).trim()) {
        return (obj[key] as string).trim()
      }
    }
  }
  if (typeof res.url === 'string' && res.url.trim()) return res.url.trim()
  return null
}

/** Ключ S3 из сырого пути или из URL (`/stng/...` либо pathname). */
export function s3KeyFromFileRef(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const s = value.trim()
  if (!s) return null
  const fromStng = s.match(/\/stng\/([^?]+)/)
  if (fromStng?.[1]) return decodeURIComponent(fromStng[1])
  if (!/^https?:\/\//i.test(s)) return s
  try {
    const path = new URL(s).pathname.replace(/^\/+/, '')
    if (!path) return null
    const withoutPrefix = path.startsWith('stng/') ? path.slice(5) : path
    return withoutPrefix ? decodeURIComponent(withoutPrefix) : null
  } catch {
    return null
  }
}

export async function getSignedFileUrl(
  token: string | null | undefined,
  key: string
): Promise<string | null> {
  if (!token || !key) return null
  try {
    const res = await api('getsignedurl', { token, fileUrl: key })
    return parseSignedUrlResponse(res)
  } catch (error) {
    console.error('getsignedurl error:', error)
    return null
  }
}

export async function resolveDraftFileUrls(
  raw: unknown,
  token: string | null | undefined
): Promise<{ urls: string[]; s3KeyByUrl: Record<string, string> }> {
  const list = Array.isArray(raw) ? raw : []
  const urls: string[] = []
  const s3KeyByUrl: Record<string, string> = {}
  for (const item of list) {
    if (typeof item !== 'string') continue
    const s = item.trim()
    if (!s) continue
    if (/^https?:\/\//i.test(s)) {
      urls.push(s)
      const key = s3KeyFromFileRef(s)
      if (key) s3KeyByUrl[s] = key
      continue
    }
    const signed = await getSignedFileUrl(token, s)
    if (signed) {
      urls.push(signed)
      s3KeyByUrl[signed] = s
    }
  }
  return { urls, s3KeyByUrl }
}

export function fileKeysForPayload(field: {
  data?: unknown
  s3KeyByUrl?: Record<string, string>
}): string[] {
  const filesArr = Array.isArray(field.data) ? field.data : []
  const keys: string[] = []
  for (const elem of filesArr) {
    const fromRef = s3KeyFromFileRef(elem)
    const fromMap = typeof elem === 'string' ? field.s3KeyByUrl?.[elem] : undefined
    const key = fromRef || fromMap
    if (key) keys.push(key)
  }
  return keys
}

/** Превью: только http(s) или data-URL, не сырой S3-ключ. */
export function isDisplayableFileSrc(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const s = value.trim()
  if (!s) return false
  if (s.startsWith('data:')) return true
  return /^https?:\/\//i.test(s)
}

export function laterFromField(field: {
  later?: boolean
  upload_later?: { active?: boolean; later?: boolean }
}): boolean {
  return !!(field.upload_later?.later || field.later)
}

export function uploadLaterFromFile(field: {
  later?: boolean
  upload_later?: { active?: boolean; later?: boolean }
}): { active?: boolean; later?: boolean } {
  return {
    ...field.upload_later,
    later: laterFromField(field),
  }
}
