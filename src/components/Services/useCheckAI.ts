import { useCallback, useMemo, useState } from "react"
import { api } from "../../Store/api"
import type { TService } from "../../Store/serviceStore"
import { useToken } from "../Login/authStore"

export interface UseCheckAIOptions {
  /** Текущая услуга формы заказа — уходит в `checkAI` как `app`. */
  service: TService | null
}

/**
 * Вызов `checkAI` для потока Services/Order (контекст услуги из пропсов, не из `appStore`).
 */
export function useCheckAI(opts: UseCheckAIOptions) {
  const token = useToken()
  const { service } = opts
  const [isAIChecking, setAIChecking] = useState(false)

  const checkAI = useCallback(
    async (method: string, objectKey: string): Promise<any> => {
      setAIChecking(true)
      try {
        console.log( service )
        const res = await api("checkAI", { token, method, app: service ?? undefined, url: objectKey })
        console.log("checkAI", res)
        return res
      } catch {
        return null
      } finally {
        setAIChecking(false)
      }
    },
    [token, service]
  )

  return useMemo(() => ({ checkAI, isAIChecking }), [checkAI, isAIChecking])
}
