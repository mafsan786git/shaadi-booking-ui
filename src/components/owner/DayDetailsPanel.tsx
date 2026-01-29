import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, User, Users, Info, Plus, Pencil } from 'lucide-react';
import type { Booking, AvailabilityStatus } from '../../types';
import { Button } from '../common/Button';

interface DayDetailsPanelProps {
  selectedDate: Date;
  status: AvailabilityStatus;
  note?: string;
  booking?: Booking;
  onDirectBooking: (date: Date) => void;
  onEditBooking?: (booking: Booking) => void;
}

export const DayDetailsPanel: React.FC<DayDetailsPanelProps> = ({
  selectedDate,
  status,
  note,
  booking,
  onDirectBooking,
  onEditBooking
}) => {
  // Shorter date format: "Wed, 29 Jan 2026"
  const formattedDate = format(selectedDate, 'EEE, dd MMM yyyy');

  const showRequestBooking = (status === 'AVAILABLE' || status === 'IN_PROGRESS') && status !== 'CONFRIMED';

  const formatStatus = (s: AvailabilityStatus) => {
    switch (s) {
      case 'IN_PROGRESS': return 'In Progress';
      case 'CONFRIMED': return 'Confirmed';
      case 'AVAILABLE': return 'Available';
      case 'BLOCKED': return 'Blocked';
      default: return s;
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

      {/* 2. Booking Details Card */}
      {booking && (
        <div className="detail-card booking-card">
          <div className="card-header">
            <h4 className="customer-name">{booking.customerName}</h4>
            <button
              className="edit-btn"
              onClick={() => onEditBooking?.(booking)}
              title="Edit Booking"
            >
              <Pencil size={16} />
            </button>
          </div>

          <div className="card-content">
            <div className="info-row">
              <div className="info-item">
                <span className="label">Event</span>
                <span className="value">{booking.eventType}</span>
              </div>
              <div className="info-item right">
                <span className="label">Guests</span>
                <span className="value">{booking.totalGuest}</span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-item full">
                <span className="label">Date</span>
                <span className="value date-value">
                  {booking.startDate === booking.endDate
                    ? format(parseISO(booking.startDate), 'dd MMM yyyy')
                    : `${format(parseISO(booking.startDate), 'dd MMM yyyy')} - ${format(parseISO(booking.endDate), 'dd MMM yyyy')}`
                  }
                </span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-item">
                <span className="label">Price</span>
                <span className="value price">
                  {booking.finalPrice ? `₹${booking.finalPrice.toLocaleString()}` : '-'}
                </span>
              </div>
              <div className="info-item right">
                <span className="label">Status</span>
                <span className="value status-text">
                  {booking.status}
                </span>
              </div>
            </div>

            {booking.customerNote && (
              <div className="info-row">
                <div className="info-item full">
                  <span className="label">Note</span>
                  <span className="value note">{booking.customerNote}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Action / Status Card */}
      {showRequestBooking && (
        <div className="detail-card action-card">
          {!booking && <p className="empty-text">No bookings for this date yet.</p>}
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
          border-radius: 10px;
          border: 1px solid #f3f4f6;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          padding: 0.75rem; /* Matches calendar-section card padding */
          overflow: hidden;
        }

        .header-card {
           display: flex;
           justify-content: space-between;
           align-items: center;
        }

        .panel-title {
          font-size: 0.9rem; /* Reduced from 1rem */
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        /* Reusing status pill styles */
        .status-pill {
          padding: 0.2rem 0.6rem; /* Slightly reduced padding */
          border-radius: 999px;
          font-size: 0.65rem; /* Reduced from 0.75rem */
          font-weight: 600;
          text-transform: capitalize; /* Changed from uppercase to capitalize */
        }
        .status-pill.available { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
        .status-pill.booked { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }
        .status-pill.blocked { background: #f8fafc; color: #64748b; border: 1px solid #f1f5f9; }
        .status-pill.in_progress { background: #fff7ed; color: #9a3412; border: 1px solid #ffedd5; }
        .status-pill.confrimed { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

        /* Booking Card Internals - adjusted to fit new card structure */
        .booking-card {
           padding: 0; /* Remove padding here as inner elements handle it or we want full bleed header */
           border: 1px solid #e2e8f0; /* Keep border explicit for booking card if needed, or rely on .detail-card */
        }
        
        /* Overriding detail-card padding ONLY for booking card to allow header to be full width */
        .detail-card.booking-card {
            padding: 0; 
        }

        .card-header {
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .customer-name {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
        }

        .edit-btn {
          background: white;
          border: 1px solid #cbd5e1;
          color: #64748b;
          border-radius: 4px;
          padding: 0.25rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .edit-btn:hover {
          color: #2563eb;
          border-color: #2563eb;
        }

        .card-content {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .info-item.right {
          align-items: flex-end;
          text-align: right;
        }
        
        .info-item.full {
          width: 100%;
        }

        .label {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .value {
          font-size: 0.9rem;
          color: #0f172a;
          font-weight: 500;
        }

        .value.date-value {
          font-weight: 600;
          color: #2563eb;
        }
        
        .value.price {
          font-family: monospace;
          font-weight: 600;
        }

        .value.note {
           font-style: italic;
           color: #475569;
           font-size: 0.85rem;
        }

        .status-text {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
        }

        /* Action Card Styles */
        .action-card {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 1.5rem 1rem;
        }

        .blocked-card {
             display: flex;
             justify-content: center;
             align-items: center; 
             padding: 1.5rem 1rem;
        }

        .empty-text {
          color: #6b7280;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
        
        .blocked-message {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .direct-booking-btn {
          width: 100%;
        }
      `}</style>
    </>
  );
};

