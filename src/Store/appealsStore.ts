import { create } from 'zustand'

interface Appeal {
  Код: string
  Наименование: string
  Период: string
  Картинка?: boolean
  Текст?: string
  Кнт: number
  Описание?: string
}

interface Message {
  Отправлен: boolean
  Картинка?: boolean
  Текст?: string
  Ссылка?: string
  Время?: string
}

interface AppealsStore {
  appeals:              Appeal[]
  messages:             Message[]
  selectedAppeal:       Appeal | null
  loading:              boolean
  
  setAppeals:           (appeals: Appeal[]) => void
  setMessages:          (messages: Message[]) => void
  setSelectedAppeal:    (appeal: Appeal | null) => void
  setLoading:           (loading: boolean) => void
  
  fetchAppeals:         (token: string) => Promise<void>
  fetchMessages:        (token: string, channelCode: string) => Promise<void>
  sendMessage:          (token: string, recipient: string, text: string, image?: any) => Promise<void>
}

const useAppealsStore = create<AppealsStore>((set, get) => ({
  appeals:              [],
  messages:             [],
  selectedAppeal:       null,
  loading:              false,

  setAppeals:           ( appeals ) => set({ appeals }),
  setMessages:          ( messages ) => set({ messages }),
  setSelectedAppeal:    ( appeal ) => set({ selectedAppeal: appeal }),
  setLoading:           ( loading ) => set({ loading }),

  fetchAppeals:         async (token: string) => {
    set({ loading: true })
    try {
      const response = await fetch('https://aostng.ru/api/v2/getChannels/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = await response.json()
      
      if (!data.error) {
        set({ appeals: data.data })
      }
    } catch (error) {
      console.error('Ошибка загрузки обращений:', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchMessages:        async (token: string, channelCode: string) => {
    set({ loading: true })
    try {
      const response = await fetch('https://aostng.ru/api/v2/getMessages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, Канал: channelCode })
      })
      const data = await response.json()
      
      if (!data.error) {
        set({ messages: data.data })
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error)
    } finally {
      set({ loading: false })
    }
  },

  sendMessage:          async (token: string, recipient: string, text: string, image?: any) => {
    set({ loading: true })
    try {
      const body: any = { token, Получатель: recipient, Текст: text }
      if (image) body.Картинка = image

      const response = await fetch('https://aostng.ru/api/v2/sendMessage/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await response.json()
      
      if (!data.error) {
        // Перезагрузить сообщения после отправки
        await get().fetchMessages(token, recipient)
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
    } finally {
      set({ loading: false })
    }
  }

}))

export default useAppealsStore