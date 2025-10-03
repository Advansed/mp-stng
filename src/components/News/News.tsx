import React, { useState } from "react"
import { IonButton, IonCard, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonLabel, IonModal, IonText, IonLoading } from "@ionic/react"
import "./News.css"
import { useNews } from "./useNews"

export function News() {
    const {
        currentItems,
        selectedType,
        loading,
        modal,
        handleTypeSwitch,
        handleItemClick,
        closeModal,
        handleScrollEnd
    } = useNews()

    const [scrollTop, setScrollTop] = useState(0)
    const [lastTop, setLastTop] = useState(0)

    // TODO: Добавить обработку кнопки назад через Store.subscribe
    // Store.subscribe({num : 404, type: "back", func: handleBack})

    return (
        <>
            <div className="ml-1 mt-1">
                <div className="n-btn-wrapper">
                    <IonButton 
                        className={selectedType === 0 ? "n-button lightBlue" : "n-button n-backgroundGrey"} 
                        fill="clear" 
                        expand="block" 
                        mode="ios"
                        onClick={() => handleTypeSwitch(0)}
                    >
                        <IonText className="ml-2 mr-2">Новости</IonText>
                    </IonButton>
                    <IonButton 
                        className={selectedType === 0 ? "n-button n-backgroundGrey" : "n-button lightBlue"} 
                        fill="clear" 
                        expand="block" 
                        mode="ios"
                        onClick={() => handleTypeSwitch(1)}
                    >
                        <IonText className="ml-1 mr-1">Объявления</IonText>
                    </IonButton>
                </div>
            </div>

            <div className="ml-1">
                <IonText>
                    <h1 className="main-title ion-text-wrap ion-text-start">
                        {selectedType === 0 ? "Новости" : "Объявления"}
                    </h1>
                </IonText>
            </div>

            <IonContent
                scrollEvents={true}
                onIonScroll={(e) => {
                    setScrollTop((e.detail as any).currentY)
                    setLastTop((e.target as any).lastChild?.offsetTop || 0)
                }}
                onIonScrollEnd={() => {
                    handleScrollEnd(scrollTop, lastTop)
                }}
            >
                {currentItems.map((item, i) => (
                    <NewsCard 
                        key={item.id || i} 
                        item={item} 
                        onClick={() => handleItemClick(item)} 
                    />
                ))}

                <IonInfiniteScroll threshold="10%">
                    <IonInfiniteScrollContent loading-spinner="bubbles" />
                </IonInfiniteScroll>
            </IonContent>

            <NewsModal 
                modal={modal} 
                isOpen={modal !== null} 
                onClose={closeModal} 
            />

            <IonLoading isOpen={loading} message="Загрузка..." />
        </>
    )
}

function NewsCard({ item, onClick }: { item: any, onClick: () => void }) {
    return (
        <IonCard className="pb-1" onClick={onClick}>
            {item.image && (
                <img src={item.image} alt="Картинка" />
            )}
            <div className="mt-1 ml-1">
                <IonLabel>{item.date}</IonLabel>
            </div>
            <div className="mt-1 ml-1 fs-15 fs-bold cl-black">
                {item.name}
            </div>
            <div className="mt-1 ml-1 mr-1 fs-12">
                <p>{item.preview}</p>
            </div>
        </IonCard>
    )
}

function NewsModal({ modal, isOpen, onClose }: { modal: any, isOpen: boolean, onClose: () => void }) {
    return (
        <IonModal
            className="w-100 h-100"
            isOpen={isOpen}
            onDidDismiss={onClose}
        >
            <IonContent 
                className="w-100 h-100"
                onClick={onClose}
            >
                {modal?.image && (
                    <img src={modal.image} alt="Картинка" />
                )}
                <div className="mt-1 ml-1 fs-15 fs-bold fs-prim">
                    {modal?.preview}
                </div>
                <div className="mt-1 ml-1 mr-1 fs-12">
                    <p dangerouslySetInnerHTML={{ __html: modal?.detail || '' }} />
                </div>
            </IonContent>
        </IonModal>
    )
}