// src/components/Lics/components/LicItem/LicItem.tsx
import React, { FC, useState } from 'react';
import { IonAlert, IonButton, IonCard, IonIcon, IonLabel, IonLoading, IonSegment, IonSegmentButton, IonSegmentContent, IonSegmentView } from '@ionic/react';
import { alertCircleOutline, cardOutline, closeCircleOutline, codeWorkingOutline, documentAttachOutline, listOutline } from 'ionicons/icons';
import { LicsPage } from '../types';
import { PDFDocModal } from '../../../Files/PDFDocModal';
import { LicItemProps } from './types';
import { api } from '../../../../Store/api';
import { useToken } from '../../../../Store/loginStore';
import { User, MapPin } from 'lucide-react';

export const LicItem: FC<LicItemProps> = ({ info, setItem, setPage, delAccount }) => {
  const [load, setLoad] = useState(false);
  const [modal, setModal] = useState<any>();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const token = useToken()

  const confirmDelete = () => {
    setShowDeleteAlert(true);
    console.log("alert");
  };

  const handleDeleteConfirm = () => {
    setShowDeleteAlert(false);
    delAccount(info.code);
    setPage(LicsPage.MAIN);
  };

  const handleDeleteCancel = () => {
    setShowDeleteAlert(false);
  };

  const quits = async () => {
    setLoad(true);
    // TODO: Получить токен из zustand store
    // const token = useLoginStore(state => state.token);
    
    try {
      const res = await api('getQuits', { token: token, LC: info.code })
      
      console.log(res)
      if (!res.error) {
        setModal(res.data);
      }
    } catch (error) {
      console.error('Error fetching quits:', error);
    }
    setLoad(false);
  };

  return (
    <>
      <IonLoading isOpen={load} message="Подождите..." />
      <IonCard className="pb-1">
        <div className="flex fl-space mt-1 ml-1">
          <div className="cl-black fs-12">
            <b>{"л/с № " + info.code}</b>
          </div>
          <IonButton
            fill="clear"
            onClick={() => {
              console.log(" click");
              confirmDelete();
            }}
          >
            <IonIcon icon={closeCircleOutline} color="danger" slot="icon-only" />
          </IonButton>
        </div>
        
        <div className="ml-1 mr-1 t-underline pb-05 fs-09 flex">
          <div>
             <User size={16} className={ "w-15 h-15 cl-prim " } />
            {/* <IonIcon icon={personOutline} className="h-15 w-15" color="tertiary" /> */}
          </div>
          <div className="ml-1 cl-prim "><b>{info.name}</b></div>
        </div>
        
        <div className="ml-1 mr-1 t-underline pb-05 mt-1 flex fs-09">
          <div>
            <MapPin size={16} className={ "w-15 h-15 cl-prim "} />
          </div>
          <div className="ml-1 cl-black">{info.address}</div>
        </div>
        
        <div className="pl-1 pr-1 pt-1">
          <IonSegment value="first" mode="ios">
            <IonSegmentButton value="first" contentId={"first" + info.id}>
              <IonLabel>Счета</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="second" contentId={"second" + info.id}>
              <IonLabel>Действия</IonLabel>
            </IonSegmentButton>
          </IonSegment>
          
          <IonSegmentView>
            <IonSegmentContent id={"first" + info.id}>
                <div className='flex fl-space mt-05'>
                    <div className='ml-2'>
                        {
                            info.sum < 0 ? "Аванс" : "К оплате" 
                        }
                    </div>
                    <div className='cl-prim fs-11 mt-05 mb-05 mr-2'>
                        <b>
                            { 
                                info.sum < 0 
                                    ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( ( -info.sum ) ) 
                                    : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format( ( info.sum ) ) 
                            }
                        </b>
                    </div>
                </div>
                <div className='flex fl-space'>
                            
                    <IonButton
                        mode = { 'ios' }
                        color={ "tertiary" }
                        className='fs-09 w-50'
                        onClick={()=>{
                            setItem( info )
                            setPage( 4 )                  
                        }}
                    >
                        <IonIcon icon = { cardOutline } />
                        <IonLabel className='ml-1'>{ "Оплата" }</IonLabel>
                                
                    </IonButton>
                    { info.counters.length > 0 && (
                      <IonButton
                          mode = { 'ios' }
                          color={ "tertiary" }
                          className='fs-09 w-50'
                          expand='block'
                          onClick={()=>{
                              setItem( info )
                              setPage( 6 )  
                          }}
                      >
                          <IonIcon icon = { codeWorkingOutline } />
                          <IonLabel className='ml-1'> { "Показания" } </IonLabel>
                                      
                      </IonButton>          
                    )}
                </div>
                
                <div className={
                    info.notice.type === "Срочное" 
                      ? 'ls-item5'
                    : info.notice.type === "Уведомление" 
                      ? 'ls-item4'
                    : 'ls-item2'
                  }
                    onClick={()=>{
                    console.log("quits")
                    // Quits()
                    }}
                >
                                  
                <div className='ml-05'>
                    <IonIcon icon = { alertCircleOutline }  className='h-15 w-15' />
                </div>
                                  
                <div className='ml-1'>
                    <div className='fs-09'>
                      { 
                        info.notice.type === "Напоминание" 
                            ? <div><b>Напоминание: </b> { info.notice.label }</div> 
                        : info.notice.type === "Уведомление" 
                            ? <div><b>Уведомление: </b> { info.notice.label }</div> 
                        : info.notice.type === "Срочное" 
                            ? <div><b>Срочно: </b> { info.notice.label }</div> 
                        :<></>
                      
                      }
                        
                    </div>
                </div>
            </div> 
                
            </IonSegmentContent>
            
            <IonSegmentContent id={"second" + info.id}>
              <div>
                  <div className="ls-item1" onClick={() => {
                    setItem(info);
                    setPage(LicsPage.HISTORY);
                  }}>
                    <div className="ml-05">
                      <IonIcon icon={listOutline} className="h-15 w-15" color="primary" />
                    </div>
                    <div className="ml-1">
                      <div className="fs-09"><b>История оплат </b></div>
                      <div className="fs-08">Посмотреть список предыдущих оплат</div>
                    </div>
                  </div>
                
                <div className="ls-item1" onClick={quits}>
                  <div className="ml-05">
                    <IonIcon icon={documentAttachOutline} className="h-15 w-15" color="primary" />
                  </div>
                  <div className="ml-1">
                    <div className="fs-09"><b>Квитанция </b></div>
                    <div className="fs-08">Просмотр, скачивание квитанции</div>
                  </div>
                </div>
              </div>
            </IonSegmentContent>
          </IonSegmentView>
        </div>
      </IonCard>
      
      {modal !== undefined && (
        <PDFDocModal
          isOpen      = { modal !== undefined }
          onClose     = { () => setModal(undefined) }
          pdfUrl      = { modal?.dataUrl }
          fileName    = "Квитанция.pdf"
          title       = "Квитанция"
          showActions = { true }
          allowEmail  = { true }
        />
      )}
      
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={handleDeleteCancel}
        header="Подтверждение"
        message="Действительно удалить этот лицевой счет?"
        buttons={[
          {
            text: 'Отмена',
            role: 'cancel',
            handler: handleDeleteCancel
          },
          {
            text: 'Удалить',
            role: 'destructive',
            handler: handleDeleteConfirm
          }
        ]}
      />
    </>
  );
};
