// components/ErrorMessage.tsx
import React, { memo } from 'react';
import { IonText } from '@ionic/react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = memo<ErrorMessageProps>(({ message }) => {
  if (!message) return null;

  return (
    <IonText>
      <p className="ion-text-start error ml-1 cl-red">
        {message}
      </p>
    </IonText>
  );
});

ErrorMessage.displayName = 'ErrorMessage';