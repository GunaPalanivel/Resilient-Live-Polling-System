import React from 'react';
import '../styles/tokens.css';

export const Toast = ({
  message,
  type = 'info',
  isVisible,
  onDismiss,
  duration = 3000,
  ...props
}) => {
  React.useEffect(() => {
    if (isVisible && duration) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onDismiss]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'background-color: #D1FAE5; color: var(--color-success);',
    error: 'background-color: #FEE2E2; color: var(--color-error);',
    warning: 'background-color: #FEF3C7; color: var(--color-warning);',
    info: 'background-color: var(--color-primary-light); color: var(--color-primary);',
  };

  const baseStyle = `
    position: fixed;
    bottom: var(--spacing-3);
    right: var(--spacing-3);
    padding: var(--spacing-3);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-toast);
    font-family: var(--font-family);
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    max-width: 400px;
    animation: slideIn 300ms ease;
  `;

  const closeButtonStyle = `
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    opacity: 0.7;
    transition: opacity var(--transition-base);
  `;

  const styleString = `${baseStyle} ${typeStyles[type]}`;

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div style={{ cssText: styleString }} {...props}>
        <span>{message}</span>
        <button
          style={{ cssText: closeButtonStyle }}
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </>
  );
};
