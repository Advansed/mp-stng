export type SealedUpload = { id: string; state: 'pending' | 'sealed'; uploadUrl?: string; headers?: Record<string,string>; key?: string; fileUrl?: string };
export type UploadCall = (operation: 'begin' | 'complete', body: Record<string,unknown>) => Promise<SealedUpload>;
export async function uploadAttachment(input: { token: string; documentId: string; group: string; file: Blob; requestId: string }, call: UploadCall, transport: typeof fetch = fetch) {
  const { file, ...identity } = input;
  let session = await call('begin', { ...identity, contentType: file.type, size: file.size });
  if (session.state !== 'sealed') {
    if (!session.uploadUrl) throw new Error('UPLOAD_URL_MISSING');
    const url = new URL(session.uploadUrl);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('INVALID_UPLOAD_URL');
    const response = await transport(session.uploadUrl, { method: 'PUT', headers: session.headers, body: file, signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error('UPLOAD_FAILED');
    session = await call('complete', { token: input.token, id: session.id });
  }
  if (session.state !== 'sealed' || !session.key || !session.fileUrl) throw new Error('UPLOAD_NOT_CONFIRMED');
  return { key: session.key, url: session.fileUrl };
}
