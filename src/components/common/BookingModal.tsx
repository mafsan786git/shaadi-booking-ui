import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Users, Phone, User, FileText, IndianRupee } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import type { BookingRequest, EventType, BookingStatus } from '../../types';
import { bookingService } from '../../services/bookingService';
import { hallService } from '../../services/hallService';
import type { Hall, DayAvailabilityResponse } from '../../types';
import { format, parseISO, addDays, startOfDay, isBefore } from 'date-fns';
import { validateMobile, sanitizeMobileInput } from '../../utils/validation';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Partial<BookingRequest>;
    mode: 'CUSTOMER' | 'OWNER';
    hallId: string;
    readOnly?: boolean;
    allowEdit?: boolean;
    bookingId?: string;
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
    'WEDDING': 'Wedding',
    'RECEPTION': 'Reception',
    'ENGAGEMENT': 'Engagement',
    'BIRTHDAY': 'Birthday',
    'ANNIVERSARY': 'Anniversary',
    'OTHER': 'Other'
};

const EVENT_TYPES: EventType[] = ['WEDDING', 'RECEPTION', 'ENGAGEMENT', 'BIRTHDAY', 'ANNIVERSARY', 'OTHER'];

export const BookingModal: React.FC<BookingModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialData,
    mode,
    hallId,
    readOnly = false,
    allowEdit = true,
    bookingId
}) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const [loading, setLoading] = useState(false);
    const [hall, setHall] = useState<Hall | null>(null);
    const [availability, setAvailability] = useState<DayAvailabilityResponse[]>([]);
    const [isEditing, setIsEditing] = useState(!readOnly);

    const [formData, setFormData] = useState<Partial<BookingRequest>>({
        hallId,
        eventType: 'WEDDING',
        totalGuest: 100,
        ...initialData
    });

    const getAvailableStatuses = (currentStatus?: BookingStatus, endDateStr?: string): BookingStatus[] => {
        if (!currentStatus) return ['REQUESTED'];

        // Owner Logic
        if (mode === 'OWNER') {
            switch (currentStatus) {
                case 'REQUESTED':
                    return ['REQUESTED', 'OWNER_RESPONDED', 'REJECTED', 'CONFIRMED'];
                case 'OWNER_RESPONDED':
                    return ['OWNER_RESPONDED', 'CONFIRMED', 'REJECTED'];
                case 'CONFIRMED': {
                    const statuses: BookingStatus[] = ['CONFIRMED', 'CANCELLED'];
                    
                    // Logic: Completed can be done only if end date is gone
                    // user logic: not LocalDate.now().isBefore(endDate.plusDays(1))
                    if (endDateStr) {
                        try {
                            const todayDate = startOfDay(new Date());
                            const endPlusOne = addDays(parseISO(endDateStr), 1);
                            if (!isBefore(todayDate, endPlusOne)) {
                                statuses.push('COMPLETED');
                            }
                        } catch (e) {
                            console.error("Date parsing error in status logic", e);
                        }
                    }
                    
                    return statuses;
                }
                case 'COMPLETED':
                case 'CANCELLED':
                case 'REJECTED':
                    return [currentStatus]; // Terminal states
                default:
                    return [currentStatus];
            }
        }
        return [currentStatus];
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsEditing(!readOnly); // Reset editing state based on readOnly prop

            // Normalize initial startDate if it's in the past
            const finalInitialData = { ...initialData };
            if (finalInitialData.startDate && finalInitialData.startDate < today) {
                finalInitialData.startDate = today;
            }

            setFormData({
                hallId,
                eventType: 'WEDDING',
                totalGuest: 100,
                status: mode === 'OWNER' ? 'CONFIRMED' : undefined,
                ...finalInitialData
            });
            // If editing an existing booking, ensure status is set from initialData
            if (bookingId && initialData?.status) {
                setFormData(prev => ({ ...prev, status: initialData.status }));
            }

            fetchData();
        } else {
            document.body.style.overflow = 'unset';
            setIsEditing(!readOnly);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, initialData, hallId, mode, today, readOnly]);

    const fetchData = async () => {
        try {
            const hallData = await hallService.getHallById(hallId);
            setHall(hallData);

            if (initialData?.startDate) {
                const month = format(parseISO(initialData.startDate), 'yyyy-MM');
                const availabilityData = await hallService.getAvailability(hallId, month);
                setAvailability(availabilityData.nonAvailableDates || availabilityData || []);
            }
        } catch (error) {
            console.error('Failed to fetch modal data:', error);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Basic validation
            if (!formData.customerName || !formData.customerPhone || !formData.startDate || !formData.totalGuest) {
                notificationService.error('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // Phone validation
            if (!validateMobile(formData.customerPhone)) {
                notificationService.error('Please enter a valid 10-digit mobile number (starting with 1-9)');
                setLoading(false);
                return;
            }

            // Hall Capacity Validation
            if (hall && Number(formData.totalGuest) > hall.capacity) {
                notificationService.error(`Total guests cannot exceed hall capacity (${hall.capacity})`);
                setLoading(false);
                return;
            }

            // Date availability validation - ONLY check if date changed or new booking
            // If editing existing booking and date hasn't changed, skip this check might be needed logic, 
            // but here we simplify assuming if they edit, they might change dates. 
            // Ideally we should check if date is same as initialData.
            if (formData.startDate) {
                if (formData.startDate < today) {
                    notificationService.error('Cannot select a past date');
                    setLoading(false);
                    return;
                }

                // If date changed from initial, check availability
                if (formData.startDate !== initialData?.startDate) {
                    const isUnavailable = availability.some(d =>
                        d.date === formData.startDate &&
                        (d.status === 'BLOCKED' || d.status === 'CONFIRMED' || d.status === 'IN_PROGRESS')
                    );
                    if (isUnavailable) {
                        notificationService.error('Selected date is not available');
                        setLoading(false);
                        return;
                    }
                }
            }

            // End date validation
            if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
                notificationService.error('End date cannot be before start date');
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
                    finalPrice: formData.finalPrice ? Number(formData.finalPrice) : undefined,
                    ownerNote: formData.ownerNote,
                    status: formData.status
                })
            };

            if (bookingId) {
                await bookingService.updateBooking(bookingId, request);
                notificationService.success('Booking updated successfully!');
            } else {
                await bookingService.requestBooking(request);
                notificationService.success('Booking saved successfully!');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Booking failed:', error);
            notificationService.error(error.response?.data?.message || 'Failed to save booking');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!bookingId) return;

        setLoading(true);
        try {
            await bookingService.deleteBooking(bookingId);
            notificationService.success('Booking deleted successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to delete booking:', error);
            notificationService.error('Failed to delete booking');
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2>
                            {mode === 'OWNER'
                                ? (initialData?.startDate ? (isEditing ? 'Edit Booking' : 'Booking Details') : 'Add Booking')
                                : 'Request Booking'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="close-btn" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-body">
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
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-group">
                                <label><Phone size={14} /> Phone Number *</label>
                                <input
                                    type="tel"
                                    value={formData.customerPhone || ''}
                                    onChange={e => handleChange('customerPhone', sanitizeMobileInput(e.target.value))}
                                    placeholder="9876543210"
                                    required
                                    maxLength={10}
                                    disabled={!isEditing}
                                />
                            </div>

                            {/* Event Details */}
                            <div className="form-group">
                                <label><CalendarIcon size={14} /> Event Type *</label>
                                <select
                                    value={formData.eventType}
                                    onChange={e => handleChange('eventType', e.target.value)}
                                    disabled={!isEditing}
                                >
                                    {EVENT_TYPES.map(type => (
                                        <option key={type} value={type}>{EVENT_TYPE_LABELS[type]}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label><Users size={14} /> Total Guests *</label>
                                <input
                                    type="number"
                                    value={formData.totalGuest || ''}
                                    onChange={e => {
                                        const value = Number(e.target.value);
                                        if (hall && value > hall.capacity) {
                                            notificationService.error(`Total guests cannot exceed hall capacity (${hall.capacity})`);
                                            handleChange('totalGuest', hall.capacity);
                                            return;
                                        }
                                        handleChange('totalGuest', e.target.value);
                                    }}
                                    min={1}
                                    max={hall?.capacity}
                                    required
                                    disabled={!isEditing}
                                />
                            </div>

                            {/* Dates */}
                            <div className="form-group">
                                <label>Start Date *</label>
                                <input
                                    type="date"
                                    value={formData.startDate || ''}
                                    onChange={async (e) => {
                                        const newDate = e.target.value;
                                        // JS Guard: Prevent past dates even if picker allows it
                                        if (newDate && newDate < today) {
                                            handleChange('startDate', today);
                                            notificationService.error('Cannot select a past date');
                                            return;
                                        }

                                        handleChange('startDate', newDate);
                                        if (newDate) {
                                            try {
                                                const month = format(parseISO(newDate), 'yyyy-MM');
                                                const availabilityData = await hallService.getAvailability(hallId, month);
                                                setAvailability(availabilityData.nonAvailableDates || availabilityData || []);
                                            } catch (error) {
                                                console.error('Failed to fetch availability for date:', error);
                                            }
                                        }
                                    }}
                                    min={today}
                                    required
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate || ''}
                                    onChange={e => handleChange('endDate', e.target.value)}
                                    min={formData.startDate}
                                    disabled={!isEditing}
                                />
                            </div>

                            {/* Owner Specific Fields */}
                            <div className="form-group">
                                <label><IndianRupee size={14} /> Final Price</label>
                                <input
                                    type="number"
                                    value={formData.finalPrice || ''}
                                    onChange={e => handleChange('finalPrice', e.target.value)}
                                    placeholder="0.00"
                                    disabled={!isEditing}
                                />
                            </div>

                            {/* Status - Only for Owner and when editing existing booking */}
                            {mode === 'OWNER' && bookingId && (
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => handleChange('status', e.target.value)}
                                        disabled={!isEditing || ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(initialData?.status as string)}
                                    >
                                        {getAvailableStatuses(initialData?.status, initialData?.endDate || initialData?.startDate).map(status => (
                                            <option key={status} value={status}>
                                                {status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Requirements */}
                        <div className="form-group full-width">
                            <label><FileText size={14} /> Special Requirements</label>
                            <div className="requirements-input-container">
                                {isEditing && (
                                    <input
                                        type="text"
                                        placeholder="Add a requirement and press Enter"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const value = (e.target as HTMLInputElement).value.trim();
                                                if (value) {
                                                    const currentReqs = formData.requirements || [];
                                                    if (!currentReqs.includes(value)) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            requirements: [...currentReqs, value]
                                                        }));
                                                    }
                                                    (e.target as HTMLInputElement).value = '';
                                                }
                                            }
                                        }}
                                        disabled={!isEditing}
                                    />
                                )}
                                <div className="requirements-list">
                                    {(formData.requirements || []).length > 0 ? (
                                        (formData.requirements || []).map((req, index) => (
                                            <div key={index} className="requirement-tag">
                                                <span>{req}</span>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                requirements: (prev.requirements || []).filter((_, i) => i !== index)
                                                            }));
                                                        }}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        !isEditing && <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No special requirements</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="form-group full-width">
                            <label><FileText size={14} /> {mode === 'OWNER' ? 'Owner Note' : 'Message'}</label>
                            <textarea
                                value={mode === 'OWNER' ? formData.ownerNote : formData.customerNote || ''}
                                onChange={e => handleChange(mode === 'OWNER' ? 'ownerNote' : 'customerNote', e.target.value)}
                                rows={3}
                                placeholder={isEditing ? "Any additional details..." : "No notes provided"}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            {isEditing ? 'Cancel' : 'Close'}
                        </button>

                        {mode === 'OWNER' && bookingId && (initialData?.status === 'REJECTED' || initialData?.status === 'CANCELLED') ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="btn-danger"
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        ) : (
                            <>
                                {!isEditing && readOnly && allowEdit && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="btn-primary"
                                        style={{ background: '#2563eb' }}
                                    >
                                        Edit
                                    </button>
                                )}
                                {isEditing && (
                                    <button type="submit" disabled={loading} className="btn-primary">
                                        {loading ? 'Processing...' : (mode === 'OWNER' ? 'Save Booking' : 'Send Request')}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </form>
            </div >

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
                    display: grid;
                    grid-template-rows: auto 1fr auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
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
                .edit-mode-btn {
                    padding: 0.25rem 0.75rem;
                    background: #eff6ff;
                    color: #2563eb;
                    border: 1px solid #dbeafe;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .edit-mode-btn:hover {
                    background: #dbeafe;
                    border-color: #2563eb;
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
                .modal-form {
                    display: grid;
                    grid-template-rows: 1fr auto;
                    min-height: 0;
                    overflow: hidden;
                }
                .modal-body {
                    padding: 1.5rem;
                    overflow-y: auto;
                    min-height: 0;
                    overscroll-behavior: contain;
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
                .form-group input:disabled, .form-group select:disabled, .form-group textarea:disabled {
                    background: #f8fafc;
                    color: #64748b;
                    cursor: not-allowed;
                    border-color: #f1f5f9;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                /* ... rest of styles ... */
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

                .btn-danger {
                    padding: 0.75rem 1.5rem;
                    background: #dc2626;
                    border: none;
                    color: white;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.3);
                }
                .btn-danger:hover {
                    background: #b91c1c;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 8px -1px rgba(220, 38, 38, 0.4);
                }
                .btn-danger:disabled {
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
                    .modal-overlay {
                        align-items: flex-end;
                    }
                    .modal-container {
                        width: 100vw;
                        height: 92vh; 
                        max-height: 92vh;
                        border-radius: 20px 20px 0 0;
                        margin-top: auto;
                        grid-template-rows: auto 1fr;
                    }
                    .modal-form {
                        grid-template-rows: 1fr auto;
                        height: 100%;
                    }
                    .modal-header {
                        padding: 1rem 1.25rem;
                    }
                    .modal-body {
                        padding: 1.25rem 1.25rem 4rem 1.25rem;
                    }
                    .modal-footer {
                        padding: 1rem 1.25rem;
                        background: #f8fafc;
                        border-top: 1px solid #e2e8f0;
                        margin-top: auto;
                    }
                    .btn-primary, .btn-secondary, .btn-danger{
                        flex: 1;
                        padding: 0.8rem;
                        font-size: 0.9rem;
                    }
                }

                /* Requirements Styling */
                .requirements-input-container {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .requirements-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .requirement-tag {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: #f1f5f9;
                    color: #475569;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    border: 1px solid #e2e8f0;
                }
                .requirement-tag button {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                    padding: 0;
                }
                .requirement-tag button:hover {
                    color: #ef4444;
                }
            `}</style>
        </div >
    );
};
