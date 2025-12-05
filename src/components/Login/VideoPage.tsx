import React, { useEffect, useRef } from 'react';
import { IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { close } from 'ionicons/icons';
import { LoginPage } from './Login';
import './VideoPage.css'

interface VideoPageProps {
    onNavigate:     ( page: LoginPage ) => void;
}

const VideoPage: React.FC<VideoPageProps> = ({ onNavigate }) => {

  return (
    <div>
        <div>

            <div className="video-content login-background">
                <div className="video-wrapper">
                <video
                    controls
                    playsInline
                    autoPlay
                >
                    <source src="assets/demo.mp4" type="video/mp4" />
                    Ваш браузер не поддерживает видео.
                </video>
                </div>
            </div>

            <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => onNavigate("login")}>
                <IonIcon icon={close} />
            </IonFabButton>
            </IonFab>

        </div>
    </div>
  );
};


export default VideoPage;
