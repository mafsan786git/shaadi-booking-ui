import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/useAuthStore';
import { Button } from '../common/Button';
import { Home, User, LogOut } from 'lucide-react';

export const Navbar = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link to="/" className="brand">
                    Shaadi<span className="brand-accent">Booking</span>
                </Link>

                <div className="nav-links">
                    <Link to="/" className="nav-item">
                        <Home size={18} /> Home
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="nav-item">
                                <User size={18} /> Dashboard ({user?.name || 'User'})
                            </Link>
                            <Button variant="ghost" onClick={handleLogout} className="logout-btn">
                                <LogOut size={18} /> Logout
                            </Button>
                        </>
                    ) : (
                        <Link to="/auth">
                            <Button variant="primary">Login</Button>
                        </Link>
                    )}
                </div>
            </div>

            <style>{`
        .navbar {
          background: white;
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: var(--shadow-sm);
        }
        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }
        .brand {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-main);
          letter-spacing: -0.5px;
        }
        .brand-accent {
          color: var(--color-primary);
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: var(--color-text-muted);
          transition: color 0.2s;
        }
        .nav-item:hover {
          color: var(--color-primary);
        }
        .logout-btn {
          color: var(--color-text-muted);
          padding: 0.5rem;
        }
        .logout-btn:hover {
          color: var(--color-error);
          background: #fee2e2;
        }
      `}</style>
        </nav>
    );
};
