import React from 'react';
import '../styles/tokens.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  ...props
}) => {
  const variantStyles = {
    primary:
      'background-color: var(--color-primary); color: var(--color-text-inverse);',
    secondary:
      'background-color: var(--color-background-secondary); color: var(--color-text-primary);',
    success:
      'background-color: var(--color-success); color: var(--color-text-inverse);',
    error:
      'background-color: var(--color-error); color: var(--color-text-inverse);',
  };

  const sizeStyles = {
    sm: `height: var(--button-height-sm); padding: 0 var(--spacing-2); font-size: var(--font-size-sm);`,
    md: `height: var(--button-height-md); padding: 0 var(--spacing-3); font-size: var(--font-size-base);`,
    lg: `height: var(--button-height-lg); padding: 0 var(--spacing-4); font-size: var(--font-size-lg);`,
  };

  const baseStyles = `
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: var(--font-weight-medium);
    transition: all var(--transition-base);
    font-family: var(--font-family);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-1);
  `;

  const disabledStyles = disabled ? 'opacity: 0.5; cursor: not-allowed;' : '';

  const style = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles}`;

  return (
    <button
      style={{ cssText: style }}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
