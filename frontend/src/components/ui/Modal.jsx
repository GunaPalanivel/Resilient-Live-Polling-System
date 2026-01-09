import React from 'react';
import '../styles/tokens.css';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  ...props
}) => {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-width: 400px;',
    md: 'max-width: 600px;',
    lg: 'max-width: 800px;',
  };

  const overlayStyle = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal);
  `;

  const contentStyle = `
    background-color: var(--color-background);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 90%;
    ${sizeStyles[size]}
  `;

  const headerStyle = `
    padding: var(--spacing-3);
    border-bottom: 1px solid var(--color-border-primary);
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  const bodyStyle = `
    padding: var(--spacing-3);
  `;

  const closeButtonStyle = `
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: color var(--transition-base);
  `;

  return (
    <div style={{ cssText: overlayStyle }} onClick={onClose}>
      <div
        style={{ cssText: contentStyle }}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {title && (
          <div style={{ cssText: headerStyle }}>
            <h2
              style={{
                cssText:
                  'margin: 0; font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold);',
              }}
            >
              {title}
            </h2>
            <button
              style={{ cssText: closeButtonStyle }}
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        )}
        <div style={{ cssText: bodyStyle }}>{children}</div>
      </div>
    </div>
  );
};
