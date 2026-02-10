import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../context/useAuthStore';
import { Button } from '../common/Button';
import { User, LogOut, Search, MapPin, LayoutDashboard, Building2, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, logout, isLoading, refreshProfile } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Derived state for zipcode logic
  const urlZipcode = searchParams.get('zipcode');
  const [searchValue, setSearchValue] = useState('');

  const isOwnerOrAdmin = user?.role === 'OWNER' || user?.role === 'ADMIN';

  useEffect(() => {
    setSearchValue('');
  }, [location.pathname, urlZipcode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigation = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const handleLogoClick = () => {
    if (urlZipcode) {
      if (location.pathname !== '/halls' || searchParams.get('zipcode') !== urlZipcode) {
        navigate(`/halls?zipcode=${urlZipcode}`);
      }
    } else {
      if (isOwnerOrAdmin) handleNavigation('/dashboard');
      else handleNavigation('/'); // Customer Fallback to Landing
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isHallListing = location.pathname.startsWith('/halls');

    if (isHallListing && urlZipcode) {
      navigate(`/halls?zipcode=${urlZipcode}&search=${searchValue}`);
    } else {
      if (searchValue.trim().length >= 5) {
        navigate(`/halls?zipcode=${searchValue}`);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">

        {/* LEFT SECTION: Logo + Location + Search Icon (Conditional) */}
        <div className="nav-left">
          <div className="brand" onClick={handleLogoClick}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '0.9', gap: '2px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Shaadi</span>
              <span className="brand-accent" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Booking</span>
            </div>
          </div>

          {isOwnerOrAdmin && (
            <button
              className="nav-search-icon-btn"
              onClick={() => navigate('/halls')}
              title="Search Halls"
            >
              <Search size={20} />
            </button>
          )}

          {urlZipcode && (
            <div className="location-badge">
              <MapPin size={16} className="text-primary" />
              <span>{urlZipcode}</span>
            </div>
          )}
        </div>

        {/* CENTER SECTION: Search Bar (Hidden for Owners/Admins) */}
        <div className="nav-center">
          {!isOwnerOrAdmin && location.pathname !== '/' && (
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder={location.pathname.startsWith('/halls') && urlZipcode ? "Search Hall Name..." : "Enter Zipcode"}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn-icon">
                <Search size={18} />
              </button>
            </form>
          )}
        </div>

        {/* RIGHT SECTION: Auth + Dashboard + Bookings/Halls */}
        <div className="nav-right">
          {/* Dashboard */}
          {isAuthenticated && (
            <div className="nav-item" title="Dashboard" onClick={() => {
              navigate(`/dashboard?refresh=${Date.now()}`);
            }}>
              <LayoutDashboard size={18} />
              <span className="nav-label">Dashboard</span>
            </div>
          )}

          {/* Bookings / Hall (Conditional) */}
          {isAuthenticated && (user?.role === 'OWNER' || user?.role === 'CUSTOMER') && (
            <div className="nav-item" title={user?.role === 'OWNER' ? "Hall Management" : "My Bookings"} onClick={() => {
              const path = user?.role === 'OWNER' ? `/hall?refresh=${Date.now()}` : '/bookings';
              navigate(path);
            }} style={{ cursor: 'pointer' }}>
              {user?.role === 'OWNER' ? <Building2 size={18} /> : <SlidersHorizontal size={18} />}
              <span className="nav-label">{user?.role === 'OWNER' ? 'Hall' : 'Bookings'}</span>
            </div>
          )}

          {/* Login / Profile */}
          {isLoading ? null : isAuthenticated ? (
            <div
              ref={profileRef}
              className="nav-item profile-action"
              style={{ position: 'relative', cursor: 'pointer' }}
              title="Profile Menu"
              onClick={() => {
                if (!isProfileOpen) {
                  refreshProfile();
                }
                setIsProfileOpen(!isProfileOpen);
              }}
            >
              <User size={20} />
              <span className="nav-label">{user?.name?.split(' ')[0]}</span>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div
                  className="profile-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="dropdown-item" onClick={() => {
                    setIsProfileOpen(false);
                    handleNavigation('/profile');
                  }}>
                    <User size={16} /> Profile
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item text-error" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </div>
                </div>
              )}
            </div>
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
                    z-index: 1000;
                    box-shadow: var(--shadow-sm);
                    height: 64px;
                    display: flex;
                    align-items: center;
                }
                .nav-content {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.5rem; /* Reduced gap */
                }
                
                /* Left Section */
                .nav-left {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-shrink: 0; /* Prevent shrinking too much */
                }
                .brand {
                    cursor: pointer;
                    font-weight: 700;
                    color: var(--color-text-main);
                    letter-spacing: -0.5px;
                }
                .brand-accent { color: var(--color-primary); }
                
                .location-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: var(--color-text-muted);
                    background: var(--color-background);
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                    white-space: nowrap; /* Prevent wrapping */
                }
                .text-primary { color: var(--color-primary); }

                /* Center Section */
                .nav-center {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    min-width: 0; /* Allow shrinking */
                }
                .search-form {
                    width: 100%;
                    max-width: 500px;
                    display: flex;
                    align-items: center;
                    background: #f1f5f9;
                    border-radius: 99px;
                    padding: 0.25rem 0.25rem 0.25rem 0.75rem;
                    transition: box-shadow 0.2s;
                }
                .nav-search-icon-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.5rem;
                    color: var(--color-text-muted);
                    border-radius: 50%;
                    transition: all 0.2s;
                    margin-left: 0.5rem;
                }
                .nav-search-icon-btn:hover {
                    background: var(--color-background);
                    color: var(--color-primary);
                }
                .search-form:focus-within {
                    box-shadow: 0 0 0 2px var(--color-primary-light);
                    background: white;
                    border: 1px solid var(--color-primary);
                }
                .search-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 0.9rem;
                    padding: 0.25rem;
                    min-width: 0; /* specific for flex child */
                }
                .search-btn-icon {
                    border: none;
                    background: var(--color-primary);
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                }

                /* Right Section */
                .nav-right {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    justify-content: flex-end;
                    flex-shrink: 0;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.4rem 0.75rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .nav-item:hover {
                    background: #f1f5f9;
                }
                .icon-btn-ghost {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.25rem;
                    color: var(--color-text-muted);
                    margin-left: 0.25rem;
                    border-radius: 50%;
                }
                .icon-btn-ghost:hover {
                    background: #fee2e2;
                    color: var(--color-error);
                }

                /* Make labels visible but better styled for mobile */
                .nav-label {
                   font-size: 0.75rem;
                   white-space: nowrap;
                }

                @media (min-width: 768px) {
                    .nav-content { gap: 1rem; }
                    .nav-left { gap: 1.5rem; min-width: 150px; }
                    .nav-right { gap: 1.5rem; min-width: 150px; }
                    /* .nav-label { font-size: 1rem; }  Default is inherited/normal */
                    .search-form { padding: 0.25rem 0.5rem 0.25rem 1rem; }
                    .search-btn-icon { width: 32px; height: 32px; }
                }
                
                @media (max-width: 768px) {
                     /* Mobile adjustments to fit everything */
                    .nav-left .brand span { font-size: 1rem !important; }
                    .nav-left .brand .brand-accent { font-size: 0.8rem !important; }
                    
                    .nav-right {
                       gap: 0.5rem;
                    }
                    .nav-item {
                        flex-direction: column;
                        gap: 0;
                        align-items: center;
                        text-align: center;
                    }
                    .nav-label {
                        font-size: 0.65rem;
                        line-height: 1;
                        margin-top: 2px;
                    }
                    .profile-action {
                        flex-direction: column;
                        gap: 0;
                    }
                    .profile-action span {
                        font-size: 0.65rem;
                        max-width: 50px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        margin-left: 0 !important; 
                    }
                }

                .profile-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 0.5rem;
                    background: white;
                    border: 1px solid var(--color-border);
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    min-width: 150px;
                    z-index: 1001;
                    overflow: hidden;
                }
                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    font-size: 0.9rem;
                    color: var(--color-text-main);
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .dropdown-item:hover {
                    background: var(--color-background);
                }
                .dropdown-divider {
                    height: 1px;
                    background: var(--color-border);
                }
                .text-error { color: var(--color-error); }
                .text-error:hover { background: #fee2e2; }
            `}</style>
    </nav>
  );
};
