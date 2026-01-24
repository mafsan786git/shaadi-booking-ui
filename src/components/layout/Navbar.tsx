import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/useAuthStore';
import { Button } from '../common/Button';
import { Home, User, LogOut, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, isLoading } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on navigation or resize
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    logout();
    closeSidebar();
    navigate('/auth');
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) closeSidebar();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="brand" onClick={closeSidebar}>
          Shaadi<span className="brand-accent">Booking</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links desktop-only">
          <Link to="/" className="nav-item">
            <Home size={18} /> Home
          </Link>

          {isLoading ? null : isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-item">
                <User size={18} /> Profile
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

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />

      {/* Mobile Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="brand">
            Shaadi<span className="brand-accent">Booking</span>
          </span>
          <button onClick={closeSidebar}><X size={24} /></button>
        </div>

        <div className="sidebar-links">
          <Link to="/" className="sidebar-item" onClick={closeSidebar}>
            <Home size={20} /> Home
          </Link>

          {isLoading ? null : isAuthenticated ? (
            <>
              <Link to="/dashboard" className="sidebar-item" onClick={closeSidebar}>
                <User size={20} /> Profile
              </Link>
              <button className="sidebar-item logout" onClick={handleLogout}>
                <LogOut size={20} /> Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="sidebar-item active-btn" onClick={closeSidebar}>
              <Button variant="primary" style={{ width: '100%' }}>Login</Button>
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
          z-index: 1000;
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
        .desktop-only {
          display: none;
        }
        @media (min-width: 769px) {
          .desktop-only {
            display: flex;
          }
          .mobile-toggle {
            display: none;
          }
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

        /* Mobile Sidebar */
        .mobile-toggle {
          color: var(--color-text-main);
          padding: 0.5rem;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0;
          visibility: hidden;
          transition: 0.3s;
          z-index: 1100;
        }
        .sidebar-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .sidebar {
          position: fixed;
          top: 0;
          right: -280px;
          width: 280px;
          height: 100%;
          background: white;
          transition: 0.3s ease-in-out;
          z-index: 1200;
          padding: 1.5rem;
          box-shadow: -4px 0 15px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
        }
        .sidebar.open {
          right: 0;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
        }

        .sidebar-links {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-text-main);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          transition: 0.2s;
        }
        .sidebar-item:hover {
          background: var(--color-background);
          color: var(--color-primary);
        }
        .sidebar-item.logout {
          margin-top: auto;
          color: var(--color-error);
        }
        .sidebar-item.logout:hover {
          background: #fee2e2;
        }
        .active-btn {
          padding: 0;
        }
      `}</style>
    </nav>
  );
};
