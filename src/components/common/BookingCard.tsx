import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import type { Booking } from '../../types';

interface BookingCardProps {
    booking: Booking;
    isSelected?: boolean;
    onClick?: () => void;
    onViewClick?: (e: React.MouseEvent) => void;
    showHallName?: boolean;
    onDeleteClick?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
    booking,
    isSelected,
    onClick,
    onViewClick,
    onDeleteClick,
    showHallName = false
}) => {
    const isDeletable = ['REJECTED', 'CANCELLED'].includes(booking.status);
    /* Helper to format any enum-like string (First letter capital, rest small) */
    const formatEnum = (value: string) => {
        if (!value) return '';
        return value
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    /* Helper to get color for booking status */
    const getBookingStatusStyle = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return { color: '#166534', bg: '#f0fdf4' }; // Green
            case 'REQUESTED':
            case 'OWNER_RESPONDED':
                return { color: '#F59E0B', bg: '#fff7ed' }; // Amber
            case 'COMPLETED': return { color: '#8B5CF6', bg: '#f5f3ff' }; // Purple
            case 'CANCELLED_BY_OWNER':
            case 'CANCELLED_BY_CUSTOMER':
            case 'DECLINED_BY_OWNER':
            case 'REJECTED_BY_CUSTOMER':
            case 'CANCELLED':
            case 'REJECTED':
            case 'EXPIRED':
                return { color: '#EF4444', bg: '#fef2f2' }; // Red
            default: return { color: '#94A3B8', bg: '#f8fafc' }; // Slate (Blocked/Default)
        }
    };

    const style = getBookingStatusStyle(booking.status);

    return (
        <div
            className={`booking-card ${isSelected ? 'selected-card' : ''}`}
            style={{
                borderColor: style.color
            }}
            onClick={onClick}
        >
            {/* Top Row: Name & View - Clickable */}
            <div className="bc-row top-row clickable-header">
                <div className="name-container">
                    <h4 className="customer-name">{booking.customerName}</h4>
                    {showHallName && booking.hallName && (
                        <span className="hall-name-small">{booking.hallName}</span>
                    )}
                </div>

                {isDeletable && onDeleteClick ? (
                    <button
                        className="delete-btn"
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClick();
                        }}
                    >
                        Delete
                    </button>
                ) : onViewClick && (
                    <button
                        className="view-btn"
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewClick(e);
                        }}
                    >
                        View
                    </button>
                )}
            </div>

            {/* Middle Row: Date, Event, Guest */}
            <div className="bc-middle">
                <div className="bc-info-line bc-date">
                    <Calendar size={12} style={{ marginRight: '4px', opacity: 0.7 }} />
                    {booking.startDate && booking.endDate ? (
                        booking.startDate === booking.endDate
                            ? format(parseISO(booking.startDate), 'dd MMM yyyy')
                            : `${format(parseISO(booking.startDate), 'dd MMM')} - ${format(parseISO(booking.endDate), 'dd MMM yyyy')}`
                    ) : (
                        <span className="text-red-500">Invalid Date</span>
                    )}
                </div>
                <div className="bc-info-line">
                    <span style={{ opacity: 0.7 }}>Event:</span> {formatEnum(booking.eventType)}
                </div>
                <div className="bc-info-line">
                    <span style={{ opacity: 0.7 }}>Guests:</span> {booking.totalGuest}
                </div>
            </div>

            {/* Bottom Row: Price & Status */}
            <div className="bc-row bottom-row">
                <div className="price-tag">
                    {booking.finalPrice ? `₹${booking.finalPrice.toLocaleString()}` : '-'}
                </div>
                <div
                    className="status-tag"
                    style={{ color: style.color, backgroundColor: style.bg }}
                >
                    {formatEnum(booking.status)}
                </div>
            </div>

            <style>{`
        /* Booking Card Refined Minimal Layout */
        .booking-card {
           display: flex;
           flex-direction: column;
           gap: 0.6rem;
           padding: 0.75rem !important;
           background: #ffffff;
           border: 1px solid #e2e8f0;
           border-radius: 8px; /* Added border radius here as it was missing from style block but used in layout */
           box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
           transition: transform 0.1s ease-in-out;
           cursor: pointer;
        }
        
        .booking-card.selected-card {
           background: #ffffff;
           ring: 2px solid #2563eb; /* Conceptual, realized via border color mostly */
        }
        
        .booking-card:hover {
           transform: translateY(-1px);
           box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .bc-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        
        .name-container {
            display: flex;
            flex-direction: column;
        }

        .customer-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }
        
        .hall-name-small {
            font-size: 0.7rem;
            color: #64748b;
            font-weight: 500;
        }

        .top-row.clickable-header {
          padding: 2px;
          margin: -2px;
          border-radius: 6px;
        }

        .view-btn {
          background: transparent;
          border: none;
          color: #2563eb;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .view-btn:hover {
          color: #1d4ed8;
          background: #eff6ff;
        }

        .delete-btn {
          background: #dc2626;
          border: none;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .delete-btn:hover {
          color: #b91c1c;
          background: #fee2e2;
        }

        .bc-middle {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding: 0;
          border: none;
        }

        .bc-info-line {
          font-size: 0.8rem;
          font-weight: 500;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .bc-date {
           color: #334155;
           font-weight: 600;
           margin-bottom: 0.1rem;
        }

        .bottom-row {
          margin-top: 0.2rem;
          align-items: center;
        }

        .price-tag {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .status-tag {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }
      `}</style>
        </div>
    );
};
