import { useAuthStore } from '../../context/useAuthStore';
import { OwnerDashboard } from '../owner/OwnerDashboard';
import { BookingsPage } from '../owner/BookingsPage';
import { UserManagementPage } from '../admin/UserManagementPage';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const DashboardPage = () => {
    const { user, isLoading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/auth');
        }
    }, [isLoading, user, navigate]);

    if (isLoading) return <div className="container" style={{ padding: '2rem' }}>Loading dashboard...</div>;
    if (!user) return null;

    if (user.role === 'ADMIN') {
        return <UserManagementPage />;
    }

    if (user.role === 'OWNER') {
        return <BookingsPage />;
    }

    if (user.role === 'CUSTOMER') {
        // Did the user want a customer dashboard? 
        // "Dashboard (based on role it should referesh if we click everytime)"
        // "if role is CUSTOMER show bookings only but it will fetch sutomer bookings"
        // Let's redirect to bookings if customer, or just show a placeholder?
        // Navbar links "Bookings" separately.
        // Navbar Home button for customer goes to `/halls`.
        // Let's show a simple Customer Dashboard or redirect.
        return (
            <div className="container" style={{ padding: '2rem' }}>
                <h1>Welcome, {user.name}</h1>
                <p>Use the search bar to find venues or view your bookings.</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <h1>Dashboard</h1>
            <p>Role: {user.role}</p>
        </div>
    );
};
