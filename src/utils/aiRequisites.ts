import type { AiMethodState, AiPassportImageResult } from "../Store/appStore"

/** Плоские реквизиты паспорта, собираемые с нескольких фото (мердж). */
export const PASSPORT_REQUISITE_KEYS = [
  "fio",
  "series",
  "number",
  "issue_date",
  "issued_by",
] as const

export type PassportRequisiteKey = (typeof PASSPORT_REQUISITE_KEYS)[number]

/**
 * В агрегат записываем только пустые ключи; уже заполненные не затираем.
 */
export function mergeRequisiteRecords(
  aggregate: Record<string, string>,
  from: Record<string, unknown> | null | undefined
): Record<string, string> {
  const next: Record<string, string> = { ...aggregate }
  if (!from || typeof from !== "object") return next
  for (const k of PASSPORT_REQUISITE_KEYS) {
    const v = (from as Record<string, unknown>)[k]
    if (v === undefined || v === null) continue
    const s = String(v).trim()
    if (!s) continue
    const cur = String(next[k] ?? "").trim()
    if (!cur) next[k] = s
  }
  return next
}

function isPassportDataShape(v: unknown): v is Record<string, unknown> {
  if (!v || typeof v !== "object" || v === null) return false
  if ("byUrl" in (v as object)) return false
  return PASSPORT_REQUISITE_KEYS.some((k) => k in (v as object))
}

export function emptyMethodState(): AiMethodState {
  return { byUrl: {} }
}

/**
 * Старый формат: `passport_front: { fio, series, ... }` или новый: `{ byUrl, merged? }`
 */
export function normalizePassportMethodState(raw: unknown): AiMethodState {
  if (!raw || typeof raw !== "object") {
    return emptyMethodState()
  }
  const o = raw as Record<string, unknown>
  if (o.byUrl && typeof o.byUrl === "object" && o.byUrl !== null) {
    return {
      byUrl: o.byUrl as Record<string, AiPassportImageResult>,
      merged:
        o.merged && typeof o.merged === "object" && o.merged !== null
          ? { ...(o.merged as Record<string, string>) }
          : undefined,
    }
  }
  if (isPassportDataShape(o)) {
    return {
      byUrl: {},
      merged: mergeRequisiteRecords({}, o),
    }
  }
  return emptyMethodState()
}

/**
 * Произвольные методы ИИ: храним как `{ byUrl, merged? }` при наличии byUrl, иначе пусто.
 */
export function normalizeMethodState(
  _method: string,
  raw: unknown
): AiMethodState {
  if (!raw || typeof raw !== "object") {
    return emptyMethodState()
  }
  const o = raw as Record<string, unknown>
  if (o.byUrl && typeof o.byUrl === "object" && o.byUrl !== null) {
    return {
      byUrl: o.byUrl as Record<string, AiPassportImageResult>,
      merged:
        o.merged && typeof o.merged === "object" && o.merged !== null
          ? { ...(o.merged as Record<string, string>) }
          : undefined,
    }
  }
  if (_method === "passport_front" && isPassportDataShape(o)) {
    return normalizePassportMethodState(raw)
  }
  return emptyMethodState()
}

/** Единое имя ключа поля `data`/ошибки ИИ для сравнения. */
export function canonAiDataKey(method: string, key: string): string {
  const k = key.trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_")
  let out = k
  if (method === "passport_front") {
    if (out === "issueddate" || out === "issued_date") out = "issue_date"
    if (out === "issue_by") out = "issued_by"
  }
  if ((method === "egrn" || method === "egr") && out === "cadastral") out = "cadaster"
  return out.replace(/__/g, "_")
}

/** Поле указано некорректным в ошибках этого снимка. */
export function isDataKeyErroneousInScan(
  method: string,
  dataKey: string,
  errors: AiPassportImageResult["errors"] | undefined
): boolean {
  if (!errors?.length) return false
  const ck = canonAiDataKey(method, dataKey)
  for (const e of errors) {
    if (!e?.field?.trim()) continue
    const ef = canonAiDataKey(method, e.field)
    if (ef && ef === ck) return true
  }
  return false
}

function trimDataCell(v: unknown): string {
  if (v === undefined || v === null) return ""
  return String(v).trim()
}

/** Многострочное поля: `ai_status` = массив ответов checkAI по индексу фото (как `value`). */
export function normalizeAiResultsArray(raw: unknown): AiPassportImageResult[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.filter((x): x is AiPassportImageResult => x !== null && typeof x === "object") as AiPassportImageResult[]
  }
  if (typeof raw === "object") return [raw as AiPassportImageResult]
  return []
}

/** URL из поля `images` (массив строк). */
export function galleryUrlsFromUnknown(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === "string")
}

/**
 * Оставить в `ai_status` только снимки для URL, оставшихся в галерее (после удаления и т.п.).
 * Если next длиннее prev — обычно только что отработал onCheckAI и уже расширил массив; не трогаем.
 * Если в next есть URL, которого не было в prev — замена/рост без гарантии маппинга; не трогаем.
 */
export function remapGalleryAiToUrlList(
  prevUrls: string[],
  nextUrls: string[],
  prevAi: unknown
): AiPassportImageResult[] | undefined {
  const prevArr = normalizeAiResultsArray(prevAi)
  if (nextUrls.length === 0) return []
  if (nextUrls.length > prevUrls.length) return undefined

  const out: AiPassportImageResult[] = []
  for (const u of nextUrls) {
    const ix = prevUrls.indexOf(u)
    if (ix < 0 || ix >= prevArr.length) return undefined
    out.push(prevArr[ix])
  }
  return out
}

/** Свести несколько результатов ИИ в один объект `data` для сравнения с анкетой (последнее непустое по ключу). */
export function mergeDataFromAiResultArray(items: AiPassportImageResult[]): Record<string, any> {
  const acc: Record<string, unknown> = {}
  for (const r of items) {
    if (!r?.data || typeof r.data !== "object") continue
    for (const [k, v] of Object.entries(r.data)) {
      const s = trimDataCell(v)
      if (s) acc[k] = v
    }
  }
  return acc as Record<string, any>
}

/** «Правильный» снимок: без ошибок проверки/ИИ для карточки. */
export function aiResultLooksClean(r: AiPassportImageResult | null | undefined): boolean {
  if (!r) return false
  if (r.has_error === true) return false
  if (Array.isArray(r.errors) && r.errors.length > 0) return false
  return true
}

function aiResultHasData(r: AiPassportImageResult | null | undefined): boolean {
  if (!r?.data || typeof r.data !== "object") return false
  return Object.values(r.data).some((v) => v != null && trimDataCell(v) !== "")
}

/**
 * Выбор результата для панели «Результат ИИ»: если у всех снимков есть непустые data — последний;
 * иначе с конца первый «чистый» или с непустым data иначе последний элемент.
 */
export function pickAiResultForImagesFieldDisplay(results: AiPassportImageResult[]): AiPassportImageResult | null {
  const list = Array.isArray(results) ? results.filter((x): x is AiPassportImageResult => !!x && typeof x === "object") : []
  if (list.length === 0) return null
  const allNonempty = list.length > 0 && list.every((r) => aiResultHasData(r))
  if (allNonempty) return list[list.length - 1]

  for (let i = list.length - 1; i >= 0; i--) {
    const r = list[i]
    if (aiResultLooksClean(r) || aiResultHasData(r)) return r
  }
  return list[list.length - 1]
}

/**
 * После локальной проверки (форма vs ИИ): для массива дописать errors/has_error в последний элемент;
 * для плоского объекта — на корень.
 */
export function attachCompareErrorsToAiPayload(
  aiData: unknown,
  errors: AiPassportImageResult["errors"],
  has_error: boolean
): unknown {
  if (Array.isArray(aiData) && aiData.length > 0) {
    const last = aiData.length - 1
    const lastEl = aiData[last]
    if (!lastEl || typeof lastEl !== "object") return aiData
    const patched = {
      ...(lastEl as AiPassportImageResult),
      errors,
      has_error,
    }
    return [...aiData.slice(0, last), patched]
  }
  if (aiData && typeof aiData === "object") {
    return { ...(aiData as object), errors, has_error }
  }
  return aiData
}

/**
 * Сводка для анкеты: массив результатов сводится в один `data`, иначе корень объекта или `merged` (legacy).
 */
export function aiStatusDataForFormCompare(aiData: unknown): Record<string, any> | undefined {
  if (!aiData) return undefined
  if (Array.isArray(aiData)) {
    const merged = mergeDataFromAiResultArray(aiData as AiPassportImageResult[])
    return Object.keys(merged).length > 0 ? merged : undefined
  }
  if (typeof aiData !== "object") return undefined
  const o = aiData as Record<string, unknown>
  const d = o.data
  if (d && typeof d === "object" && d !== null && Object.keys(d as object).length > 0) {
    return d as Record<string, any>
  }
  const merged = o.merged
  if (merged && typeof merged === "object" && merged !== null && Object.keys(merged).length > 0) {
    return merged as Record<string, any>
  }
  if (d && typeof d === "object" && d !== null) return d as Record<string, any>
  return undefined
}

/** Корень, массив по фото, или при старой схеме — any true среди byUrl или элементов массива. */
export function aiStatusOrFlagFromByUrl(
  aiData: unknown,
  flag: "is_propiska" | "is_egrn" | "is_akt" | "is_passport"
): boolean | undefined {
  if (Array.isArray(aiData)) {
    let anySeen = false
    let anyTrue = false
    for (const r of aiData as AiPassportImageResult[]) {
      if (!r || typeof r !== "object") continue
      const b = r[flag]
      if (typeof b !== "boolean") continue
      anySeen = true
      if (b) anyTrue = true
    }
    return anySeen ? anyTrue : undefined
  }
  if (!aiData || typeof aiData !== "object") return undefined
  const o = aiData as Record<string, unknown>
  if (typeof o[flag] === "boolean") return o[flag] as boolean
  const byUrl = o.byUrl
  if (!byUrl || typeof byUrl !== "object") return undefined
  let anySeen = false
  let anyTrue = false
  for (const r of Object.values(byUrl as Record<string, AiPassportImageResult>)) {
    if (!r || typeof r !== "object") continue
    const b = (r as AiPassportImageResult)[flag]
    if (typeof b !== "boolean") continue
    anySeen = true
    if (b) anyTrue = true
  }
  if (!anySeen) return undefined
  return anyTrue
}

/** Плоский объект для UI — без активного byUrl-среза (черновики с merged поддерживаются). */
export function aiPassportResultFromFlatStatus(aiStatusRaw: unknown): AiPassportImageResult | null {
  if (!aiStatusRaw || typeof aiStatusRaw !== "object") return null
  const o = aiStatusRaw as Record<string, unknown>
  if ("byUrl" in o && o.byUrl && typeof o.byUrl === "object" && Object.keys(o.byUrl as object).length > 0) {
    return null
  }
  if (!(o.data && typeof o.data === "object")) {
    const cmp = aiStatusDataForFormCompare(aiStatusRaw)
    if (!cmp || Object.keys(cmp).length === 0) return null
    return {
      ...(o as AiPassportImageResult),
      data: { ...cmp } as Record<string, string>,
      errors: Array.isArray(o.errors) ? (o.errors as AiPassportImageResult["errors"]) : undefined,
    }
  }
  const d = o.data as Record<string, unknown>
  return {
    is_passport: typeof o.is_passport === "boolean" ? o.is_passport : undefined,
    is_propiska: typeof o.is_propiska === "boolean" ? o.is_propiska : undefined,
    is_egrn: typeof o.is_egrn === "boolean" ? o.is_egrn : undefined,
    is_akt: typeof o.is_akt === "boolean" ? o.is_akt : undefined,
    data: d as Record<string, string>,
    errors: Array.isArray(o.errors) ? (o.errors as AiPassportImageResult["errors"]) : undefined,
    has_error: typeof o.has_error === "boolean" ? o.has_error : undefined,
  }
}

/** Что показать для одной картинки: резолв по URL только при непустом byUrl (старый формат); иначе плоско. */
/** Ответ api checkAI → один снимок для поля формы (`res.data?.data?.checks` или legacy `res.data.check`). */
export function extractAiInboundFromCheckResponse(ai_method: string, res: any): AiPassportImageResult | null {
  const checkData = res?.data?.data?.checks ?? res?.data?.checks
  if (!checkData) return null
  const m = (ai_method || "").toLowerCase()
  if (m === "passport_front" && checkData.passport_front) return checkData.passport_front as AiPassportImageResult
  if (m === "passport_reg" && checkData.passport_reg) return checkData.passport_reg as AiPassportImageResult
  if (m === "egrn" && checkData.egrn) return checkData.egrn as AiPassportImageResult
  if ((m === "ventkanal" || m === "akt") && checkData.akt) return checkData.akt as AiPassportImageResult
  return null
}

function checkKeyForAiMethod(method: string): "passport_front" | "passport_reg" | "egrn" | "akt" {
  const m = (method || "").toLowerCase()
  if (m === "passport_front") return "passport_front"
  if (m === "passport_reg") return "passport_reg"
  if (m === "egrn") return "egrn"
  if (m === "ventkanal" || m === "akt") return "akt"
  return "passport_front"
}

/**
 * Подменить один снимок в ответе checkAI (локальные ошибки до applyAiStatus в DataEditor).
 */
export function patchInboundInCheckAiResponse(
  res: any,
  ai_method: string,
  inbound: AiPassportImageResult
): any {
  const next =
    typeof structuredClone === "function" ? structuredClone(res) : JSON.parse(JSON.stringify(res))
  const key = checkKeyForAiMethod(ai_method)
  if (!next.data) next.data = {}
  if (!next.data.data) next.data.data = {}
  if (!next.data.data.checks || typeof next.data.data.checks !== "object") {
    next.data.data.checks = {}
  }
  (next.data.data.checks as Record<string, unknown>)[key] = inbound
  if (next.data.checks && typeof next.data.checks === "object") {
    (next.data.checks as Record<string, unknown>)[key] = inbound
  }
  return next
}

/**
 * Универсально: что показать в UI — массив по фото, один объект, byUrl (при переданном imageSrc).
 */
export function resolveAiResultForDisplay(
  ai_method: string,
  ai_status: unknown,
  imageSrcForSingle?: string
): AiPassportImageResult | null {
  if (!ai_method || ai_status == null) return null
  if (Array.isArray(ai_status)) {
    const arr = normalizeAiResultsArray(ai_status)
    return arr.length ? pickAiResultForImagesFieldDisplay(arr) : null
  }
  const src = typeof imageSrcForSingle === "string" && imageSrcForSingle.trim() ? imageSrcForSingle : ""
  if (src) {
    const u = getAiResultForSingleImageField(ai_method, ai_status, src)
    if (u) return u
  }
  return aiPassportResultFromFlatStatus(ai_status)
}

export function getAiResultForSingleImageField(
  method: string,
  aiStatusRaw: unknown,
  imageSrc: string
): AiPassportImageResult | null {
  if (!method || !imageSrc) return null
  const st = normalizeMethodState(method, aiStatusRaw)
  if (imageSrc && st.byUrl[imageSrc]) {
    return st.byUrl[imageSrc]
  }
  const flat = aiPassportResultFromFlatStatus(aiStatusRaw)
  if (flat) return flat
  if (!aiStatusRaw || typeof aiStatusRaw !== "object") return null
  if (method === "passport_front" && st.merged && Object.keys(st.merged).length > 0) {
    return { data: { ...st.merged } }
  }
  return null
}

export function normalizeAiMethodKey(method: string): string {
  if (!method) return method
  const lower = method.toLowerCase()
  if (lower === "ventkanal") return "akt"
  return method
}

export function isAiDependentField(
  field: { ai_method?: string; type?: string } | null | undefined
): boolean {
  if (!field?.ai_method) return false
  return field.type === "image" || field.type === "images" || field.type === "pass_front"
}

export function shouldInvalidateAiStatusOnFieldChange(input: {
  field: { ai_method?: string; type?: string } | null | undefined
  source: "user" | "ai" | "system"
  prevValue: unknown
  nextValue: unknown
}): boolean {
  if (input.source !== "user") return false
  if (!isAiDependentField(input.field)) return false
  return input.prevValue !== input.nextValue
}
