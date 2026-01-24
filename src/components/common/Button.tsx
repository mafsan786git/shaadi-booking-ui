import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className,
    variant = 'primary',
    isLoading,
    disabled,
    ...props
}) => {
    return (
        <button
            className={clsx('btn', `btn-${variant}`, className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="spinner" size={16} />}
            {children}

            <style>{`
        .spinner {
          margin-right: 0.5rem;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
        </button>
    );
};
