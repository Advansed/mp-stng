import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkOutline } from 'ionicons/icons';
import styles from './UploadLaterBlock.module.css';

const PROMISE_LABEL = 'Обязуюсь предоставить в течении 30 дней';
const CONFIRM_TITLE = 'Подтвердите обязательство';
const CONFIRM_TEXT =
  'Вы действительно обязуетесь предоставить акт исследования вентиляционных каналов в течение 30 дней с даты подачи заявки?';
const CONFIRM_LABEL =
  'Да, подтверждаю свое обязательство предоставить акт в установленный срок.';

interface UploadLaterBlockProps {
  active?: boolean;
  later?: boolean;
  visible: boolean;
  onLaterChange?: (later: boolean) => void;
}

function LaterCheckbox({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <div
      className={styles.checkboxRow}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className={`${styles.checkbox} ${checked ? styles.checked : ''}`}>
        {checked && <IonIcon icon={checkmarkOutline} className={styles.checkIcon} />}
      </div>
      <span className={styles.checkboxLabel}>{label}</span>
    </div>
  );
}

export function UploadLaterBlock({
  active,
  later,
  visible,
  onLaterChange,
}: UploadLaterBlockProps) {
  const confirmed = !!later;
  const [promised, setPromised] = useState(confirmed);

  useEffect(() => {
    setPromised(confirmed);
  }, [confirmed]);

  if (!active || !visible) return null;

  const handlePromise = (next: boolean) => {
    setPromised(next);
    if (!next) onLaterChange?.(false);
  };

  const handleConfirm = (next: boolean) => {
    onLaterChange?.(next);
  };

  return (
    <div className={styles.block}>
      <LaterCheckbox
        checked={promised}
        label={PROMISE_LABEL}
        onToggle={() => handlePromise(!promised)}
      />
      {promised && (
        <div className={styles.confirm}>
          <div className={styles.confirmTitle}>{CONFIRM_TITLE}</div>
          <p className={styles.confirmText}>{CONFIRM_TEXT}</p>
          <LaterCheckbox
            checked={confirmed}
            label={CONFIRM_LABEL}
            onToggle={() => handleConfirm(!confirmed)}
          />
        </div>
      )}
    </div>
  );
}
