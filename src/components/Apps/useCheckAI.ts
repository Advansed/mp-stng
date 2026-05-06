import { useCallback, useMemo, useState } from "react"
import { api } from "../../Store/api"
import useAppsStore, { type EditingApp } from "../../Store/appStore"
import type { TService } from "../../Store/serviceStore"
import { useToken } from "../Login/authStore"

export interface UseCheckAIOptions {
  /**
   * Оставлено для совместимости с текущими вызовами.
   * Локальные проверки больше не выполняются: сервер возвращает уже проверенные `errors/has_error`.
   */
  serviceForCompare?: TService | null
}

/**
 * Только вызывает `checkAI`. Обработка `errors/has_error` и рендер результата — в `DataEditor`/`aiRequisites`.
 */
export function useCheckAI(_opts?: UseCheckAIOptions) {
  const token = useToken()
  const app = useAppsStore((s) => s.app as EditingApp | null)
  const [isAIChecking, setAIChecking] = useState(false)

  const checkAI = useCallback(
    async (method: string, objectKey: string, _fileUrl?: string): Promise<any> => {
      setAIChecking(true)
      try {
        const res = await api("checkAI", { token, method, app: app?.service, url: objectKey })
        console.log("checkAI", res)
        return res
      } catch {
        return null
      } finally {
        setAIChecking(false)
      }
    },
    [token, app?.id]
  )

  return useMemo(() => ({ checkAI, isAIChecking }), [checkAI, isAIChecking])
}
