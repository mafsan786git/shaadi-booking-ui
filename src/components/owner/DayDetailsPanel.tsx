import React from 'react';
import { format, isBefore, startOfDay } from 'date-fns';
import { Info, Plus } from 'lucide-react';
import type { Booking, AvailabilityStatus } from '../../types';
import { Button } from '../common/Button';
import { BookingCard } from '../common/BookingCard';
import { formatEnum } from '../../utils/formatters';

interface DayDetailsPanelProps {
  selectedDate: Date;
  status: AvailabilityStatus;
  note?: string;
  bookings: Booking[];
  selectedBookingId?: string;
  onDirectBooking: (date: Date) => void;
  onEditBooking?: (booking: Booking) => void;
  onDeleteBooking?: (bookingId: string) => void;
}

export const DayDetailsPanel: React.FC<DayDetailsPanelProps> = ({
  selectedDate,
  status,
  note,
  bookings = [],
  selectedBookingId,
  onDirectBooking,
  onEditBooking,
  onDeleteBooking
}) => {
  // Shorter date format: "Wed, 29 Jan 2026"
  const formattedDate = format(selectedDate, 'EEE, dd MMM yyyy');

  const isPast = isBefore(selectedDate, startOfDay(new Date()));
  const showRequestBooking = (status === 'AVAILABLE' || status === 'IN_PROGRESS') && !isPast;

  const formatStatus = (s: AvailabilityStatus) => {
    return formatEnum(s);
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
            return (
              <BookingCard
                key={booking.id}
                booking={booking}
                isSelected={isSelected}
                onClick={() => onEditBooking?.(booking)}
                onViewClick={() => onEditBooking?.(booking)}
                onDeleteClick={() => onDeleteBooking?.(booking.id)}
              />
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
        .status-pill.available { background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }
        .status-pill.booked { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }
        .status-pill.blocked { background: #f8fafc; color: #64748b; border: 1px solid #f1f5f9; }
        .status-pill.in_progress { background: #fff7ed; color: #9a3412; border: 1px solid #ffedd5; }
        .status-pill.confirmed { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
        .status-pill.completed { background: #166534; color: white; border: 1px solid #166534; }

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

