import React, { useEffect }     from 'react';
import { useToast }             from '../Toast';
import { useServices }          from './useService';
import { IonCard, IonIcon, IonLoading, IonText } 
                                from '@ionic/react';
import { buildOutline, callOutline, documentTextOutline, gitBranchOutline, gitMergeOutline } 
                                from 'ionicons/icons';
import { useNavigateStore }     from '../../Store/navigateStore';
import { useNavigation }        from '../../pages/useNavigation';
import { Order }                from './Order';
import { TService, useServiceStore }             from '../../Store/serviceStore';


const icons = {

    gitMergeOutline:        gitMergeOutline,
    buildOutline:           buildOutline,
    documentTextOutline:    documentTextOutline,
    callOutline:            callOutline,
    gitBranchOutline:       gitBranchOutline,

}

export const Services: React.FC = () => {
  
  const toast = useToast();

  const { services, loadServices, saveService, preview } = useServices()
  const { page, setPage, item, setItem } = useNavigation()

  const loading = useServiceStore((state) => state.loading)

  const currentPage = useNavigateStore(state => state.currentPage)


  useEffect(()=>{
    if(currentPage === '/page/services'){
        if(!services || services.length === 0 )
            loadServices()

    }
  },[currentPage])


  let elem = <></>
  
  for(let i = 0; i < services.length;i++){
      elem = <>
          { elem }
          <IonCard className="pt-2 pb-2">
              <div className="flex"
                  onClick={()=>{
                        setItem( services[i] )
                        setPage( page + 1)
                  }}
              >
                  <IonIcon icon = { icons[services[0].icon] }  className="h-2 w-20" color="tertiary"/>
                  <IonText className="cl-prim fs-12 w-80"><b>{ services[i].text }</b> </IonText>
              </div>
          </IonCard>
      </>
    
  }
  return <>
    <IonLoading isOpen = { loading } message={ "Подождите загрузка услуг..." }/>
    { 
        page === 0 
          ? elem
          : <Order 
              service   = { item as TService }
              onSave    = { async(orderData: any)=>{ return await saveService(orderData)  } }
              onBack    = { ()=>{ setPage( 0 )} }
              onPreview = { preview }
          />
    }
  </> 
};