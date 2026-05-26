/** Относительный путь подписанного договора в хранилище (1C / S3). */
export function agreementContractPath(docId: string): string {
  const id = (docId || '').trim()
  return `${id}\\AgreementTO\\AgreementTO.pdf`
}

export function resolveAppDocId(
  app: { id?: string; doc_id?: string; docId?: string } | undefined,
  fallbackId: string
): string {
  if (!app) return fallbackId
  const raw = app.doc_id ?? app.docId ?? app.id
  return String(raw || fallbackId).trim()
}

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
