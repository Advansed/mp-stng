import React, { useEffect, useRef } from 'react';
import { IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { close } from 'ionicons/icons';
import './VideoPage.css'
import { LoginPage } from '../components/Login/Login';
import { useNavigateStore } from '../Store/navigateStore';
import { ROUTES } from '../routes';
import { useNavigation } from './useNavigation';

interface VideoPageProps {
    onNavigate:     ( page: LoginPage ) => void;
}

const VideoPage: React.FC<VideoPageProps> = ({ onNavigate }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const currentPage = useNavigateStore(state => state.currentPage )

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        if (currentPage === ROUTES.video) {
            v.muted = false;
            v.play().catch((e) => { console.error('Error playing video:', e)});
        } else {
            v.pause();
            v.currentTime = 0; // если нужно возвращать в начало
            v.muted = true;
        }
    }, [ currentPage ]); // при смене name эффект отработает и остановит видео[web:33][web:30]

  return (
    <div>
        <div>

            <div className="video-content login-background">
                <div className="video-wrapper">
                <video
                    ref = { videoRef }
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


export function AppVideoPage() {
    const { goTo } = useNavigation();
    return <VideoPage onNavigate={() => goTo(ROUTES.lics)} />;
}

export default VideoPage;
