import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const LandingPage = () => {
    const navigate = useNavigate();
    const [zipcode, setZipcode] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (zipcode.length >= 5) {
            navigate(`/halls?zipcode=${zipcode}`);
        }
    };

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Find the Perfect Shaadi Hall</h1>
                    <p>Book verified wedding venues directly from owners. Zero commission.</p>

                    <form onSubmit={handleSearch} className="search-box">
                        <div className="input-wrapper">
                            <MapPin className="icon" size={20} />
                            <input
                                type="text"
                                placeholder="Enter Zipcode (e.g. 110025)"
                                value={zipcode}
                                onChange={(e) => setZipcode(e.target.value)}
                                className="hero-input"
                            />
                        </div>
                        <Button type="submit" className="search-btn">
                            <Search size={18} style={{ marginRight: '8px' }} />
                            Search
                        </Button>
                    </form>
                </div>
            </section>

            {/* Features / Trust signals could go here */}

            <style>{`
        .landing-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .hero {
          background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2698&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          padding: 1rem;
        }
        .hero-content h1 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .hero-content p {
          font-size: 1.25rem;
          margin-bottom: 2.5rem;
          opacity: 0.9;
        }
        .search-box {
          background: white;
          padding: 0.5rem;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          max-width: 500px;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          padding-left: 1rem;
        }
        .icon {
          color: var(--color-text-muted);
          margin-right: 0.5rem;
        }
        .hero-input {
          border: none;
          outline: none;
          font-size: 1.1rem;
          width: 100%;
          color: var(--color-text-main);
        }
        .search-btn {
          border-radius: var(--radius-full) !important;
          padding-left: 1.5rem !important;
          padding-right: 1.5rem !important;
        }
      `}</style>
        </div>
    );
};
