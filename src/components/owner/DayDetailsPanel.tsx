import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Info, Plus } from 'lucide-react';
import type { Booking, AvailabilityStatus } from '../../types';
import { Button } from '../common/Button';

interface DayDetailsPanelProps {
  selectedDate: Date;
  status: AvailabilityStatus;
  note?: string;
  bookings: Booking[];
  selectedBookingId?: string;
  onDirectBooking: (date: Date) => void;
  onEditBooking?: (booking: Booking) => void;
}

export const DayDetailsPanel: React.FC<DayDetailsPanelProps> = ({
  selectedDate,
  status,
  note,
  bookings = [],
  selectedBookingId,
  onDirectBooking,
  onEditBooking
}) => {
  // Shorter date format: "Wed, 29 Jan 2026"
  const formattedDate = format(selectedDate, 'EEE, dd MMM yyyy');

  const showRequestBooking = (status === 'AVAILABLE' || status === 'IN_PROGRESS');

  const formatStatus = (s: AvailabilityStatus) => {
    switch (s) {
      case 'IN_PROGRESS': return 'In Progress';
      case 'CONFRIMED': return 'Confirmed';
      case 'AVAILABLE': return 'Available';
      case 'BLOCKED': return 'Blocked';
      default: return s;
    }
  };

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
      case 'CONFIRMED': return { color: '#16a34a', bg: '#dcfce7' }; // Green
      case 'REQUESTED': return { color: '#d97706', bg: '#fef3c7' }; // Amber
      case 'OWNER_RESPONDED': return { color: '#2563eb', bg: '#dbeafe' }; // Blue
      case 'CANCELLED_BY_OWNER':
      case 'CANCELLED_BY_CUSTOMER':
      case 'DECLINED_BY_OWNER':
      case 'REJECTED_BY_CUSTOMER':
      case 'EXPIRED':
        return { color: '#dc2626', bg: '#fee2e2' }; // Red
      default: return { color: '#475569', bg: '#f1f5f9' }; // Slate
    }
  };

  return (
    <>
      {/* 1. Header Card */}
      <div className="detail-card header-card">
        <h3 className="panel-title">{formattedDate}</h3>
        <span className={`status-pill ${status.toLowerCase()}`}>
          {formatStatus(status)}
        </span>
      </div>

      {/* 2. Booking Details Cards List - Only show if current date has a booking */}
      {selectedBookingId && (
        <div className="bookings-list-container">
          {bookings.map((booking) => {
            const isSelected = !!selectedBookingId && booking.id === selectedBookingId;
            const style = getBookingStatusStyle(booking.status);

            return (
              <div
                key={booking.id}
                className={`detail-card booking-card ${isSelected ? 'selected-card' : ''}`}
                style={{
                  borderColor: style.color
                }}
              >
                {/* Top Row: Name & View - Clickable */}
                <div
                  className="bc-row top-row clickable-header"
                  onClick={() => onEditBooking?.(booking)}
                  title="View Booking Details"
                >
                  <h4 className="customer-name">{booking.customerName}</h4>
                  <button
                    className="view-btn"
                    type="button"
                  >
                    View
                  </button>
                </div>

                {/* Middle Row: Date, Event, Guest */}
                <div className="bc-middle">
                  <div className="bc-info-line bc-date">
                    <Calendar size={12} style={{ marginRight: '4px', opacity: 0.7 }} />
                    {booking.startDate === booking.endDate
                      ? format(parseISO(booking.startDate), 'dd MMM yyyy')
                      : `${format(parseISO(booking.startDate), 'dd MMM')} - ${format(parseISO(booking.endDate), 'dd MMM yyyy')}`
                    }
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
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Action / Status Card */}
      {showRequestBooking && (
        <div className="detail-card action-card">
          {bookings.length === 0 && <p className="empty-text">No bookings for this date yet.</p>}
          <Button
            variant="primary"
            onClick={() => onDirectBooking(selectedDate)}
            className="direct-booking-btn"
          >
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Request Booking
          </Button>
        </div>
      )}

      {status === 'BLOCKED' && (
        <div className="detail-card blocked-card">
          <div className="blocked-message">
            <Info size={24} style={{ color: '#9ca3af', marginBottom: '0.5rem' }} />
            <p className="empty-text">{note || 'This date is manually blocked.'}</p>
          </div>
        </div>
      )}

      <style>{`
        .detail-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          padding: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .bookings-list-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .bookings-list-container::-webkit-scrollbar {
          width: 4px;
        }
        .bookings-list-container::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }

        .header-card {
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-bottom: 0.5rem;
        }

        .panel-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        /* Reusing status pill styles */
        .status-pill {
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .status-pill.available { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
        .status-pill.booked { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }
        .status-pill.blocked { background: #f8fafc; color: #64748b; border: 1px solid #f1f5f9; }
        .status-pill.in_progress { background: #fff7ed; color: #9a3412; border: 1px solid #ffedd5; }
        .status-pill.confrimed { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

        /* Booking Card Refined Minimal Layout */
        .booking-card {
           display: flex;
           flex-direction: column;
           gap: 0.6rem;
           padding: 0.75rem !important;
           background: #ffffff;
           border: 1px solid #e2e8f0;
           box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05); /* Reduced shadow, removed accent border */
           transition: transform 0.1s ease-in-out;
        }
        
        .booking-card.selected-card {
           background: #ffffff;
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
        
        .customer-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .top-row.clickable-header {
          cursor: pointer;
          padding: 4px;
          margin: -4px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }
        .top-row.clickable-header:hover {
          background-color: #f8fafc;
        }
        .top-row.clickable-header:hover .view-btn {
          background: #eff6ff;
        }

        .view-btn {
          background: transparent;
          border: none;
          color: #2563eb; /* Blue explicitly */
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

        .bc-middle {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          /* background: #f8fafc; Removed background */
          padding: 0; /* Removed padding */
          border-radius: 0;
          border: none; /* Removed border */
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

        /* Action Card Styles */
        .action-card {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 1rem;
            margin-top: 0.5rem;
            border-style: dashed;
            border-color: #cbd5e1;
        }

        .blocked-card {
             display: flex;
             justify-content: center;
             align-items: center; 
             padding: 1rem;
        }

        .empty-text {
          color: #94a3b8;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }
        
        .blocked-message {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .direct-booking-btn {
          width: 100%;
          font-size: 0.9rem;
          padding: 0.35rem 0.5rem;
        }
      `}</style>
    </>
  );
};

