import React, { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, XCircle, Plus, Building2, Filter, AlertCircle, Clock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import type { Booking, BookingStatus } from '../../types';
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameWeek } from 'date-fns';
import { toast } from 'react-hot-toast';
import { BookingCard } from '../../components/common/BookingCard';
import { Button } from '../../components/common/Button';
import { useHallStore } from '../../context/useHallStore';

type StatusFilterType = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export const BookingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { halls, fetchHalls } = useHallStore();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday start
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');
    const [isHallDropdownOpen, setIsHallDropdownOpen] = useState(false);

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
                toast.error("Failed to load dashboard data");
            } finally {
                setIsLoadingBookings(false);
            }
        };

        loadData();
    }, [currentWeekStart, searchParams.get('refresh')]);

    const handleWeekChange = (direction: 'prev' | 'next') => {
        setCurrentWeekStart(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
    };

    const weekStart = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

    // --- Computed Data ---

    // 1. Pending Requests (Always visible, unfiltered by week)
    const pendingRequests = useMemo(() => {
        return bookings.filter(b => b.status === 'REQUESTED' || b.status === 'OWNER_RESPONDED')
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [bookings]);

    // 2. Summary Stats (Based on ALL bookings or relevant window? Let's use All Upcoming + This Month context)
    const stats = useMemo(() => {
        const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
        const pending = pendingRequests.length;
        // For "This Week", we calculate based on the current week start
        const thisWeekCount = bookings.filter(b => {
            if (!b.startDate) return false;
            const start = parseISO(b.startDate);
            return start >= weekStart && start <= weekEnd;
        }).length;

        return { confirmed, pending, thisWeekCount };
    }, [bookings, pendingRequests, weekStart, weekEnd]);


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
            if (statusFilter === 'CANCELLED') return b.status === 'CANCELLED_BY_OWNER' || b.status === 'CANCELLED_BY_CUSTOMER' || b.status === 'DECLINED_BY_OWNER' || b.status === 'REJECTED_BY_CUSTOMER';

            return true;
        }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [bookings, weekStart, weekEnd, statusFilter]);


    const handleRequestBooking = (hallId?: string) => {
        setIsHallDropdownOpen(false);
        // Navigate to availability page for the specific hall
        if (hallId) {
            navigate(`/hall/availability?hallId=${hallId}`);
        } else if (halls.length === 1) {
            navigate(`/hall/availability?hallId=${halls[0].hallId}`);
        } else {
            // If multiple halls and no selection (shouldn't happen with dropdown), fallback
            navigate('/hall');
            toast('Please select a hall to request booking');
        }
    };


    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                {/* <div>
                    <h3 className="page-title">Owner Dashboard</h3>
                </div> */}
                <div className="header-actions">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/hall')}
                        className="btn-with-icon"
                    >
                        <Building2 size={18} />
                        <span className="btn-text">Manage Halls</span>
                    </Button>

                    <div className="relative-container">
                        <Button
                            variant="primary"
                            onClick={() => {
                                if (halls.length > 1) setIsHallDropdownOpen(!isHallDropdownOpen);
                                else handleRequestBooking();
                            }}
                            className="btn-with-icon"
                        >
                            <Plus size={18} />
                            <span>Request Booking</span>
                        </Button>

                        {/* Hall Selection Dropdown */}
                        {isHallDropdownOpen && halls.length > 1 && (
                            <>
                                <div
                                    className="dropdown-overlay"
                                    onClick={() => setIsHallDropdownOpen(false)}
                                />
                                <div className="dropdown-menu">
                                    <div className="dropdown-header">
                                        Select Hall
                                    </div>
                                    {halls.map(hall => (
                                        <button
                                            key={hall.hallId}
                                            onClick={() => handleRequestBooking(hall.hallId)}
                                            className="dropdown-item"
                                        >
                                            {hall.name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Stats Row */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon bg-amber">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <p className="stat-label">Pending Requests</p>
                        {/* <p className="stat-value text-amber">{stats.pending}</p> */}
                    </div>
                    <div>
                        {/* <p className="stat-label">Pending Requests</p> */}
                        <p className="stat-value text-amber">{stats.pending}</p>
                    </div>

                </div>

                <div className="stat-card">
                    <div className="stat-icon bg-emerald">
                        <CheckCircle size={18} />
                    </div>
                    <div>
                        <p className="stat-label">Total Confirmed</p>
                        {/* <p className="stat-value text-emerald">{stats.confirmed}</p> */}
                    </div>
                    <div>
                        {/* <p className="stat-label">Total Confirmed</p> */}
                        <p className="stat-value text-emerald">{stats.confirmed}</p>
                    </div>

                </div>

                <div className="stat-card">
                    <div className="stat-icon bg-blue">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <p className="stat-label">This Week</p>
                        {/* <p className="stat-value text-blue">{stats.thisWeekCount}</p> */}
                    </div>
                    <div>
                        {/* <p className="stat-label">This Week</p> */}
                        <p className="stat-value text-blue">{stats.thisWeekCount}</p>
                    </div>

                </div>
            </div>

            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="indicator bg-amber"></span>
                            Action Required
                            <span className="badge bg-amber">
                                {pendingRequests.length} Pending
                            </span>
                        </h2>
                    </div>

                    <div className="horizontal-scroll-container">
                        <div className="horizontal-scroll-content">
                            {pendingRequests.map(booking => (
                                <div key={booking.id} className="scroll-item">
                                    <BookingCard
                                        booking={booking}
                                        showHallName={true}
                                        onClick={() => navigate(`/hall/availability?hallId=${booking.hallId}&month=${format(parseISO(booking.startDate), 'yyyy-MM')}`)}
                                        onViewClick={(e) => navigate(`/hall/availability?hallId=${booking.hallId}&month=${format(parseISO(booking.startDate), 'yyyy-MM')}`)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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
                            {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as StatusFilterType[]).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`filter-btn ${statusFilter === filter ? 'active' : ''}`}
                                >
                                    {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>

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
                                onClick={() => navigate(`/hall/availability?hallId=${booking.hallId}&month=${format(parseISO(booking.startDate), 'yyyy-MM')}`)}
                                onViewClick={(e) => navigate(`/hall/availability?hallId=${booking.hallId}&month=${format(parseISO(booking.startDate), 'yyyy-MM')}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                /* Layout */
                .dashboard-container {
                    padding: 0.5rem 0.5rem;
                    padding-bottom: 1rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Header */
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 1.5rem;
                    margin-top: 0.5rem;
                    gap: 1rem;
                }
                
                @media (min-width: 768px) {
                    .dashboard-header {
                        flex-direction: column;
                        align-items: flex-start;
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

                .dropdown-menu {
                    position: absolute;
                    right: 0;
                    top: 100%;
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
                    display: block;
                    width: 100%;
                    text-align: left;
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                    color: #374151;
                    transition: all 0.15s;
                }

                .dropdown-item:hover {
                    background: #eff6ff;
                    color: #2563eb;
                }

                /* Stats Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0.5rem;
                    margin-bottom: 01rem;
                }

                @media (min-width: 768px) {
                    .stats-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                .stat-card {
                    background: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.75rem;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    border: 1px solid #f3f4f6;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .stat-label {
                    color: #6b7280;
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin: 0;
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0.25rem 0 0 0;
                }

                .stat-icon {
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stat-value.text-amber { color: #d97706; }
                .stat-icon.bg-amber { background: #fffbeb; color: #d97706; }
                
                .stat-value.text-emerald { color: #059669; }
                .stat-icon.bg-emerald { background: #ecfdf5; color: #059669; }

                .stat-value.text-blue { color: #2563eb; }
                .stat-icon.bg-blue { background: #eff6ff; color: #2563eb; }

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
                
                .indicator.bg-amber { background: #f59e0b; }
                .indicator.bg-blue { background: #3b82f6; }

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
                    background: #111827;
                    color: white;
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
                    width: 9rem;
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
