import React from 'react';
import '../styles/tokens.css';

export const Loading = ({ size = 'md', text, overlay = false, ...props }) => {
  const sizeStyles = {
    sm: 'width: 24px; height: 24px; border-width: 2px;',
    md: 'width: 40px; height: 40px; border-width: 3px;',
    lg: 'width: 60px; height: 60px; border-width: 4px;',
  };

  const spinnerStyle = `
    border: 3px solid var(--color-border-primary);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    ${sizeStyles[size]}
  `;

  const containerStyle = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-2);
  `;

  const overlayStyle = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal);
  `;

  const content = (
    <div style={{ cssText: containerStyle }} {...props}>
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div style={{ cssText: spinnerStyle }} />
      {text && (
        <span
          style={{
            cssText:
              'color: var(--color-text-secondary); font-size: var(--font-size-sm);',
          }}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return <div style={{ cssText: overlayStyle }}>{content}</div>;
  }

  return content;
};
