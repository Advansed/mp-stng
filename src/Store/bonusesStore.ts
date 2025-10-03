import { create } from 'zustand'
import { api } from './api'

interface BonusCard {
  owner_id?: string
  card_id?: string
  balance?: number
  QRCode?: string
  name?: string
  surname?: string
  lastname?: string
}

interface Profile {
  surname: string
  name: string
  lastname: string
}

interface BonusesStore {
  bonusCard: BonusCard | null
  profile: Profile
  loading: boolean
  message: string
  
  setBonusCard: (card: BonusCard | null) => void
  setProfile: (profile: Profile) => void
  setLoading: (loading: boolean) => void
  setMessage: (message: string) => void
  
  fetchBonusCard: (token: string) => Promise<void>
  createBonusCard: (token: string) => Promise<void>
  saveProfile: (token: string, profile: Profile) => Promise<void>
}

const useBonusesStore = create<BonusesStore>((set, get) => ({
  bonusCard: null,
  profile: { surname: '', name: '', lastname: '' },
  loading: false,
  message: '',

  setBonusCard: (card) => set({ bonusCard: card }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setMessage: (message) => set({ message }),

  fetchBonusCard: async (token: string) => {
    set({ loading: true })
    try {
      const res = await api('spClient', token);

      if (!res.error) {
        set({ bonusCard: res.data })
      } else {
        set({ bonusCard: null })
      }
    } catch (error) {
      console.error('Ошибка загрузки бонусной карты:', error)
      set({ bonusCard: null })
    } finally {
      set({ loading: false })
    }
  },

  createBonusCard: async (token: string) => {
    set({ loading: true, message: '' })
    try {
      const response = await fetch('https://aostng.ru/api/v2/spCreateClient/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = await response.json()
      
      if (!data.error) {
        set({ bonusCard: data.data })
      } else {
        set({ bonusCard: null, message: data.message })
      }
    } catch (error) {
      console.error('Ошибка создания бонусной карты:', error)
      set({ message: 'Ошибка создания карты' })
    } finally {
      set({ loading: false })
    }
  },

  saveProfile: async (token: string, profile: Profile) => {
    set({ loading: true })
    try {
      const response = await fetch('https://aostng.ru/api/v2/profile/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          surname: profile.surname,
          name: profile.name,
          lastname: profile.lastname
        })
      })
      const data = await response.json()
      
      if (!data.error) {
        set({ profile: data.data })
      } else {
        console.error('Ошибка сохранения профиля:', data.message)
      }
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error)
    } finally {
      set({ loading: false })
    }
  }
}))

export default useBonusesStore