import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className="input-group">
                {label && <label className="input-label">{label}</label>}
                <input
                    ref={ref}
                    className={clsx(
                        'input-field',
                        error && 'input-error',
                        className
                    )}
                    {...props}
                />
                {error && <span className="input-error-msg">{error}</span>}

                <style>{`
          .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            margin-bottom: 1rem;
          }
          .input-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--color-text-main);
          }
          .input-field {
            padding: 0.5rem 0.75rem;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s;
          }
          .input-field:focus {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 1px var(--color-primary);
          }
          .input-error {
            border-color: var(--color-error);
          }
          .input-error-msg {
            font-size: 0.75rem;
            color: var(--color-error);
          }
        `}</style>
            </div>
        );
    }
);
