import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../context/useAuthStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { validateMobile, sanitizeMobileInput } from '../../utils/validation';

export const AuthPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in
    const { isAuthenticated, user } = useAuthStore();
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'CUSTOMER') {
                navigate('/');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    // Timer state
    const [retryDate, setRetryDate] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);

    // Timer Effect
    useEffect(() => {
        if (!retryDate) return;

        const timer = setInterval(() => {
            const now = new Date();
            const diff = Math.ceil((retryDate.getTime() - now.getTime()) / 1000);

            if (diff <= 0) {
                setTimeLeft(0);
                setRetryDate(null);
                clearInterval(timer);
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [retryDate]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateMobile(phone)) {
            notificationService.error('Please enter a valid 10-digit mobile number (starting with 1-9)');
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.initiateLogin(phone);
            notificationService.success(data.message || 'OTP Sent!');

            if (data.retryAfter) {
                const expiry = new Date(data.retryAfter);
                setRetryDate(expiry);
                // Initial calc
                const diff = Math.ceil((expiry.getTime() - new Date().getTime()) / 1000);
                setTimeLeft(diff > 0 ? diff : 0);
            }

            setStep('OTP');
        } catch (error) {
            notificationService.error('Failed to send OTP. Try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timeLeft > 0) return;

        setIsLoading(true);
        try {
            const data = await authService.resendOtp(phone);
            notificationService.success(data.message || 'OTP Resent!');

            if (data.retryAfter) {
                const expiry = new Date(data.retryAfter);
                setRetryDate(expiry);
                setTimeLeft(Math.ceil((expiry.getTime() - new Date().getTime()) / 1000));
            }
        } catch (error) {
            notificationService.error('Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 4) {
            notificationService.error('Please enter valid OTP');
            return;
        }

        setIsLoading(true);
        try {
            const tokens = await authService.verifyOtp(phone, otp);
            await login(tokens);
            notificationService.success('Logged in successfully!');
            const currentUser = useAuthStore.getState().user;
            if (currentUser?.role === 'CUSTOMER') {
                navigate('/');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            notificationService.error('Invalid OTP. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{step === 'PHONE' ? 'Welcome Back' : 'Verify OTP'}</h2>
                <p className="auth-subtext">
                    {step === 'PHONE'
                        ? 'Enter your phone number to sign in or register'
                        : `Enter the OTP sent to ${phone}`
                    }
                </p>

                {step === 'PHONE' ? (
                    <form onSubmit={handleSendOtp}>
                        <Input
                            label="Phone Number"
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(sanitizeMobileInput(e.target.value))}
                            autoFocus
                        />
                        <Button type="submit" isLoading={isLoading} style={{ width: '100%' }}>
                            Send OTP
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <Input
                            label="Enter OTP"
                            type="text"
                            placeholder="1234"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            autoFocus
                        />

                        <Button type="submit" isLoading={isLoading} style={{ width: '100%' }}>
                            Verify & Login
                        </Button>

                        <div className="resend-section">
                            <button
                                type="button"
                                className="resend-btn"
                                onClick={handleResendOtp}
                                disabled={isLoading || timeLeft > 0}
                            >
                                {timeLeft > 0 ? `Resend OTP in ${timeLeft}s` : 'Resend OTP'}
                            </button>
                        </div>

                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <button
                                type="button"
                                className="link-btn"
                                onClick={() => setStep('PHONE')}
                                disabled={isLoading}
                            >
                                Change Phone Number
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <style>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          padding: 1rem;
        }
        .auth-card {
          background: var(--color-surface);
          padding: 2rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 400px;
          border: 1px solid var(--color-border);
        }
        h2 {
          margin-bottom: 0.5rem;
          color: var(--color-primary);
        }
        .auth-subtext {
          color: var(--color-text-muted);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }
        .link-btn {
          color: var(--color-text-muted);
          text-decoration: underline;
          font-size: 0.875rem;
          background: none;
          border: none;
          cursor: pointer;
        }
        .link-btn:hover {
          color: var(--color-primary);
        }
        .resend-section {
            margin-top: 1rem;
            text-align: center;
        }
        .resend-btn {
            background: none;
            border: none;
            color: var(--color-primary);
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
        }
        .resend-btn:disabled {
            color: var(--color-text-muted);
            cursor: not-allowed;
        }
      `}</style>
        </div>
    );
};
