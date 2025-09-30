import React, { useState } from 'react'
import { IonCard, IonInput, IonButton, IonLoading } from '@ionic/react'
import { LicsPage } from './types'

interface Props {
    setPage:    ( page: number ) => void,
    addLic:     ( lic: string, fio: string) => Promise<void>
}

export function AddLic({ setPage, addLic }: Props) {
    
    const [form,    setForm]    = useState({ LC: "", fio: "" })
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleAdd() {
        setLoading(true)
        await addLic( form.LC, form.fio )
        setLoading(false)       

        setPage( LicsPage.MAIN )
    }   

    return <>

        <IonLoading isOpen={loading} message="Подождите..." />

        <IonCard className='pb-1'>
            
            <div className='flex fl-space mt-1 ml-1'>
                <h4><b>Новый лицевой счет</b></h4>
            </div>
            
            <div className='ml-1 mr-1 t-underline s-input'>
                <IonInput
                    className='s-input-1 ml-1'
                    placeholder='Номер л/с'
                    value={form.LC}
                    mode="ios"
                    onIonInput={(e) => {
                        setForm(prev => ({ ...prev, LC: e.detail.value as string }))
                        setMessage("")
                    }}
                />
            </div>
            
            <div className='ml-1 mr-1 mt-1 t-underline s-input'>
                <IonInput
                    className='s-input-1 ml-1'
                    placeholder='Первые три буквы фамилии'
                    value={form.fio}
                    maxlength={3}
                    mode="ios"
                    onIonInput={(e) => {
                        setForm(prev => ({ ...prev, fio: e.detail.value as string }))
                        setMessage("")
                    }}
                />
            </div>
            
            { message && <div className='ml-1 mr-1'><p>{message}</p></div> }
            
            <div className='ml-1 mr-1'>
                <IonButton
                    color="tertiary"
                    expand="block"
                    mode="ios"
                    onClick={() => {
                        setMessage("")
                        form.LC && form.fio ? handleAdd() : setPage(0)
                    }}
                >
                    {form.LC && form.fio ? "Добавить" : "Закрыть"}
                </IonButton>
            </div>

        </IonCard>
    </>
}