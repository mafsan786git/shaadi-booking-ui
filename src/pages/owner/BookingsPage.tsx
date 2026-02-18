import React, { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, XCircle, Building2, AlertCircle, CalendarPlus, ClipboardCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import type { Booking } from '../../types';
import { format, parseISO, eachDayOfInterval, isWithinInterval, startOfDay, isBefore, addDays } from 'date-fns';
import { notificationService } from '../../services/notificationService';
import { BookingCard } from '../../components/common/BookingCard';
import { BookingModal } from '../../components/common/BookingModal';

import { useHallStore } from '../../context/useHallStore';

type StatusFilterType = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export const BookingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { halls, fetchHalls } = useHallStore();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfDay(new Date())); // Start from today
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');
    const [isHallDropdownOpen, setIsHallDropdownOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingBookings(true);
            try {
                // Fetch bookings starting from the current week
                const formattedDate = format(currentWeekStart, 'yyyy-MM-dd');
                const allBookings = await bookingService.getAllBookings(formattedDate);
                setBookings(allBookings);

                if (halls.length === 0) {
                    await fetchHalls();
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                notificationService.error("Failed to load dashboard data");
            } finally {
                setIsLoadingBookings(false);
            }
        };

        loadData();
    }, [currentWeekStart, searchParams.get('refresh')]);

    const handleWeekChange = (direction: 'prev' | 'next') => {
        setCurrentWeekStart(prev => direction === 'prev' ? addDays(prev, -7) : addDays(prev, 7));
    };

    const weekStart = currentWeekStart;
    const weekEnd = addDays(currentWeekStart, 6);

    // --- Computed Data ---

    // 1. Pending Requests (Always visible, unfiltered by week)
    const pendingRequests = useMemo(() => {
        return bookings.filter(b => b.status === 'REQUESTED' || b.status === 'OWNER_RESPONDED')
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [bookings]);


    // 2. Summary Stats
    const stats = useMemo(() => {
        const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
        const confirmed = confirmedBookings.length;
        const pending = pendingRequests.length;
        const completed = bookings.filter(b => b.status === 'COMPLETED').length;
        const cancelled = bookings.filter(b => ['CANCELLED', 'REJECTED'].includes(b.status)).length;

        // For "This Week", we calculate based on the current week start
        const thisWeekCount = bookings.filter(b => {
            if (!b.startDate) return false;
            if (!['REQUESTED', 'OWNER_RESPONDED', 'CONFIRMED', 'COMPLETED'].includes(b.status)) return false;

            try {
                const start = parseISO(b.startDate);
                const end = b.endDate ? parseISO(b.endDate) : start;

                // Check if any part of the booking overlaps with the current week
                return (
                    (start >= weekStart && start <= weekEnd) ||
                    (end >= weekStart && end <= weekEnd) ||
                    (start <= weekStart && end >= weekEnd)
                );
            } catch { return false; }
        }).length;

        // Calculate Available Slots in this week
        let availableSlots = 0;
        if (halls.length > 0) {
            const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

            const today = startOfDay(new Date());

            // Total slots = days * halls
            // Subtract slots that are booked

            daysInWeek.forEach(day => {
                // Skip past days (even in current week)
                if (isBefore(day, today)) return;

                halls.forEach(hall => {
                    // Check if this hall is booked on this day
                    const isBooked = bookings.some(b => {
                        if (b.hallId !== hall.hallId) return false;
                        if (!['REQUESTED', 'OWNER_RESPONDED', 'CONFIRMED', 'COMPLETED'].includes(b.status)) return false;

                        try {
                            const start = parseISO(b.startDate);
                            const end = b.endDate ? parseISO(b.endDate) : start;
                            return isWithinInterval(day, { start, end });
                        } catch { return false; }
                    });

                    if (!isBooked) {
                        availableSlots++;
                    }
                });
            });
        }

        return { confirmed, pending, thisWeekCount, completed, cancelled, availableSlots };
    }, [bookings, pendingRequests, weekStart, weekEnd, halls]);

    const handleRequestBooking = (hallId?: string) => {
        setIsHallDropdownOpen(false);
        const monthStr = format(weekStart, 'yyyy-MM');

        const targetHallId = hallId || (halls.length === 1 ? halls[0].hallId : undefined);

        if (targetHallId) {
            navigate(`/hall/availability?hallId=${targetHallId}&month=${monthStr}`);
        } else {
            navigate(`/hall?month=${monthStr}`);
        }
    };

    const handleStatClick = (type: string) => {
        if (type === 'AVAILABLE') {
            if (halls.length > 1) {
                setIsHallDropdownOpen(!isHallDropdownOpen);
            } else {
                handleRequestBooking();
            }
        } else if (type === 'THIS_WEEK') {
            setStatusFilter('ALL');
        } else {
            setStatusFilter(type as StatusFilterType);
        }
    };

    const handleDeleteBooking = async (bookingId: string) => {
        try {
            await bookingService.deleteBooking(bookingId);
            notificationService.success('Booking deleted successfully');
            // Refresh data
            const formattedDate = format(currentWeekStart, 'yyyy-MM-dd');
            const allBookings = await bookingService.getAllBookings(formattedDate);
            setBookings(allBookings);
        } catch (error) {
            console.error('Failed to delete booking:', error);
            notificationService.error('Failed to delete booking');
        }
    };

    // 3. Weekly Grid Bookings (Filtered by Week AND Status Filter)
    const weeklyGridBookings = useMemo(() => {
        return bookings.filter(b => {
            // Week Filter
            if (!b.startDate) return false;
            let isInWeek = false;
            try {
                const start = parseISO(b.startDate);
                const end = b.endDate ? parseISO(b.endDate) : start;
                // Overlap logic
                isInWeek = start <= weekEnd && end >= weekStart;
            } catch { return false; }

            if (!isInWeek) return false;

            // Status Filter using the Filter State
            if (statusFilter === 'ALL') return true;
            if (statusFilter === 'PENDING') return b.status === 'REQUESTED' || b.status === 'OWNER_RESPONDED';
            if (statusFilter === 'CONFIRMED') return b.status === 'CONFIRMED';
            if (statusFilter === 'COMPLETED') return b.status === 'COMPLETED';
            if (statusFilter === 'CANCELLED') return b.status === 'CANCELLED' || b.status === 'REJECTED';

            return true;
        }).sort((a, b) => {
            // Sort logic: 'ALL' filter special handling
            if (statusFilter === 'ALL') {
                const isCancelledA = ['CANCELLED', 'REJECTED'].includes(a.status);
                const isCancelledB = ['CANCELLED', 'REJECTED'].includes(b.status);

                if (isCancelledA && !isCancelledB) return 1; // A is cancelled, put at bottom
                if (!isCancelledA && isCancelledB) return -1; // B is cancelled, put at bottom
            }

            // Secondary sort (or primary for other filters): Date
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        });
    }, [bookings, weekStart, weekEnd, statusFilter]);

    // Old handleRequestBooking removed


    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                {/* Week Navigation */}
                <div className="week-nav">
                    <button onClick={() => handleWeekChange('prev')} className="nav-btn">
                        <ChevronLeft size={18} />
                        <span className="nav-text">Prev Week</span>
                    </button>
                    <span className="week-label">
                        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
                    </span>
                    <button onClick={() => handleWeekChange('next')} className="nav-btn">
                        <span className="nav-text">Next Week</span>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Summary Stats Row */}
            <div className="stats-grid">
                {/* This Week */}
                <div className="stat-card clickable" onClick={() => handleStatClick('THIS_WEEK')}>
                    <div>
                        <p className="stat-label">This Week</p>
                        <p className="stat-value text-blue-600">{stats.thisWeekCount}</p>
                    </div>
                    <div className="stat-icon-small text-blue-600">
                        <Calendar size={16} />
                    </div>
                </div>

                {/* Confirmed */}
                <div className="stat-card clickable" onClick={() => handleStatClick('CONFIRMED')}>
                    <div>
                        <p className="stat-label">Confirmed</p>
                        <p className="stat-value text-status-confirmed">{stats.confirmed}</p>
                    </div>
                    <div className="stat-icon-small text-status-confirmed">
                        <CheckCircle size={16} />
                    </div>
                </div>

                {/* Pending */}
                <div className="stat-card clickable" onClick={() => handleStatClick('PENDING')}>
                    <div>
                        <p className="stat-label">Pending</p>
                        <p className="stat-value text-amber">{stats.pending}</p>
                    </div>
                    <div className="stat-icon-small text-amber">
                        <AlertCircle size={16} />
                    </div>
                </div>

                {/* Available - With Relative Dropdown */}
                <div
                    className="stat-card clickable relative"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleStatClick('AVAILABLE');
                    }}
                >
                    <div>
                        <p className="stat-label">Available</p>
                        <p className="stat-value text-status-available">{stats.availableSlots}</p>
                    </div>
                    <div className="stat-icon-small text-status-available">
                        <CalendarPlus size={16} />
                    </div>

                    {/* Dropdown */}
                    {isHallDropdownOpen && halls.length > 1 && (
                        <div
                            className="hall-dropdown-menu"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* <div className="dropdown-header">Select Hall</div> */}
                            {halls.map(hall => (
                                <div
                                    key={hall.hallId}
                                    onClick={() => handleRequestBooking(hall.hallId)}
                                    className="dropdown-item"
                                >
                                    <Building2 size={14} className="mr-2" />
                                    <span className="truncate">{hall.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed */}
                <div className="stat-card clickable" onClick={() => handleStatClick('COMPLETED')}>
                    <div>
                        <p className="stat-label">Completed</p>
                        <p className="stat-value text-status-completed">{stats.completed}</p>
                    </div>
                    <div className="stat-icon-small text-status-completed">
                        <ClipboardCheck size={16} />
                    </div>
                </div>

                {/* Cancelled */}
                <div className="stat-card clickable" onClick={() => handleStatClick('CANCELLED')}>
                    <div>
                        <p className="stat-label">Cancelled</p>
                        <p className="stat-value text-red">{stats.cancelled}</p>
                    </div>
                    <div className="stat-icon-small text-red">
                        <XCircle size={16} />
                    </div>
                </div>
            </div>

            {/* Weekly Grid Section */}
            <div className="section-container">
                <div className="weekly-header">
                    <h2 className="section-title">
                        <span className="indicator bg-blue"></span>
                        Weekly Overview
                    </h2>

                    <div className="weekly-controls">
                        {/* Status Filter */}
                        <div className="filter-group">
                            {(['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'] as StatusFilterType[]).map((filter) => {
                                let activeClass = '';
                                if (statusFilter === filter) {
                                    if (filter === 'PENDING') activeClass = 'active-pending';
                                    else if (filter === 'CONFIRMED') activeClass = 'active-confirmed';
                                    else if (filter === 'COMPLETED') activeClass = 'active-completed';
                                    else if (filter === 'CANCELLED') activeClass = 'active-cancelled';
                                    else activeClass = 'active';
                                }

                                return (
                                    <button
                                        key={filter}
                                        onClick={() => setStatusFilter(filter)}
                                        className={`filter-btn ${activeClass}`}
                                    >
                                        {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {isLoadingBookings ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Updating dashboard...</p>
                    </div>
                ) : weeklyGridBookings.length === 0 ? (
                    <div className="empty-state">
                        <Calendar size={48} className="empty-icon" />
                        <p className="empty-text">No bookings found for this week</p>
                        <p className="empty-subtext">Try changing the filter or week</p>
                    </div>
                ) : (
                    <div className="bookings-grid">
                        {weeklyGridBookings.map(booking => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                showHallName={true}
                                onClick={() => {
                                    setSelectedBooking(booking);
                                    setIsModalOpen(true);
                                }}
                                onViewClick={() => {
                                    setSelectedBooking(booking);
                                    setIsModalOpen(true);
                                }}
                                onDeleteClick={() => handleDeleteBooking(booking.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {selectedBooking && (
                <BookingModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedBooking(null);
                    }}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setSelectedBooking(null);
                        // Refresh bookings
                        const formattedDate = format(currentWeekStart, 'yyyy-MM-dd');
                        bookingService.getAllBookings(formattedDate).then(setBookings);
                    }}
                    initialData={{
                        customerName: selectedBooking.customerName,
                        customerPhone: selectedBooking.customerPhone,
                        startDate: selectedBooking.startDate,
                        endDate: selectedBooking.endDate,
                        eventType: selectedBooking.eventType,
                        totalGuest: selectedBooking.totalGuest,
                        customerNote: selectedBooking.customerNote,
                        ownerNote: selectedBooking.ownerNote,
                        finalPrice: selectedBooking.finalPrice,
                        status: selectedBooking.status,
                    }}
                    mode="OWNER"
                    hallId={selectedBooking.hallId}
                    readOnly={true}
                    allowEdit={selectedBooking.endDate ? !isBefore(parseISO(selectedBooking.endDate), startOfDay(new Date())) : true}
                    bookingId={selectedBooking.id}
                />
            )}


            <style>{`
                /* Layout */
                .dashboard-container {
                    padding-top: 1rem;
                    padding-bottom: 1rem;
                    padding-left: 0.75rem;
                    padding-right: 0.75rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Header */
                .dashboard-header {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 1rem;
                }
                
                @media (min-width: 640px) {
                    .dashboard-header {
                        flex-direction: row;
                        justify-content: space-between;
                    }
                }

                .page-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #111827;
                    margin: 0;
                }

                .page-subtitle {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                    margin-bottom: 0;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .btn-with-icon {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .btn-text {
                    display: none;
                }
                
                @media (min-width: 640px) {
                    .btn-text {
                        display: inline;
                    }
                }

                .relative-container {
                    position: relative;
                }

                /* Dropdown */
                .dropdown-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 10;
                }

                .hall-dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0; /* Or left: 0 to align left, or transform to center */
                    left: 50%;
                    transform: translateX(-50%);
                    margin-top: 0.5rem;
                    width: 14rem;
                    background: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    border: 1px solid #f3f4f6;
                    z-index: 20;
                    max-height: 16rem;
                    overflow-y: auto;
                    padding: 0.25rem 0;
                }

                .dropdown-header {
                    padding: 0.5rem 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    background: #f9fafb;
                    letter-spacing: 0.05em;
                }

                .dropdown-item {
                    display: flex; /* Changed to flex for icon alignment */
                    align-items: center;
                    width: 100%;
                    text-align: left;
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                    color: #374151;
                    transition: all 0.15s;
                    cursor: pointer; /* Ensure pointer cursor */
                }

                .dropdown-item:hover {
                    background: #eff6ff;
                    color: #2563eb;
                }

                /* Stats Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                }

                @media (min-width: 0) {
                    .stats-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                
                @media (min-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(6, 1fr);
                    }
                }

                .stat-card {
                    background: white;
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    border: 1px solid #f3f4f6;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    transition: all 0.2s ease;
                }
                
                .stat-card.clickable {
                    cursor: pointer;
                }
                
                .stat-card.clickable:hover {
                    background: #f9fafb;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .stat-label {
                    color: #6b7280;
                    font-size: 0.75rem;
                    font-weight: 500;
                    margin: 0;
                    line-height: 1.2;
                }

                .stat-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0.25rem 0;
                    line-height: 1;
                }
                
                .stat-icon-small {
                    margin-top: 0.25rem;
                    opacity: 0.8;
                }

                .stat-value.text-blue-600 { color: #2563eb; }
                .stat-icon-small.text-blue-600 { color: #2563eb; }
                
                .stat-value.text-status-confirmed { color: #166534; }
                .stat-icon-small.text-status-confirmed { color: #166534; }

                .stat-value.text-status-available { color: var(--color-status-available); }
                .stat-icon-small.text-status-available { color: var(--color-status-available); }
                
                .stat-value.text-status-completed { color: #166534; }
                .stat-icon-small.text-status-completed { color: #166534; }
                
                .stat-value.text-amber { color: var(--color-status-pending); }
                .stat-icon-small.text-amber { color: var(--color-status-pending); }
                
                .stat-value.text-red { color: var(--color-status-error); }
                .stat-icon-small.text-red { color: var(--color-status-error); }


                /* Sections */
                .section-container {
                    margin-bottom: 1rem;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }
                
                .section-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #1f2937;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin: 0;
                }

                .indicator {
                    width: 0.5rem;
                    height: 1.5rem;
                    border-radius: 9999px;
                    display: block;
                }
                
                .indicator.bg-amber { background: var(--color-status-pending); }
                .indicator.bg-blue { background: var(--color-status-available); }

                .badge {
                    font-size: 0.75rem;
                    padding: 0.125rem 0.625rem;
                    border-radius: 9999px;
                    border: 1px solid;
                    margin-left: 0.5rem;
                }
                
                .badge.bg-amber {
                    background: #fff7ed;
                    color: #b45309;
                    border-color: #fed7aa;
                }

                /* Horizontal Scroll */
                .horizontal-scroll-container {
                    overflow-x: auto;
                    padding-bottom: 1rem;
                    margin: 0 -1rem; /* Negative margin to scroll edge-to-edge on mobile */
                    padding: 0 1rem 1rem 1rem;
                    /* Hide scrollbar */
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                .horizontal-scroll-container::-webkit-scrollbar {
                    display: none;
                }
                
                .horizontal-scroll-content {
                    display: flex;
                    gap: 1rem;
                }
                
                .scroll-item {
                    min-width: 300px;
                }
                
                @media (min-width: 768px) {
                    .horizontal-scroll-container {
                        margin: 0;
                        padding: 0 0 1rem 0;
                    }
                    .scroll-item {
                        min-width: 350px;
                    }
                }

                /* Weekly Grid Header */
                .weekly-header {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                
                @media (min-width: 768px) {
                    .weekly-header {
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                    }
                }

                .weekly-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                
                @media (min-width: 640px) {
                    .weekly-controls {
                        flex-direction: row;
                    }
                }

                /* Filter Group */
                .filter-group {
                    display: flex;
                    background: white;
                    padding: 0.25rem;
                    border-radius: 0.5rem;
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    overflow-x: auto;
                    justify-content: space-between;
                }
                
                .filter-btn {
                    padding: 0.375rem 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    border-radius: 0.375rem;
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                
                .filter-btn:hover {
                    background: #f3f4f6;
                    color: #374151;
                }
                
                .filter-btn.active {
                    background: #2563eb;
                    color: white;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }
                
                .filter-btn.active-pending {
                    background: #fff7ed;
                    color: #9a3412;
                    border: 1px solid #ffedd5;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }
                
                .filter-btn.active-confirmed {
                    background: #f0fdf4;
                    color: #166534;
                    border: 1px solid #dcfce7;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }
                
                .filter-btn.active-completed {
                    background: #166534;
                    color: white;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }
                
                .filter-btn.active-cancelled {
                    background: #fef2f2;
                    color: #991b1b;
                    border: 1px solid #fee2e2;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }

                /* Week Nav */
                .week-nav {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: white;
                    padding: 0.25rem;
                    border-radius: 0.5rem;
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    justify-content: space-between;
                }
                
                .nav-btn {
                    padding: 0.375rem 0.75rem;
                    border-radius: 0.375rem;
                    color: #4b5563;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.25rem;
                }
                
                .nav-text {
                    font-size: 0.80rem;
                    font-weight: 600;
                }
                
                .nav-btn:hover {
                    background: #f3f4f6;
                }
                
                .week-label {
                    font-size: 0.80rem;
                    font-weight: 600;
                    text-align: center;
                    color: #374151;
                }

                /* Bookings Grid */
                .bookings-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                
                @media (min-width: 768px) {
                    .bookings-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (min-width: 1024px) {
                    .bookings-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                /* Empty State */
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 2rem;
                    background: #f9fafb;
                    border-radius: 1rem;
                    border: 2px dashed #e5e7eb;
                    text-align: center;
                }
                
                .empty-icon {
                    color: #d1d5db;
                    margin-bottom: 1rem;
                }
                
                .empty-text {
                    font-size: 1.125rem;
                    font-weight: 500;
                    color: #6b7280;
                    margin: 0;
                }
                
                .empty-subtext {
                    font-size: 0.875rem;
                    color: #9ca3af;
                    margin-top: 0.25rem;
                }

                /* Loading State */
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 5rem 0;
                    color: #9ca3af;
                }
                
                .spinner {
                    width: 2rem;
                    height: 2rem;
                    border: 4px solid #3b82f6;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

            `}</style>
        </div>
    );
};
