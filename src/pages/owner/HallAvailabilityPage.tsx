import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon, RefreshCcw } from 'lucide-react';
import { AvailabilityCalendar } from '../../components/owner/AvailabilityCalendar';
import { DayDetailsPanel } from '../../components/owner/DayDetailsPanel';
import { bookingService } from '../../services/bookingService';
import { hallService } from '../../services/hallService';
import { useHallStore } from '../../context/useHallStore';
import {
  format,
  parseISO,
  isSameDay,
  startOfMonth,
  isSameMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import type { Hall, BookingRequest, Booking } from '../../types';
import { toast } from 'react-hot-toast';
import { BookingModal } from '../../components/common/BookingModal';

export const HallAvailabilityPage: React.FC = () => {
  const navigate = useNavigate();

  // Use granular selectors to prevent unnecessary re-renders
  const halls = useHallStore(state => state.halls);
  const selectedHallId = useHallStore(state => state.selectedHallId);
  const fetchAvailability = useHallStore(state => state.fetchAvailability);
  const fetchMultiAvailability = useHallStore(state => state.fetchMultiAvailability);
  const availabilityCache = useHallStore(state => state.availabilityCache);

  const hasInitiallyFetchedRef = useRef(false);

  const [hall, setHall] = useState<Hall | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalReadOnly, setIsModalReadOnly] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState<Partial<BookingRequest>>({});
  const [monthBookings, setMonthBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!selectedHallId) {
      navigate('/dashboard');
      return;
    }

    // First check if hall exists in global store
    const cachedHall = halls.find(h => h.hallId === selectedHallId);
    if (cachedHall) {
      setHall(cachedHall);
    } else {
      fetchHallDetails();
    }
  }, [selectedHallId, halls, navigate]);

  // Stabilize pre-fetch function
  const prefetchAdjacentMonths = useCallback((hallId: string, baseDate: Date, force = false) => {
    // Detect if this is "Initial Load" (Viewing current month as of now)
    const isNow = isSameMonth(baseDate, new Date());

    let offsets: number[] = [];
    if (isNow) {
      offsets = [1, 2, 3];
    } else {
      offsets = [-2, -1, 1, 2];
    }

    const monthsToFetch = offsets.map(offset => {
      const offsetDate = offset > 0
        ? addMonths(baseDate, offset)
        : subMonths(baseDate, Math.abs(offset));
      return format(offsetDate, 'yyyy-MM');
    });

    fetchMultiAvailability(hallId, monthsToFetch, force).catch(() => { });
  }, [fetchMultiAvailability]);

  // Main fetch and pre-fetch effect
  useEffect(() => {
    if (!selectedHallId) return;

    const loadData = async () => {
      const monthStr = format(currentMonth, 'yyyy-MM');
      const isInitialLand = !hasInitiallyFetchedRef.current;

      // We only show loading if we don't have data in cache yet
      // This provides a "snappy" feel when navigating back/forth
      const cachedEntry = useHallStore.getState().availabilityCache[selectedHallId]?.[monthStr];
      if (!cachedEntry?.data) setLoading(true);

      try {
        const [_, bookings] = await Promise.all([
          fetchAvailability(selectedHallId, monthStr, isInitialLand),
          bookingService.getBookingsForMonth(selectedHallId, monthStr)
        ]);
        setMonthBookings(bookings);

        setLoading(false);
        prefetchAdjacentMonths(selectedHallId, currentMonth, isInitialLand);
        hasInitiallyFetchedRef.current = true;
      } catch (error) {
        console.error(error);
        toast.error('Failed to update availability');
        setLoading(false);
      }
    };

    loadData();
  }, [selectedHallId, currentMonth, fetchAvailability, prefetchAdjacentMonths]);

  const fetchHallDetails = async () => {
    if (!selectedHallId) return;
    try {
      const data = await hallService.getHallById(selectedHallId);
      setHall(data);
    } catch (error) {
      toast.error('Failed to fetch hall details');
    }
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
    // Default to 1st of the month when changing months
    setSelectedDate(startOfMonth(date));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleGoToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now);
  };

  const handleDirectBooking = (date: Date) => {
    setBookingInitialData({
      startDate: format(date, 'yyyy-MM-dd'),
    });
    setIsModalReadOnly(false);
    setIsModalOpen(true);
  };

  const handleBookingSuccess = async () => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    // Refresh availability and bookings for the current month
    try {
      await Promise.all([
        fetchAvailability(selectedHallId!, monthStr, true),
        bookingService.getBookingsForMonth(selectedHallId!, monthStr).then(bookings => setMonthBookings(bookings))
      ]);
    } catch (error) {
      console.error('Failed to refresh data after booking:', error);
    }
    setIsModalOpen(false);
  };

  const handleEditBooking = (booking: Booking) => {
    setBookingInitialData({
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      startDate: booking.startDate,
      endDate: booking.endDate,
      eventType: booking.eventType,
      totalGuest: booking.totalGuest,
      customerNote: booking.customerNote,
      ownerNote: booking.ownerNote,
      finalPrice: booking.finalPrice,
      status: booking.status,
    });
    setIsModalReadOnly(true);
    setIsModalOpen(true);
  };

  if (!hall && !loading) return <div className="container">Hall not found</div>;

  const currentMonthStr = format(currentMonth, 'yyyy-MM');
  const monthAvailability = (selectedHallId && availabilityCache[selectedHallId]?.[currentMonthStr]?.data) || [];


  // Filter bookings that overlap with the selected date
  const selectedDayBookings = monthBookings.filter(b => {
    const s = format(parseISO(b.startDate), 'yyyy-MM-dd');
    const e = format(parseISO(b.endDate), 'yyyy-MM-dd');
    const curr = format(selectedDate, 'yyyy-MM-dd');
    return curr >= s && curr <= e;
  });

  const selectedDayData = monthAvailability.find((d: any) => d?.date && isSameDay(parseISO(d.date), selectedDate));
  const currentStatus = selectedDayData?.status || 'AVAILABLE';

  const isShowingCurrentMonth = isSameMonth(currentMonth, new Date());

  return (
    <div className="container page-padding">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ChevronLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="availability-hero">
        <div className="hall-info-section">
          <div className="hall-icon-container">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h1 className="hall-name">{hall?.name || 'Loading...'}</h1>
            <p className="page-subtitle">Availability & Bookings</p>
          </div>
        </div>
        {!isShowingCurrentMonth && (
          <button className="current-month-jump-icon" onClick={handleGoToCurrentMonth}>
            <RefreshCcw size={16} />
            <span className="jump-label">Current Month</span>
          </button>
        )}
      </div>

      <div className="availability-container">
        <div className="calendar-section card">
          {loading && <div className="loading-overlay">Loading...</div>}
          <AvailabilityCalendar
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            availabilityData={monthAvailability}
          />
        </div>

        <div className="details-section">
          <DayDetailsPanel
            selectedDate={selectedDate}
            status={currentStatus}
            note={selectedDayData?.note}
            bookings={selectedDayBookings}
            selectedBookingId={selectedDayBookings[0]?.id}
            onDirectBooking={handleDirectBooking}
            onEditBooking={handleEditBooking}
          />

        </div>
      </div>



      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleBookingSuccess}
        initialData={bookingInitialData}
        mode="OWNER"
        hallId={selectedHallId || ''}
        readOnly={isModalReadOnly}
      />

      <style>{`
        .page-padding {
          padding-top: 0.25rem;
          padding-bottom: 2rem;
        }

        .page-header {
          margin-bottom: 0.5rem;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #4b5563;
          cursor: pointer;
          font-weight: 500;
          padding: 0.25rem 0;
          transition: color 0.2s;
          font-size: 0.875rem;
        }

        .back-btn:hover {
          color: #2563eb;
        }

        .availability-hero {
          margin-bottom: 0.75rem;
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          border: 1px solid #f3f4f6;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
          min-height: 60px;
        }

        .hall-info-section {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding-top: 0.25rem;
        }

        .hall-icon-container {
          background: #eff6ff;
          color: #2563eb;
          padding: 0.4rem;
          border-radius: 6px;
        }

        .hall-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
          line-height: 1.1;
        }

        .page-subtitle {
          color: #6b7280;
          margin: 0.1rem 0 0 0;
          font-size: 0.7rem;
        }

        .current-month-jump-icon {
          background: none;
          border: none;
          color: #2563eb;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          cursor: pointer;
          padding: 0.25rem;
          transition: all 0.2s;
          position: absolute;
          bottom: 0.5rem;
          right: 0.75rem;
        }

        .current-month-jump-icon:hover {
          color: #1e40af;
          transform: translateY(-1px);
        }

        .jump-label {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.025em;
        }

        .availability-container {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1rem;
          align-items: start;
        }

        .details-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .card {
          background: white;
          border-radius: 10px;
          border: 1px solid #f3f4f6;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .calendar-section {
          padding: 0.75rem;
          position: relative;
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          font-weight: 500;
          color: #2563eb;
        }

        @media (max-width: 1024px) {
          .availability-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div >
  );
};

