import { create } from 'zustand'

interface NewsItem {
  id: string
  name: string
  date: string
  preview: string
  image?: string
  detail?: string
}

interface NewsStore {
  newsItems: NewsItem[]
  noticeItems: NewsItem[]
  selectedType: 0 | 1 // 0 = новости, 1 = объявления
  currentPage: number
  loading: boolean
  modal: NewsItem | null
  
  setNewsItems: (items: NewsItem[]) => void
  setNoticeItems: (items: NewsItem[]) => void
  setSelectedType: (type: 0 | 1) => void
  setCurrentPage: (page: number) => void
  setLoading: (loading: boolean) => void
  setModal: (item: NewsItem | null) => void
  
  fetchNews: (page: number) => Promise<void>
  fetchNotices: (page: number) => Promise<void>
  fetchNewsDetail: (id: string) => Promise<void>
  fetchNoticeDetail: (id: string) => Promise<void>
  loadMore: () => Promise<void>
  switchType: (type: 0 | 1) => void
  reset: () => void
}

const useNewsStore = create<NewsStore>((set, get) => ({
  newsItems: [],
  noticeItems: [],
  selectedType: 0,
  currentPage: 0,
  loading: false,
  modal: null,

  setNewsItems: (items) => set({ newsItems: items }),
  setNoticeItems: (items) => set({ noticeItems: items }),
  setSelectedType: (type) => set({ selectedType: type }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setLoading: (loading) => set({ loading }),
  setModal: (item) => set({ modal: item }),

  fetchNews: async (page: number) => {
    set({ loading: true })
    try {
      const response = await fetch(`https://aostng.ru/api/v2/news/all/page/${page}`)
      const data = await response.json()
      
      if (data.status && data.data) {
        // Обработка URL изображений
        const processedData = data.data.map((item: any) => ({
          ...item,
          image: item.image && typeof item.image === 'string' && item.image.startsWith('/') 
            ? `https://aostng.ru${item.image}` 
            : item.image
        }))
        
        const state = get()
        const existingItems = state.selectedType === 0 ? state.newsItems : []
        set({ newsItems: [...existingItems, ...processedData] })
      }
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchNotices: async (page: number) => {
    set({ loading: true })
    try {
      const response = await fetch(`https://aostng.ru/api/v2/notice/all/page/${page}`)
      const data = await response.json()
      
      if (data.status && data.data) {
        // Обработка URL изображений
        const processedData = data.data.map((item: any) => ({
          ...item,
          image: item.image && typeof item.image === 'string' && item.image.startsWith('/') 
            ? `https://aostng.ru${item.image}` 
            : item.image
        }))
        
        const state = get()
        const existingItems = state.selectedType === 1 ? state.noticeItems : []
        set({ noticeItems: [...existingItems, ...processedData] })
      }
    } catch (error) {
      console.error('Ошибка загрузки объявлений:', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchNewsDetail: async (id: string) => {
    try {
      const response = await fetch(`https://aostng.ru/api/v2/news/${id}/`)
      const data = await response.json()
      
      if (data.status && data.data) {
        // Обработка URL изображения
        if (data.data.image && typeof data.data.image === 'string' && data.data.image.startsWith('/')) {
          data.data.image = `https://aostng.ru${data.data.image}`
        }
        
        set({ modal: data.data })
      }
    } catch (error) {
      console.error('Ошибка загрузки детальной новости:', error)
    }
  },

  fetchNoticeDetail: async (id: string) => {
    try {
      const response = await fetch(`https://aostng.ru/api/v2/notice/${id}/`)
      const data = await response.json()
      
      if (data.status && data.data) {
        // Обработка URL изображения
        if (data.data.image && typeof data.data.image === 'string' && data.data.image.startsWith('/')) {
          data.data.image = `https://aostng.ru${data.data.image}`
        }
        
        set({ modal: data.data })
      }
    } catch (error) {
      console.error('Ошибка загрузки детального объявления:', error)
    }
  },

  loadMore: async () => {
    const state = get()
    const nextPage = state.currentPage + 1
    
    if (state.selectedType === 0) {
      await state.fetchNews(nextPage)
    } else {
      await state.fetchNotices(nextPage)
    }
    
    set({ currentPage: nextPage })
  },

  switchType: (type: 0 | 1) => {
    set({ 
      selectedType: type, 
      currentPage: 0,
      newsItems: type === 0 ? [] : get().newsItems,
      noticeItems: type === 1 ? [] : get().noticeItems
    })
  },

  reset: () => {
    set({
      newsItems: [],
      noticeItems: [],
      selectedType: 0,
      currentPage: 0,
      loading: false,
      modal: null
    })
  }
}))

export default useNewsStore