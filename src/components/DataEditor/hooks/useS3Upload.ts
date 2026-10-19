import { assertAttachmentSize } from '../../../utils/uploadLimit'
import { uploadAttachment } from '../../../utils/attachmentUpload'
import { deleteAttachment } from '../../../utils/attachmentDelete'
import { rememberConfirmedUpload, confirmedUploadKey } from '../../../utils/fileReferences'
import { useState, useRef } from "react"
import { api } from "../../../Store/api"
import { useToken } from "../../Login/authStore"
import useAppsStore, { type AiMethodState, type EditingApp } from "../../../Store/appStore"
import { normalizeMethodState } from "../../../utils/aiRequisites"

interface UseS3UploadOptions {
  documentId?: string
  group?: string
  onProgress?: (progress: number) => void
  onError?: (error: Error) => void
  onSuccess?: (fileUrl: string) => void
}

function patchAppAiForId(
  prev: EditingApp,
  id: string | undefined,
  method: string,
  nextMethodState: AiMethodState
): EditingApp {
  if (!id || prev.id !== id) return prev
  return {
    ...prev,
    ai_status: {
      ...prev.ai_status,
      [method]: nextMethodState,
    },
  }
}

function patchListItemAi(apps: any[], id: string | undefined, method: string, st: AiMethodState) {
  if (!id) return apps
  return apps.map((item) =>
    item.id === id
      ? {
          ...item,
          ai_status: {
            ...(item.ai_status || {}),
            [method]: st,
          },
        }
      : item
  )
}

export function useS3Upload(options: UseS3UploadOptions = {}) {
  const busy = useRef(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [progress, setProgress] = useState(0)

  const setApps = useAppsStore((state) => state.setApps)
  const setApp = useAppsStore((state) => state.setApp)

  const token = useToken()

  const getUploadUrl = async (
    filename: string,
    format: string
  ): Promise<{ uploadUrl: string; fileUrl: string; fields: any }> => {
    const response = await api("getUploadURL", { token, filename, format })

    if (response.error) {
      throw new Error("Failed to get upload URL: " + response.message)
    }

    return response.data
  }

  const performDeletion = async (filename: string, documentId?:string, group?:string, originalKey?:string): Promise<any> => {
    if(process.env.REACT_APP_ATTACHMENTS_V2 === 'true') {
      documentId=documentId||useAppsStore.getState().app?.id
      if(!token||!documentId||!group)throw new Error('Не определена заявка для удаления')
      return deleteAttachment({token,documentId,group,reference:filename,originalKey:confirmedUploadKey(filename)||originalKey},api)
    }
    const response = await api("delFileS3", { token, filename })

    if (response.error) {
      throw new Error("Не удалось удалить вложение")
    }

    return response
  }

  const delFileS3 = async (...args: Parameters<typeof performDeletion>): Promise<any> => {
    if (busy.current) throw new Error('Операция с файлом уже выполняется')
    busy.current = true
    setIsUploading(true)
    try { return await performDeletion(...args) }
    finally { busy.current = false; setIsUploading(false) }
  }

  const uploadFile = async (file: Blob, fileName?: string, _ai_method?: string): Promise<string> => {
    if (busy.current) throw new Error('Операция с файлом уже выполняется')
    busy.current = true
    setIsUploading(true)
    setError(null)
    setProgress(0)

    try {
      assertAttachmentSize(file.size)
      if (process.env.REACT_APP_ATTACHMENTS_V2 === 'true') {
        const parts = (fileName || '').split('/')
        const documentId = options.documentId || parts[0]
        const group = options.group || parts[1]
        if (!token || !documentId || !group) throw new Error('Не определена заявка для загрузки')
        const uploaded = await uploadAttachment({token,documentId,group,file,requestId:crypto.randomUUID()},async(operation,body)=>{
          const response = await api('attachments_'+operation,body)
          if (response.error || !response.data) throw new Error('Файл не подтверждён сервером')
          return response.data
        })
        rememberConfirmedUpload(uploaded.url,uploaded.key)
        setProgress(100)
        options.onSuccess?.(uploaded.url)
        return uploaded.url
      }
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = fileName?.split(".").pop() || "jpg"
      const uniqueFileName = fileName || `images/${timestamp}_${randomString}.${extension}`

      const { uploadUrl, fileUrl } = await getUploadUrl(uniqueFileName, file.type)

      let simulatedProgress = 0
      const progressInterval = setInterval(() => {
        simulatedProgress = Math.min(simulatedProgress + 10, 90)
        setProgress(simulatedProgress)
        options.onProgress?.(simulatedProgress)
      }, 200)

      // Presigned URLs grant temporary access; never log them.
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {},
      })
      console.log("[API] S3 PUT response", { status: response.status, ok: response.ok })

      clearInterval(progressInterval)

      if (!response.ok) {
        console.error("Upload failed:", response.status)
        throw new Error(`Upload failed: ${response.status}`)
      }

      setProgress(100)
      options.onProgress?.(100)
      options.onSuccess?.(fileUrl)

      return fileUrl
    } catch (err) {
      const errObj = err instanceof Error ? err : new Error("Upload failed")
      setError(errObj)
      options.onError?.(errObj)
      throw errObj
    } finally {
      busy.current = false
      setIsUploading(false)
    }
  }

  const pruneAiByFileUrl = (method: string, fileUrl: string) => {
    if (!method || !fileUrl) return
    const id = useAppsStore.getState().app?.id
    const appNow = useAppsStore.getState().app
    if (!id || !appNow || appNow.id !== id) return

    const raw = (appNow.ai_status as Record<string, unknown> | undefined)?.[method]
    if (
      !raw ||
      typeof raw !== "object" ||
      !("byUrl" in (raw as object)) ||
      !(raw as { byUrl?: unknown }).byUrl ||
      typeof (raw as { byUrl: unknown }).byUrl !== "object"
    ) {
      return
    }
    const st = normalizeMethodState(method, raw)
    const nextByUrl = { ...st.byUrl }
    delete nextByUrl[fileUrl]
    const next: AiMethodState = { ...st, byUrl: nextByUrl }
    setApps(patchListItemAi(useAppsStore.getState().apps, id, method, next))
    setApp(patchAppAiForId(appNow, id, method, next))
  }

  const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const response = await fetch(dataUrl)
    return response.blob()
  }

  return {
    uploadFile,
    delFileS3,
    dataUrlToBlob,
    pruneAiByFileUrl,
    isUploading,
    error,
    progress,
  }
}
