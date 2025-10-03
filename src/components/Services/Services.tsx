import React from 'react'
import { IonButton, IonLoading } from '@ionic/react'
import './Services.css'
import { useServices } from './useService'

// TODO: Импортировать нужные компоненты
// import { FIO, MCHRG, Filess, Rooms, Equips, Meters, Sign } from './ServiceComponents'

export function Services() {
  const {
    info,
    order,
    loading,
    setOrder,
    handleSave
  } = useServices()

  // TODO: Перенести логику рендеринга страниц из оригинального кода
  const renderCurrentPage = () => {
    if (!info || !order) return null

    // TODO: Реализовать рендеринг компонентов на основе page и info
    const pageData = Object.entries(order).find(([key, value]: any) => 
      value?.Страница === page
    )

    if (!pageData) return null

    const [key, data] = pageData

    switch (key) {
      case 'ФИО':
        // return <FIO info={info.ФИО} />
        return <div>ФИО компонент</div>
      case 'МЧРГ':
        // return <MCHRG info={info.МЧРГ} />
        return <div>МЧРГ компонент</div>
      case 'Файлы':
        // return <Filess info={info.Файлы.Файлы} />
        return <div>Файлы компонент</div>
      default:
        return <div>{info[key]?.Описание}</div>
    }
  }

  const renderMessages = () => {
    if (messages.length === 0) return null
    
    return (
      <div className="error-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="error-message">{msg}</div>
        ))}
      </div>
    )
  }

  const renderSuccessPage = () => (
    <div className="success-page">
      <div className="ml-1 mt-1 flex fl-space">
        <div className="fs-14">Заявка подана успешно!</div>
      </div>
      <div className="ml-2 mr-2">
        <p>Ваша заявка принята в обработку.</p>
        <p>В течение нескольких минут ваша заявка появится в разделе Договора, Заявки.</p>
      </div>
    </div>
  )

  const renderFailPage = () => (
    <div className="fail-page">
      <div className="ml-1 mt-1 flex fl-space">
        <div className="fs-14">Ошибка при подаче заявки!</div>
      </div>
      <div className="ml-2 mr-2">
        <p>Что-то пошло не так...</p>
        <p>Попробуйте подать заявку еще раз</p>
      </div>
    </div>
  )

  // Обработка специальных страниц
  if (page === 99) return renderSuccessPage()
  if (page === 98) return renderFailPage()

  return (
    <>
      <IonLoading isOpen={loading} message="Обработка..." />
      
      {renderMessages()}
      
      <div className="services-container">
        {renderCurrentPage()}
        
        <div className="navigation-buttons">
          {page > 0 && (
            <IonButton onClick={goBack}>
              Назад
            </IonButton>
          )}
          
          <IonButton onClick={() => handlePageChange(page + 1)}>
            Далее
          </IonButton>
          
          <IonButton onClick={handleSave}>
            Сохранить
          </IonButton>
        </div>
      </div>
    </>
  )
}