import { useEffect } from 'react'
import { useToken } from '../Login/authStore'
import useBonusesStore from '../../Store/bonusesStore'

export const useBonuses = () => {
  const token = useToken()
  const {
    bonusCard,
    profile,
    loading,
    message,
    setMessage,
    fetchBonusCard,
    createBonusCard,
    saveProfile
  } = useBonusesStore()

  useEffect(() => {
    // Загружаем только если находимся на странице бонусов
    if (token && window.location.pathname.includes('/page/bonuse')) {
      fetchBonusCard(token)
    }
  }, [token, fetchBonusCard])

  const handleCreateCard = async () => {
    if (token) {
      const fullName = profile.surname + profile.name + profile.lastname
      if (fullName.length > 0) {
        await createBonusCard(token)
      } else {
        setMessage('Заполните ФИО')
      }
    }
  }

  const handleSaveProfile = async (newProfile: typeof profile) => {
    if (token) {
      await saveProfile(token, newProfile)
    }
  }

  const clearMessage = () => {
    setMessage('')
  }

  return {
    bonusCard,
    profile,
    loading,
    message,
    handleCreateCard,
    handleSaveProfile,
    clearMessage
  }
}