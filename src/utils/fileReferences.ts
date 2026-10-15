/** Keep storage origin and original persisted representation. Never turn a
 * historical MinIO/VK URL into an ambiguous REG key. Query signatures expire
 * and must not become part of document identity. The server validates origins.
 */
export function persistentFileReference(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const ref = value.trim()
  if (/^https?:\/\//i.test(ref)) {
    try {
      const url = new URL(ref)
      if (url.username || url.password || url.hash) return null
      url.search = ''
      return url.toString()
    } catch { return null }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(ref) || /[\u0000-\u001f]/.test(ref)) return null
  return ref
}
export function persistentFileReferences(field: { data?: unknown; s3KeyByUrl?: Record<string, string> }): string[] {
  const refs: string[] = []
  for (const value of Array.isArray(field.data) ? field.data : []) {
    const original = typeof value === 'string' ? field.s3KeyByUrl?.[value] : undefined
    const ref = persistentFileReference(original ?? value)
    if (ref && !refs.includes(ref)) refs.push(ref)
  }
  return refs
}
