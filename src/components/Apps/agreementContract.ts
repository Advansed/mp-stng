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

export { parseSignedUrlResponse } from '../../utils/signedUrl'
