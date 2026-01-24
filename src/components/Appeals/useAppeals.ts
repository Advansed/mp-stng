import { useEffect } from 'react'
import { useToken } from '../Login/authStore'
import useAppealsStore from '../../Store/appealsStore'

export const useAppeals = () => {
  const token = useToken()
  const {
    appeals,
    messages,
    selectedAppeal,
    loading,
    setSelectedAppeal,
    fetchAppeals,
    fetchMessages,
    sendMessage
  } = useAppealsStore()


  const selectAppeal = (appeal: any) => {
    setSelectedAppeal(appeal)
    if (appeal && token) {
      fetchMessages(token, appeal.Код)
    }
  }

  const clearSelection = () => {
    setSelectedAppeal(null)
  }

  const refreshAppeals = () => {
    if (token) {
      fetchAppeals(token)
    }
  }

  const refreshMessages = () => {
    if (selectedAppeal && token) {
      fetchMessages(token, selectedAppeal.Код)
    }
  }

  const sendAppealMessage = async (text: string, image?: any) => {
    if (selectedAppeal && token) {
      await sendMessage(token, selectedAppeal.Код, text, image)
    }
  }

  return {
    appeals,
    messages,
    selectedAppeal,
    loading,
    selectAppeal,
    clearSelection,
    refreshAppeals,
    refreshMessages,
    sendAppealMessage
  }
}