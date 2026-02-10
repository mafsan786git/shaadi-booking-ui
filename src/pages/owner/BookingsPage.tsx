
import React, { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import type { Booking } from '../../types';
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { toast } from 'react-hot-toast';
import { BookingCard } from '../../components/common/BookingCard';
import { Button } from '../../components/common/Button';

export const BookingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday start

    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoadingBookings(true);
            try {
                // Pass current date string formatted as YYYY-MM-DD
                const formattedDate = format(currentWeekStart, 'yyyy-MM-dd');
                const allBookings = await bookingService.getAllBookings(formattedDate);
                setBookings(allBookings);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
                toast.error("Failed to load bookings");
            } finally {
                setIsLoadingBookings(false);
            }
        };

        fetchBookings();
    }, [currentWeekStart]);

    const handleWeekChange = (direction: 'prev' | 'next') => {
        setCurrentWeekStart(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
    };

    const weekStart = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

    const weeklyBookings = useMemo(() => {
        return bookings.filter(b => {
            if (!b.startDate) return false;
            try {
                const date = parseISO(b.startDate);
                // Check if within week range (inclusive)
                // isWithinInterval is useful but tricky with time.
                // Simple comparison since we have start/end of week.
                // Or just check if it falls in the week days.
                return date >= weekStart && date <= weekEnd;
            } catch { return false; }
        }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [bookings, weekStart, weekEnd]);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Weekly Bookings</h1>
                <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border">
                    <button onClick={() => handleWeekChange('prev')} className="p-1 hover:bg-gray-100 rounded">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold w-48 text-center">
                        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                    </span>
                    <button onClick={() => handleWeekChange('next')} className="p-1 hover:bg-gray-100 rounded">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {isLoadingBookings ? (
                <div className="text-center py-10">Loading bookings...</div>
            ) : weeklyBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 mt-8 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="text-gray-400 mb-6 text-lg">No bookings found for this week</div>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center"
                    >
                        <Plus size={18} className="mr-2" /> Request Booking
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {weeklyBookings.map(booking => (
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
    );
};
