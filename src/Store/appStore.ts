import { create } from 'zustand'
import { api } from './api'
import type { TService } from './serviceStore'

/** Результат сравнения паспорта (ИИ vs поля заявки) для `ai_status.passport_front`. */
export type PassportFrontAiCompare = {
  ai: Record<string, string>
  app: Record<string, string>
  matches: Record<string, boolean>
  allMatch: boolean
}

export type AiCheckError = { field?: string; error?: string }

/** Результат checkAI по одному изображению (лицо паспорта и т.п.). */
export type AiPassportImageResult = {
  is_passport?: boolean
  data?: Record<string, string>
  errors?: AiCheckError[]
  is_propiska?: boolean
  /** Результат проверки выписки ЕГРН (метод egrn). */
  is_egrn?: boolean
  /** Результат проверки акта вентканала (метод akt). */
  is_akt?: boolean
  /** Ошибка сопоставления данных ИИ с анкетой (если применимо). */
  has_error?: boolean
}

/**
 * Состояние по методу ИИ: результаты по URL файла + сводный мердж реквизитов с фото.
 */
export type AiMethodState = {
  byUrl: Record<string, AiPassportImageResult>
  merged?: Record<string, string>
}

/** Текущая редактируемая заявка: id из API + черновик формы (TService). */
export type EditingApp = {
  id: string
  service: TService
  ai_status?: {
    passport_front?: AiMethodState | PassportFrontAiCompare
    [key: string]: AiMethodState | PassportFrontAiCompare | unknown
  }
}

interface AppFile {
  Файлы:        any[]
}

export interface AppStatusEntry {
  period:               string
  status:               string
  id?:                  string
  checks?: {
    passport_front?:    { is_passport?: boolean; data?: Record<string, any> }
    passport_reg?:      { is_propiska?: boolean; data?: Record<string, any> }
    egrn?:              { is_egrn?: boolean; data?: Record<string, any> }
    akt?:               { is_akt?: boolean; data?: Record<string, any> }
  }
  verify_status?:       boolean
  check_status?:        boolean
  ai_status?:           boolean | Record<string, any> | string
  payload?:             Record<string, any>
}

interface AppItem {
  id:                   string
  service:              string
  date:                 string
  number:               string
  address:              string
  status:               string
  ai_status: {
    passport_front:    any
  }
  statuses?:            AppStatusEntry[]
  agreements?:          AppFile
  files?:               AppFile
}

interface AppsStore {
  apps:                 AppItem[]
  app:                  any | null
  loading:              boolean

  setApps:              (apps: AppItem[]) => void
  setApp:               (app: EditingApp | null) => void
  setLoading:           (loading: boolean) => void

  fetchApps:            (token: string) => Promise<any>
  saveFiles:            (token: string, id: string, files: any) => Promise<any>

}

const useAppsStore = create<AppsStore>((set, get) => ({
  apps:                 [],
  app:                  null,
  loading:              false,

  setApps:              (apps) => set({ apps }),
  setApp:               (app) => set({ app }),
  setLoading:           (loading) => set({ loading }),

  fetchApps:            async (token: string) => {
    set({ loading: true })
    try {
      const response = await api('ListServices', { token: token })

      console.log("fetchApps", response.data )

      if (!response.error) {
        set({ apps: response.data })
        return response
      }
    } catch (error: any) {
      console.error('Ошибка загрузки заявок:', error)
      return {error: true, message: error.message}
    } finally {
      set({ loading: false })
    }
  },

  saveFiles:            async (token: string, id: string, files: any) => {
    set({ loading: true })
    try {
      const response = await api('s_files', { token, id, files })

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error('Ошибка сохранения файлов:', error)
      return {error: true, mnessage: error.message}
    } finally {
      set({ loading: false })
    }
  }

}))


export default useAppsStore