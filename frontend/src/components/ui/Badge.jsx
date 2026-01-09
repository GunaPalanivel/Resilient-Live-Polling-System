import React, { useState } from 'react';
import '../styles/tokens.css';

export const Badge = ({
  children,
  variant = 'info',
  size = 'md',
  ...props
}) => {
  const variantStyles = {
    info: 'background-color: var(--color-primary-light); color: var(--color-primary);',
    success: 'background-color: #D1FAE5; color: var(--color-success);',
    warning: 'background-color: #FEF3C7; color: var(--color-warning);',
    error: 'background-color: #FEE2E2; color: var(--color-error);',
  };

  const sizeStyles = {
    sm: 'padding: 4px 8px; font-size: var(--font-size-xs);',
    md: 'padding: 6px 12px; font-size: var(--font-size-sm);',
    lg: 'padding: 8px 16px; font-size: var(--font-size-base);',
  };

  const baseStyles = `
    display: inline-flex;
    align-items: center;
    border-radius: var(--radius-full);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-family);
  `;

  const style = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`;

  return (
    <span style={{ cssText: style }} {...props}>
      {children}
    </span>
  );
};

export const Badge2 = ({
  children,
  variant = 'info',
  size = 'md',
  ...props
}) => {
  return (
    <Badge variant={variant} size={size} {...props}>
      {children}
    </Badge>
  );
};
