import React from 'react';
import '../styles/tokens.css';

export const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  size = 'md',
  ...props
}) => {
  const sizeStyles = {
    sm: 'padding: 8px 12px; font-size: var(--font-size-sm); height: 36px;',
    md: 'padding: 10px 14px; font-size: var(--font-size-base); height: 40px;',
    lg: 'padding: 12px 16px; font-size: var(--font-size-lg); height: 48px;',
  };

  const baseStyles = `
    width: 100%;
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md);
    background-color: var(--color-background);
    color: var(--color-text-primary);
    font-family: var(--font-family);
    transition: all var(--transition-base);
    box-sizing: border-box;
  `;

  const errorStyles = error
    ? 'border-color: var(--color-error); background-color: #FEF2F2);'
    : '';
  const disabledStyles = disabled ? 'opacity: 0.5; cursor: not-allowed;' : '';

  const style = `${baseStyles} ${sizeStyles[size]} ${errorStyles} ${disabledStyles}`;

  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{ cssText: style }}
        {...props}
      />
      {error && (
        <span
          style={{
            cssText:
              'color: var(--color-error); font-size: var(--font-size-sm); margin-top: 4px; display: block;',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};
