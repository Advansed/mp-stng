import { useEffect } from 'react'
import useNewsStore from '../../Store/newsStore'

export const useNews = () => {
  const {
    newsItems,
    noticeItems,
    selectedType,
    currentPage,
    loading,
    modal,
    setModal,
    fetchNews,
    fetchNotices,
    fetchNewsDetail,
    fetchNoticeDetail,
    loadMore,
    switchType,
    reset
  } = useNewsStore()

  // Автоматическая загрузка при смене типа
  useEffect(() => {
    if (selectedType === 0) {
      if (newsItems.length === 0) {
        fetchNews(1)
      }
    } else {
      if (noticeItems.length === 0) {
        fetchNotices(1)
      }
    }
  }, [selectedType, newsItems.length, noticeItems.length, fetchNews, fetchNotices])

  const currentItems = selectedType === 0 ? newsItems : noticeItems

  const handleTypeSwitch = (type: 0 | 1) => {
    switchType(type)
  }

  const handleItemClick = async (item: any) => {
    if (selectedType === 0) {
      await fetchNewsDetail(item.id)
    } else {
      await fetchNoticeDetail(item.id)
    }
  }

  const closeModal = () => {
    setModal(null)
  }

  const handleScrollEnd = (scrollTop: number, lastTop: number) => {
    if ((lastTop - scrollTop) < 1000 && !loading) {
      loadMore()
    }
  }

  return {
    currentItems,
    selectedType,
    loading,
    modal,
    handleTypeSwitch,
    handleItemClick,
    closeModal,
    handleScrollEnd,
    reset
  }
}