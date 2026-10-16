type ServiceDetailsChapter = { data?: Array<{name?:string;label?:string}>; files?: Array<{name?:string}> };

const documentHints: Array<[RegExp, string[]]> = [
  [/снилс|snils/i, ['SNILS']],
  [/прописк|регистраци|passport_reg/i, ['Passport2']],
  [/паспорт|passport_front/i, ['Passport1']],
  [/егрн|еgrn|egrn|правообладател/i, ['EGRN']],
  [/вентканал|акт обследован|actventcanal/i, ['ActVentCanal']],
];

/** Prefer the first reported problem; unknown reasons open the populated review. */
export function correctionStep(chapters: ServiceDetailsChapter[], reasons: string[]): number {
  for (const reason of reasons) {
    for (const [pattern, names] of documentHints) {
      if (!pattern.test(reason)) continue;
      const index = chapters.findIndex(c => c.files?.some(f => names.includes(f.name || '')));
      if (index >= 0) return index;
    }
    const normalized = reason.toLocaleLowerCase('ru');
    const index = chapters.findIndex(c => c.data?.some(f =>
      [f.label, f.name].some(label => label && label.length >= 4 && normalized.includes(label.toLocaleLowerCase('ru')))));
    if (index >= 0) return index;
  }
  return chapters.length;
}

export function initialCorrectionPage(service: unknown): number {
  if (!service || typeof service !== 'object') return 0;
  const value = service as { status?:string; comment?:unknown; statuses?:Array<{status?:string;comment?:unknown;comments?:unknown}>; chapters?:ServiceDetailsChapter[] };
  const last = value.statuses?.[value.statuses.length - 1];
  if ((last?.status || value.status) !== 'edit') return 0;
  const raw = last?.comment || last?.comments || value.comment;
  const reasons = typeof raw === 'string' ? [raw] : Array.isArray(raw) ? raw.filter((r):r is string=>typeof r==='string') : [];
  const chapters=value.chapters || [];
  const page=correctionStep(chapters,reasons);
  return page < chapters.length ? page : 0;
}
