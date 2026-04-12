import { toast, type ToastOptions } from 'react-hot-toast';

const defaultOptions: ToastOptions = {
    duration: 3000,
    style: {
        background: 'rgba(255, 255, 255, 0.85)',
        color: '#1e293b',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '12px 24px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        fontSize: '0.95rem',
        fontWeight: 500,
    },
};

export const notificationService = {
    success: (message: string, options?: ToastOptions) => {
        toast.dismiss();
        toast.success(message, {
            ...defaultOptions,
            ...options,
            iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
            },
        });
    },
    error: (message: string, options?: ToastOptions) => {
        toast.dismiss();
        toast.error(message, {
            ...defaultOptions,
            ...options,
            iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
            },
        });
    },
    info: (message: string, options?: ToastOptions) => {
        toast.dismiss();
        toast(message, {
            ...defaultOptions,
            ...options,
            icon: 'ℹ️',
        });
    },
    warn: (message: string, options?: ToastOptions) => {
        toast.dismiss();
        toast(message, {
            ...defaultOptions,
            ...options,
            icon: '⚠️',
        });
    },
};
