import React, { useState } from 'react';
import { 
    IonModal, 
    IonButton, 
    IonIcon, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonAlert,
    IonInput,
    IonItem,
    IonLabel
} from '@ionic/react';
import { closeOutline, shareOutline, downloadOutline, printOutline, mailOutline } from 'ionicons/icons';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { 
    RenderCurrentScaleProps, 
    RenderZoomInProps, 
    RenderZoomOutProps, 
    zoomPlugin 
} from '@react-pdf-viewer/zoom';
import { Store, getData } from '../Store';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

interface PDFDocModalProps {
    /** Показать/скрыть модальное окно */
    isOpen: boolean;
    /** Функция закрытия модального окна */
    onClose: () => void;
    /** URL PDF файла (base64 или обычный URL) */
    pdfUrl: string;
    /** Название документа */
    fileName?: string;
    /** Заголовок документа */
    title?: string;
    /** Показать ли кнопки действий (отправка, скачивание и т.д.) */
    showActions?: boolean;
    /** Разрешить ли отправку документа по email */
    allowEmail?: boolean;
    /** Класс CSS для кастомизации */
    className?: string;
}

/**
 * Модальное окно для просмотра PDF документов
 * 
 * Функциональность:
 * - Просмотр PDF с возможностью масштабирования
 * - Отправка документа по email
 * - Скачивание документа
 * - Адаптивный интерфейс
 */
export function PDFDocModal({
    isOpen,
    onClose,
    pdfUrl,
    fileName = 'document.pdf',
    title = 'PDF Документ',
    showActions = true,
    allowEmail = true,
    className = ''
}: PDFDocModalProps) {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [emailAddress, setEmailAddress] = useState('');
    const [emailError, setEmailError] = useState('');

    // Инициализация плагина зума
    const zoomPluginInstance = zoomPlugin();
    const { CurrentScale, ZoomIn, ZoomOut } = zoomPluginInstance;

    /**
     * Валидация email адреса
     */
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    /**
     * Инициализация email из профиля пользователя
     */
    React.useEffect(() => {
        if (isOpen && !emailAddress) {
            const userEmail = Store.getState().profile?.email || '';
            setEmailAddress(userEmail);
        }
    }, [isOpen]);

    /**
     * Открытие диалога редактирования email
     */
    const handleOpenEmailDialog = () => {
        setEmailError('');
        setShowEmailDialog(true);
    };

    /**
     * Подтверждение и отправка email
     */
    const handleConfirmEmail = () => {
        if (!emailAddress.trim()) {
            setEmailError('Введите адрес электронной почты');
            return;
        }

        if (!validateEmail(emailAddress)) {
            setEmailError('Введите корректный адрес электронной почты');
            return;
        }

        setShowEmailDialog(false);
        handleEmailSend();
    };

    /**
     * Конвертация base64 в Blob для PDF viewer
     */
    const base64toBlob = (data: string): Blob => {
        const jarr = data.split(',');
        const base64WithoutPrefix = jarr[1]; // Удаляем префикс data:application/pdf;base64,
        
        const bytes = atob(base64WithoutPrefix);
        let length = bytes.length;
        const out = new Uint8Array(length);
        
        while (length--) {
            out[length] = bytes.charCodeAt(length);
        }
        
        return new Blob([out], { type: 'application/pdf' });
    };

    /**
     * Отправка PDF по email
     */
    const handleEmailSend = async () => {
        if (!allowEmail || !emailAddress) return;
        
        setIsLoading(true);
        setMessage('');
        
        try {
            const res = await getData('SendMail', {
                token: Store.getState().login.token,
                type: title,
                name: fileName,
                email: emailAddress, // Используем введенный email
                image: pdfUrl,
            });
            
            setMessage(res.message || `Документ отправлен на ${emailAddress}`);
        } catch (error) {
            setMessage('Ошибка отправки документа');
            console.error('Email send error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Скачивание PDF файла
     */
    const handleDownload = () => {
        try {
            const blob = base64toBlob(pdfUrl);
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            setMessage('Ошибка скачивания файла');
        }
    };

    /**
     * Печать документа
     */
    const handlePrint = () => {
        try {
            const blob = base64toBlob(pdfUrl);
            const url = URL.createObjectURL(blob);
            
            const printWindow = window.open(url);
            printWindow?.addEventListener('load', () => {
                printWindow.print();
            });
        } catch (error) {
            console.error('Print error:', error);
            setMessage('Ошибка печати документа');
        }
    };

    // Создаем URL для PDF viewer
    const blob = base64toBlob(pdfUrl);
    const fileUrl = URL.createObjectURL(blob);

    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onClose}
            className={`pdf-doc-modal ${className}`}
        >
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{title}</IonTitle>
                    <IonButton
                        fill="clear"
                        slot="end"
                        onClick={onClose}
                    >
                        <IonIcon icon={closeOutline} />
                    </IonButton>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                {/* Панель управления */}
                <div className="pdf-controls" style={{
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                }}>
                    {/* Контролы зума */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ZoomOut>
                            {(props: RenderZoomOutProps) => (
                                <IonButton
                                    size="small"
                                    fill="outline"
                                    onClick={props.onClick}
                                >
                                    -
                                </IonButton>
                            )}
                        </ZoomOut>

                        <CurrentScale>
                            {(props: RenderCurrentScaleProps) => (
                                <span style={{ 
                                    minWidth: '60px', 
                                    textAlign: 'center',
                                    fontSize: '14px'
                                }}>
                                    {`${Math.round(props.scale * 100)}%`}
                                </span>
                            )}
                        </CurrentScale>

                        <ZoomIn>
                            {(props: RenderZoomInProps) => (
                                <IonButton
                                    size="small"
                                    fill="outline"
                                    onClick={props.onClick}
                                >
                                    +
                                </IonButton>
                            )}
                        </ZoomIn>
                    </div>

                    {/* Действия с документом */}
                    {showActions && (
                        <div style={{ 
                            display: 'flex', 
                            gap: '8px', 
                            marginLeft: 'auto',
                            flexWrap: 'wrap'
                        }}>
                            <IonButton
                                size="small"
                                fill="outline"
                                onClick={handleDownload}
                            >
                                <IonIcon icon={downloadOutline} slot="icon-only" />
                            </IonButton>

                            <IonButton
                                size="small"
                                fill="outline"
                                onClick={handlePrint}
                            >
                                <IonIcon icon={printOutline} slot="icon-only" />
                            </IonButton>

                            {allowEmail && (
                                <IonButton
                                    size="small"
                                    fill="outline"
                                    onClick={handleOpenEmailDialog}
                                    disabled={isLoading}
                                    title="Отправить по почте"
                                >
                                    <IonIcon icon={mailOutline} slot="icon-only" />
                                </IonButton>
                            )}
                        </div>
                    )}
                </div>

                {/* Сообщения */}
                {message && (
                    <div style={{
                        padding: '8px 16px',
                        backgroundColor: message.includes('Ошибка') ? '#ffe6e6' : '#e6ffe6',
                        color: message.includes('Ошибка') ? '#d00' : '#080',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>
                        {message}
                    </div>
                )}

                {/* PDF Viewer */}
                <div style={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.js">
                        <Viewer
                            fileUrl={fileUrl}
                            plugins={[zoomPluginInstance]}
                        />
                    </Worker>
                </div>
            </IonContent>

            {/* Диалог редактирования email */}
            <IonModal
                isOpen={showEmailDialog}
                onDidDismiss={() => setShowEmailDialog(false)}
                className="email-edit-modal"
            >
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Отправить документ</IonTitle>
                        <IonButton
                            fill="clear"
                            slot="end"
                            onClick={() => setShowEmailDialog(false)}
                        >
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="ion-padding">
                    <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                            {title}
                        </h3>
                        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                            Файл: {fileName}
                        </p>
                    </div>

                    <IonItem>
                        <IonLabel position="stacked">
                            Адрес электронной почты *
                        </IonLabel>
                        <IonInput
                            type="email"
                            value={emailAddress}
                            placeholder="example@mail.com"
                            onIonInput={(e) => {
                                setEmailAddress(e.detail.value!);
                                setEmailError('');
                            }}
                            className={emailError ? 'ion-invalid' : ''}
                        />
                    </IonItem>

                    {emailError && (
                        <div style={{
                            color: '#d32f2f',
                            fontSize: '12px',
                            marginTop: '4px',
                            marginLeft: '16px'
                        }}>
                            {emailError}
                        </div>
                    )}

                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginTop: '24px',
                        justifyContent: 'flex-end'
                    }}>
                        <IonButton
                            fill="outline"
                            onClick={() => setShowEmailDialog(false)}
                        >
                            Отмена
                        </IonButton>
                        <IonButton
                            onClick={handleConfirmEmail}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Отправка...' : 'Отправить'}
                        </IonButton>
                    </div>

                    {message && (
                        <div style={{
                            marginTop: '16px',
                            padding: '12px',
                            borderRadius: '4px',
                            backgroundColor: message.includes('Ошибка') ? '#ffebee' : '#e8f5e8',
                            color: message.includes('Ошибка') ? '#c62828' : '#2e7d32',
                            fontSize: '14px'
                        }}>
                            {message}
                        </div>
                    )}
                </IonContent>
            </IonModal>
        </IonModal>
    );
}

/**
 * Хук для управления PDFDocModal
 */
export function usePDFDocModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [pdfData, setPdfData] = useState<{
        url: string;
        fileName?: string;
        title?: string;
    } | null>(null);

    const openModal = (
        pdfUrl: string, 
        fileName?: string, 
        title?: string
    ) => {
        setPdfData({ url: pdfUrl, fileName, title });
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setPdfData(null);
    };

    return {
        isOpen,
        pdfData,
        openModal,
        closeModal
    };
}