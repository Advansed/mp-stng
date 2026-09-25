import { useEffect, useRef } from 'react'
import { useToken } from '../../Login/authStore'
import { extractAiInboundFromCheckResponse } from '../../../utils/aiRequisites'
import {
  isDisplayableFileSrc,
  resolveDraftFileUrls,
  s3KeyFromFileRef,
} from '../../../utils/signedUrl'
import { FieldData, Section } from '../types'

function rawFileList(field: FieldData): string[] {
  if (field.type === 'images') {
    return Array.isArray(field.data)
      ? field.data.filter((item): item is string => typeof item === 'string' && !!item.trim())
      : []
  }
  if (typeof field.data === 'string' && field.data.trim()) return [field.data.trim()]
  if (Array.isArray(field.data)) {
    return field.data.filter((item): item is string => typeof item === 'string' && !!item.trim())
  }
  return []
}

function hasAiResult(ai_status: unknown): boolean {
  if (ai_status == null) return false
  if (Array.isArray(ai_status)) return ai_status.length > 0
  if (typeof ai_status === 'object') return Object.keys(ai_status as object).length > 0
  return true
}

export function useHydrateDraftFiles(args: {
  currentPage: number
  section: Section | undefined
  replaceSectionData: (sectionIndex: number, fields: FieldData[]) => void
  onChange?: (section: Section) => void
  onCheckAI?: (args: { method: string; objectKey: string; fileUrl: string }) => Promise<any>
}) {
  const { currentPage, section, replaceSectionData, onChange, onCheckAI } = args
  const token = useToken()
  const hydratedRef = useRef(new Set<string>())
  const sectionRef = useRef(section)
  const onCheckAIRef = useRef(onCheckAI)
  const onChangeRef = useRef(onChange)
  const replaceRef = useRef(replaceSectionData)
  sectionRef.current = section
  onCheckAIRef.current = onCheckAI
  onChangeRef.current = onChange
  replaceRef.current = replaceSectionData

  const unresolvedSig = (section?.data || [])
    .filter((field) => field.type === 'images' || field.type === 'image')
    .map((field) =>
      rawFileList(field)
        .filter((item) => !isDisplayableFileSrc(item))
        .join('\0')
    )
    .join('|')

  useEffect(() => {
    const currentSection = sectionRef.current
    if (!currentSection) return
    let cancelled = false

    const run = async () => {
      const working = currentSection.data.map((field) => ({ ...field }))
      let changed = false

      for (let i = 0; i < working.length; i++) {
        const field = working[i]
        if (field.type !== 'images' && field.type !== 'image') continue
        const id = `${currentPage}-${i}`
        const raw = rawFileList(field)
        const needsSign = raw.some((item) => !isDisplayableFileSrc(item))
        const laterNow = !!(sectionRef.current?.data[i]?.upload_later?.later ?? field.upload_later?.later)
        const needsAi =
          !!field.ai_method &&
          raw.length > 0 &&
          !laterNow &&
          !hasAiResult(field.ai_status)

        if (hydratedRef.current.has(id) && !needsSign) continue
        if (!needsSign && !needsAi) {
          hydratedRef.current.add(id)
          continue
        }
        if (needsSign && !token) continue

        let urls = raw
        let s3KeyByUrl = { ...(field.s3KeyByUrl || {}) }
        if (needsSign) {
          const resolved = await resolveDraftFileUrls(raw, token)
          if (cancelled) return
          urls = resolved.urls
          s3KeyByUrl = { ...s3KeyByUrl, ...resolved.s3KeyByUrl }
        }

        let ai_status = field.ai_status
        const check = onCheckAIRef.current
        const laterAfter = !!(sectionRef.current?.data[i]?.upload_later?.later ?? field.upload_later?.later)
        if (needsAi && !laterAfter && !hasAiResult(ai_status) && check && field.ai_method) {
          const results: any[] = []
          for (let idx = 0; idx < raw.length; idx++) {
            const key = s3KeyFromFileRef(raw[idx])
            if (!key) continue
            const fileUrl = urls[idx] || ''
            const res = await check({ method: field.ai_method, objectKey: key, fileUrl })
            if (cancelled) return
            const incoming = extractAiInboundFromCheckResponse(field.ai_method, res)
            if (incoming) results.push(incoming)
          }
          if (results.length === 1) ai_status = results[0]
          else if (results.length > 1) ai_status = results
        }

        const nextData = field.type === 'image' ? (urls[0] ?? '') : urls
        working[i] = {
          ...field,
          data: nextData,
          s3KeyByUrl,
          ai_status,
          upload_later: sectionRef.current?.data[i]?.upload_later ?? field.upload_later,
        }
        hydratedRef.current.add(id)
        changed = true
      }

      if (cancelled || !changed) return
      replaceRef.current(currentPage, working)
      onChangeRef.current?.({
        ...(currentSection as any),
        data: working,
        __sectionIndex: currentPage,
      })
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [currentPage, token, unresolvedSig])
}
