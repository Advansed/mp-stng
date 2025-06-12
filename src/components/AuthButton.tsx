// components/AuthButton.tsx
import React, { memo } from 'react';

interface AuthButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const AuthButton = memo<AuthButtonProps>(({ 
  onClick, 
  loading = false, 
  disabled = false, 
  children,
  variant = 'primary'
}) => {
  const buttonClass = variant === 'primary' ? 'l-button' : 'l-button-secondary';
  
  return (
    <div 
      className={`ml-1 mr-1 ${buttonClass} ${disabled || loading ? 'disabled' : ''}`}
      onClick={disabled || loading ? undefined : onClick}
      role="button"
      tabIndex={0}
      aria-disabled={disabled || loading}
    >
      {loading ? 'Загрузка...' : children}
    </div>
  );
});

AuthButton.displayName = 'AuthButton';
