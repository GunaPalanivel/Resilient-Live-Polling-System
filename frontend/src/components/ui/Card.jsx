import React from 'react';
import '../styles/tokens.css';

export const Card = ({
  children,
  title,
  subtitle,
  elevation = 'md',
  padding = 'md',
  ...props
}) => {
  const elevationStyles = {
    sm: 'box-shadow: var(--shadow-sm);',
    md: 'box-shadow: var(--shadow-md);',
    lg: 'box-shadow: var(--shadow-lg);',
  };

  const paddingStyles = {
    sm: 'padding: var(--spacing-2);',
    md: 'padding: var(--spacing-3);',
    lg: 'padding: var(--spacing-4);',
  };

  const baseStyles = `
    background-color: var(--color-background);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-primary);
    overflow: hidden;
  `;

  const style = `${baseStyles} ${elevationStyles[elevation]} ${paddingStyles[padding]}`;

  return (
    <div style={{ cssText: style }} {...props}>
      {title && (
        <div style={{ cssText: 'margin-bottom: var(--spacing-2);' }}>
          <h3
            style={{
              cssText:
                'margin: 0; font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-text-primary);',
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                cssText:
                  'margin: var(--spacing-1) 0 0 0; font-size: var(--font-size-sm); color: var(--color-text-secondary);',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
