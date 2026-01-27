import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Users, Phone, User, FileText, IndianRupee } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { BookingRequest, EventType, BookingStatus } from '../../types';
import { bookingService } from '../../services/bookingService';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Partial<BookingRequest>;
    mode: 'CUSTOMER' | 'OWNER';
    hallId: string;
}

const EVENT_TYPES: EventType[] = ['WEDDING', 'RECEPTION', 'ENGAGEMENT', 'BIRTHDAY', 'ANNIVERSARY', 'OTHER'];

export const BookingModal: React.FC<BookingModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialData,
    mode,
    hallId
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<BookingRequest>>({
        hallId,
        eventType: 'WEDDING',
        totalGuest: 100,
        ...initialData
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                hallId,
                eventType: 'WEDDING',
                totalGuest: 100,
                status: mode === 'OWNER' ? 'CONFIRMED' : undefined,
                ...initialData
            });
        }
    }, [isOpen, initialData, hallId, mode]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Basic validation
            if (!formData.customerName || !formData.customerPhone || !formData.startDate || !formData.totalGuest) {
                toast.error('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // Phone validation
            if (!/^[6-9]\d{9}$/.test(formData.customerPhone)) {
                toast.error('Please enter a valid Indian mobile number');
                setLoading(false);
                return;
            }

            // Prepare request
            const request: BookingRequest = {
                hallId,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                startDate: formData.startDate,
                endDate: formData.endDate || formData.startDate, // Default to same day if not set
                eventType: formData.eventType as EventType,
                totalGuest: Number(formData.totalGuest),
                customerNote: formData.customerNote,
                // Owner specific fields
                ...(mode === 'OWNER' && {
                    status: formData.status,
                    finalPrice: formData.finalPrice ? Number(formData.finalPrice) : undefined,
                    ownerNote: formData.ownerNote
                })
            };

            await bookingService.requestBooking(request);
            toast.success('Booking created successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Booking failed:', error);
            toast.error(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof BookingRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{mode === 'OWNER' ? 'Add Booking' : 'Request Booking'}</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-grid">
                        {/* Customer Details */}
                        <div className="form-group">
                            <label><User size={14} /> Customer Name *</label>
                            <input
                                type="text"
                                value={formData.customerName || ''}
                                onChange={e => handleChange('customerName', e.target.value)}
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><Phone size={14} /> Phone Number *</label>
                            <input
                                type="tel"
                                value={formData.customerPhone || ''}
                                onChange={e => handleChange('customerPhone', e.target.value)}
                                placeholder="9876543210"
                                required
                                maxLength={10}
                            />
                        </div>

                        {/* Event Details */}
                        <div className="form-group">
                            <label><CalendarIcon size={14} /> Event Type *</label>
                            <select
                                value={formData.eventType}
                                onChange={e => handleChange('eventType', e.target.value)}
                            >
                                {EVENT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label><Users size={14} /> Total Guests *</label>
                            <input
                                type="number"
                                value={formData.totalGuest || ''}
                                onChange={e => handleChange('totalGuest', e.target.value)}
                                min={1}
                                required
                            />
                        </div>

                        {/* Dates */}
                        <div className="form-group">
                            <label>Start Date *</label>
                            <input
                                type="date"
                                value={formData.startDate || ''}
                                onChange={e => handleChange('startDate', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={formData.endDate || ''}
                                onChange={e => handleChange('endDate', e.target.value)}
                                min={formData.startDate}
                            />
                        </div>

                        {/* Owner Specific Fields */}
                        {mode === 'OWNER' && (
                            <>
                                <div className="form-group full-width">
                                    <label>Booking Status</label>
                                    <div className="status-options">
                                        {(['CONFIRMED', 'BLOCKED'] as BookingStatus[]).map(status => (
                                            <button
                                                key={status}
                                                type="button"
                                                className={`status-chip ${formData.status === status ? 'active' : ''}`}
                                                onClick={() => handleChange('status', status)}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label><IndianRupee size={14} /> Final Price</label>
                                    <input
                                        type="number"
                                        value={formData.finalPrice || ''}
                                        onChange={e => handleChange('finalPrice', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </>
                        )}

                        {/* Notes */}
                        <div className="form-group full-width">
                            <label><FileText size={14} /> {mode === 'OWNER' ? 'Owner Note' : 'Message'}</label>
                            <textarea
                                value={mode === 'OWNER' ? formData.ownerNote : formData.customerNote || ''}
                                onChange={e => handleChange(mode === 'OWNER' ? 'ownerNote' : 'customerNote', e.target.value)}
                                rows={3}
                                placeholder="Any additional details..."
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Processing...' : (mode === 'OWNER' ? 'Create Booking' : 'Send Request')}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease-out;
                }
                .modal-container {
                    background: white;
                    border-radius: 16px;
                    width: 95%;
                    max-width: 600px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .modal-header {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    border-radius: 16px 16px 0 0;
                    flex-shrink: 0;
                }
                .modal-header h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: #1e293b;
                    font-weight: 700;
                }
                .close-btn {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: all 0.2s;
                    display: flex;
                }
                .close-btn:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }
                .modal-body {
                    padding: 1.5rem;
                    overflow-y: auto;
                    flex: 1;
                    /* Smooth scrolling */
                    -webkit-overflow-scrolling: touch;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .full-width {
                    grid-column: 1 / -1;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .form-group label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #475569;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .form-group input, .form-group select, .form-group textarea {
                    padding: 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    color: #1e293b;
                    transition: all 0.2s;
                    font-family: inherit;
                    width: 100%;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                .status-options {
                    display: flex;
                    gap: 0.5rem;
                }
                .status-chip {
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .status-chip.active {
                    background: #eff6ff;
                    color: #2563eb;
                    border-color: #2563eb;
                }
                .modal-footer {
                    padding: 1.25rem 1.5rem;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    background: #f8fafc;
                    border-radius: 0 0 16px 16px;
                    flex-shrink: 0;
                }
                .btn-secondary {
                    padding: 0.75rem 1.5rem;
                    background: white;
                    border: 1px solid #cbd5e1;
                    color: #475569;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-secondary:hover {
                    background: #f1f5f9;
                }
                .btn-primary {
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #005EB8 0%, #0093E9 100%);
                    border: none;
                    color: white;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0, 94, 184, 0.3);
                }
                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 8px -1px rgba(0, 94, 184, 0.4);
                }
                .btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform:translateY(20px); }
                    to { opacity: 1; transform:translateY(0); }
                }

                @media (max-width: 640px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .modal-container {
                        width: 100%;
                        height: 100%;
                        height: 100dvh;
                        max-height: 100dvh;
                        border-radius: 0;
                        animation: slideUp 0.3s ease-out;
                    }
                    .modal-header {
                        border-radius: 0;
                        padding: 1rem;
                    }
                    .modal-footer {
                        border-radius: 0;
                        padding: 1rem;
                        background: white;
                        box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
                    }
                    .btn-primary, .btn-secondary {
                        flex: 1;
                        padding: 0.85rem;
                    }
                }
            `}</style>
        </div>
    );
};
