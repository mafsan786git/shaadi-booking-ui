import React from 'react';
import { format } from 'date-fns';
import { Calendar, User, Users, Info, Plus } from 'lucide-react';
import type { Booking, AvailabilityStatus } from '../../types';
import { Button } from '../common/Button';

interface DayDetailsPanelProps {
  selectedDate: Date;
  status: AvailabilityStatus;
  booking?: Booking;
  onDirectBooking: (date: Date) => void;
}

export const DayDetailsPanel: React.FC<DayDetailsPanelProps> = ({
  selectedDate,
  status,
  booking,
  onDirectBooking,
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
        {status === 'BOOKED' && booking && (
          <div className="booking-details">
            <div className="detail-item">
              <User size={18} className="detail-icon" />
              <div>
                <p className="detail-label">Customer</p>
                <p className="detail-value">{booking.customerName}</p>
              </div>
            </div>
            <div className="detail-item">
              <Calendar size={18} className="detail-icon" />
              <div>
                <p className="detail-label">Event Type</p>
                <p className="detail-value">{booking.eventType}</p>
              </div>
            </div>
            <div className="detail-item">
              <Users size={18} className="detail-icon" />
              <div>
                <p className="detail-label">Guests</p>
                <p className="detail-value">{booking.totalGuest} People</p>
              </div>
            </div>
            {booking.customerNote && (
              <div className="detail-item">
                <Info size={18} className="detail-icon" />
                <div>
                  <p className="detail-label">Note</p>
                  <p className="detail-value note">{booking.customerNote}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'AVAILABLE' && (
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

        {status === 'BLOCKED' && (
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
      `}</style>
    </div>
  );
};
