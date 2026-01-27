import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DayAvailabilityResponse } from '../../types';

interface AvailabilityCalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  availabilityData: DayAvailabilityResponse[];
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  currentMonth,
  onMonthChange,
  selectedDate,
  onDateSelect,
  availabilityData,
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const availabilityMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!Array.isArray(availabilityData)) return map;

    availabilityData.forEach((d) => {
      if (d && d.date) {
        const dateKey = d.date.split('T')[0];
        map[dateKey] = d.status;
      }
    });

    return map;
  }, [availabilityData]);

  const getDayStatus = (date: Date) => {
    const calendarDateStr = format(date, 'yyyy-MM-dd');
    return availabilityMap[calendarDateStr] || 'AVAILABLE';
  };

  const handlePrevMonth = () => onMonthChange(subMonths(currentMonth, 1));
  const handleNextMonth = () => onMonthChange(addMonths(currentMonth, 1));

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(parseInt(e.target.value));
    onMonthChange(newDate);
  };

  const handleMonthSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(parseInt(e.target.value));
    onMonthChange(newDate);
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-btn">
          <ChevronLeft size={18} />
        </button>

        <div className="month-year-picker">
          <select
            value={currentMonth.getMonth()}
            onChange={handleMonthSelect}
            className="picker-select month"
          >
            {months.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={currentMonth.getFullYear()}
            onChange={handleYearChange}
            className="picker-select year"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button onClick={handleNextMonth} className="nav-btn">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="weekday-label">{day}</div>
        ))}
        {calendarDays.map((date, index) => {
          const status = getDayStatus(date);
          const isCurrentMonth = isSameMonth(date, monthStart);
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());

          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonth ? 'outside-month' : ''} ${isSelected && isCurrentMonth ? 'selected' : ''} ${isToday && isCurrentMonth ? 'today' : ''} ${isCurrentMonth ? `status-${status.toLowerCase()}` : ''}`}
              onClick={() => isCurrentMonth && onDateSelect(date)}
            >
              <span className="day-number">{format(date, 'd')}</span>
              {isCurrentMonth && status !== 'AVAILABLE' && (
                <div className="status-dot-container">
                  <div className={`status-dot ${status.toLowerCase()}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .calendar-container {
          background: white;
          border-radius: 8px;
          padding: 0.5rem;
          user-select: none;
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          background: #f8faff;
          padding: 0.35rem;
          border-radius: 8px;
        }
        .month-year-picker {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .picker-select {
          background: #eef4ff;
          border: 1px solid #dbeafe;
          color: #005EB8;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          transition: all 0.2s;
          appearance: none;
          -webkit-appearance: none;
          text-align: center;
          line-height: 1;
        }
        .picker-select:hover {
          background: #dbeafe;
        }
        .picker-select:focus {
          outline: none;
          background: #eef4ff;
          border-color: #dbeafe;
        }
        /* Fix for potential white-out/invisible text */
        .picker-select option {
          background: white;
          color: #111827;
        }
        .picker-select.month {
          min-width: 100px;
        }
        .picker-select.year {
          min-width: 65px;
        }
        .nav-btn {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.35rem;
          cursor: pointer;
          color: #005EB8;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .nav-btn:hover {
          background: #f8faff;
          border-color: #005EB8;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .weekday-label {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          padding-bottom: 0.5rem;
          text-transform: uppercase;
        }
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
          border: 1px solid transparent;
          -webkit-tap-highlight-color: transparent;
        }
        @media (hover: hover) {
          .calendar-day:hover:not(.outside-month) {
            background: #f1f5f9;
            border-color: #cbd5e1;
          }
        }
        .calendar-day.outside-month {
          color: #cbd5e1;
          opacity: 1;
          cursor: default;
          pointer-events: none;
        }
        .calendar-day.selected {
          background: #2563eb !important;
          color: white !important;
          border-color: #2563eb;
          z-index: 2;
        }
        .calendar-day.today:not(.selected) {
          color: #2563eb;
          font-weight: 800;
        }
        .calendar-day.today:not(.selected)::after {
          content: '';
          position: absolute;
          bottom: 4px;
          width: 4px;
          height: 4px;
          background: #2563eb;
          border-radius: 50%;
        }
        .day-number {
          font-size: 0.95rem;
          z-index: 1;
        }
        .status-dot-container {
          height: 6px;
          display: flex;
          gap: 2px;
          margin-top: 4px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .status-dot.confrimed { background: #ef4444; }
        .status-dot.blocked { background: #94a3b8; }
        .status-dot.in_progress { background: #f59e0b; }
        .status-dot.available { background: #22c55e; }

        .status-confrimed:not(.selected) { background: #fef2f2; color: #991b1b; }
        .status-blocked:not(.selected) { background: #f8fafc; color: #64748b; }
        .status-in_progress:not(.selected) { background: #fff7ed; color: #9a3412; }
        .status-available:not(.selected) { background: #f0fdf4; color: #166534; }
      `}</style>
    </div>
  );
};
