import React, { useState } from 'react';
import { 
    IonCard, 
    IonInput, 
    IonButton, 
    IonLoading, 
    IonItem, 
    IonIcon, 
    IonLabel 
} from '@ionic/react';
import { closeCircleOutline, addOutline } from 'ionicons/icons';
import { User, CreditCard } from 'lucide-react'; // Используем те же иконки
import { LicsPage } from './types';
import { useToast } from '../../Toast';

import styles from './AddLic.module.css';

interface Props {
    setPage: (page: number) => void;
    addLic: (lic: string) => Promise<any>;
}

export function AddLic({ setPage, addLic }: Props) {
    const [form, setForm] = useState({ LC: "" });
    const [isFocused, setIsFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    async function handleAdd() {
        if (!form.LC.trim()) {
            toast.error("Введите номер лицевого счета");
            return;
        }

        setLoading(true);
        const res = await addLic(form.LC);
        setLoading(false);

        if (res.error) {
            toast.error(res.message);
        } else {
            toast.success("Лицевой счет добавлен");
            setPage(LicsPage.MAIN);
        }
    }

    return (
        <>
            <IonLoading isOpen={loading} message="Подождите..." />

            <IonCard className={`${styles.card} pb-1`}>
                {/* Заголовок в стиле LicItem */}
                <div className="flex fl-space mt-1 ml-1 mr-1">
                    <div className="cl-black fs-12">
                        <b>Новый лицевой счет</b>
                    </div>
                    <IonButton fill="clear" onClick={() => setPage(LicsPage.MAIN)}>
                        <IonIcon icon={closeCircleOutline} color="medium" slot="icon-only" />
                    </IonButton>
                </div>

                {/* Инфо-строка как в LicItem */}
                <div className="ml-1 mr-1 t-underline pb-05 fs-09 flex">
                    <div>
                        <User size={16} className="w-15 h-15 cl-prim" />
                    </div>
                    <div className="ml-1 cl-prim"><b>Добавить л/с</b></div>
                </div>

                {/* Поле ввода с видимыми краями */}
                <div className="mt-1 ml-1 mr-1">
                    <div className="fs-08 cl-gray ml-05 mb-05">Введите номер л/с:</div>
                    <div className={`
                        ${styles.inputWrapper} 
                        ${isFocused ? styles.inputWrapperFocus : ''}
                    `}>
                        <IonItem lines="none" className={styles.inputItem}>
                            <CreditCard size={18} className="cl-prim mr-1" />
                            <IonInput
                                value={form.LC}
                                placeholder="000000000"
                                mode="md"
                                onIonFocus={() => setIsFocused(true)}
                                onIonBlur={() => setIsFocused(false)}
                                onIonInput={(e) => setForm({ ...form, LC: e.detail.value! })}
                            />
                        </IonItem>
                    </div>
                </div>

                {/* Кнопки действий в стиле сегментов/кнопок LicItem */}
                <div className={styles.buttonGroup}>
                    <IonButton
                        mode="ios"
                        color="tertiary"
                        className={`${styles.actionButton} fs-09`}
                        onClick={handleAdd}
                    >
                        <IonIcon icon={addOutline} slot="start" />
                        <IonLabel>Добавить</IonLabel>
                    </IonButton>
                    
                    <IonButton
                        mode="ios"
                        fill="outline"
                        color="medium"
                        className={`${styles.actionButton} fs-09`}
                        onClick={() => setPage(LicsPage.MAIN)}
                    >
                        <IonLabel>Отмена</IonLabel>
                    </IonButton>
                </div>
            </IonCard>
        </>
    );
}