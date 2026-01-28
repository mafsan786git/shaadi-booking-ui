import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, User, Users, Info, Plus, Pencil } from 'lucide-react';
import type { Booking, AvailabilityStatus } from '../../types';
import { Button } from '../common/Button';

interface DayDetailsPanelProps {
  selectedDate: Date;
  status: AvailabilityStatus;
  booking?: Booking;
  onDirectBooking: (date: Date) => void;
  onEditBooking?: (booking: Booking) => void;
}

export const DayDetailsPanel: React.FC<DayDetailsPanelProps> = ({
  selectedDate,
  status,
  booking,
  onDirectBooking,
  onEditBooking
}) => {
  const formattedDate = format(selectedDate, 'EEEE, MMMM do, yyyy');

  return (
    <div className="details-panel">
      <div className="panel-header">
        <h3 className="panel-title">{formattedDate}</h3>
        <span className={`status-pill ${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      <div className="panel-content">
        {booking ? (
          <div className="booking-card">
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
                  <span className={`status-text ${booking.status.toLowerCase()}`}>
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
        ) : null}

        {!booking && status === 'AVAILABLE' && (
          <div className="empty-state">
            <p className="empty-text">No bookings for this date yet.</p>
            <Button
              variant="primary"
              onClick={() => onDirectBooking(selectedDate)}
              className="direct-booking-btn"
            >
              <Plus size={18} style={{ marginRight: '0.5rem' }} /> Request Booking
            </Button>
          </div>
        )}

        {!booking && status === 'BLOCKED' && (
          <div className="blocked-message">
            <Info size={24} style={{ color: '#9ca3af', marginBottom: '0.5rem' }} />
            <p className="empty-text">This date is manually blocked.</p>
          </div>
        )}
      </div>

      <style>{`
        .details-panel {
          background: #f9fafb;
          border-radius: 10px;
          padding: 1rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .panel-title {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        .status-pill {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-pill.available { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
        .status-pill.booked { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }
        .status-pill.blocked { background: #f8fafc; color: #64748b; border: 1px solid #f1f5f9; }
        .status-pill.pending { background: #fff7ed; color: #9a3412; border: 1px solid #ffedd5; }

        .booking-details {
          display: grid;
          gap: 1.25rem;
        }
        .detail-item {
          display: flex;
          gap: 0.75rem;
        }
        .detail-icon {
          color: #6b7280;
          margin-top: 2px;
        }
        .detail-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0 0 2px 0;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .detail-value {
          font-size: 1rem;
          font-weight: 500;
          color: #111827;
          margin: 0;
        }
        .detail-value.note {
          font-weight: 400;
          font-style: italic;
          color: #4b5563;
        }

        .empty-state, .blocked-message {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem 0;
        }
        .empty-text {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }
        .direct-booking-btn {
          width: 100%;
        }

        /* Booking Card Styles */
        .booking-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
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
        .status-text.confirmed { color: #166534; }
        .status-text.requested { color: #d97706; }
        .status-text.cancelled { color: #ef4444; }
      `}</style>
    </div>
  );
};
