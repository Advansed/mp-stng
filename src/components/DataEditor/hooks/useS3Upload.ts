import { useState } from "react"
import { api } from "../../../Store/api"
import { useToken } from "../../Login/authStore"
import useAppsStore, { type AiMethodState, type EditingApp } from "../../../Store/appStore"
import { normalizeMethodState } from "../../../utils/aiRequisites"

interface UseS3UploadOptions {
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

    console.log("getUploadUrl", filename, response)

    if (response.error) {
      throw new Error("Failed to get upload URL: " + response.message)
    }

    return response.data
  }

  const delFileS3 = async (filename: string): Promise<{ uploadUrl: string; fileUrl: string; fields: any }> => {
    const response = await api("delFileS3", { token, filename })

    console.log("delFileS3", filename, response)

    if (response.error) {
      throw new Error("Failed to get upload URL")
    }

    return response
  }

  const uploadFile = async (file: Blob, fileName?: string, _ai_method?: string): Promise<string> => {
    setIsUploading(true)
    setError(null)
    setProgress(0)

    try {
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = fileName?.split(".").pop() || "jpg"
      const uniqueFileName = fileName || `images/${timestamp}_${randomString}.${extension}`

      console.log("uploadFile", fileName, uniqueFileName)

      const { uploadUrl, fileUrl } = await getUploadUrl(uniqueFileName, file.type)

      let simulatedProgress = 0
      const progressInterval = setInterval(() => {
        simulatedProgress = Math.min(simulatedProgress + 10, 90)
        setProgress(simulatedProgress)
        options.onProgress?.(simulatedProgress)
      }, 200)

      console.log("uploadUrl", uploadUrl)
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {},
      })

      console.log("upload", response)
      clearInterval(progressInterval)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Upload failed:", response.status, errorText)
        throw new Error(`Upload failed: ${response.status}`)
      }

      setProgress(100)
      options.onProgress?.(100)
      options.onSuccess?.(fileUrl)

      console.log("✅ Upload successful:", fileUrl)
      return fileUrl
    } catch (err) {
      const errObj = err instanceof Error ? err : new Error("Upload failed")
      setError(errObj)
      options.onError?.(errObj)
      throw errObj
    } finally {
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
