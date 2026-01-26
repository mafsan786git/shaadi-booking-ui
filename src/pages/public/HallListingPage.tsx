import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Users, IndianRupee } from 'lucide-react';
import { hallService } from '../../services/hallService';
import type { Hall } from '../../types';
import { Button } from '../../components/common/Button';

export const HallListingPage = () => {
  const [searchParams] = useSearchParams();
  const zipcode = searchParams.get('zipcode');
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const [halls, setHalls] = useState<Hall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHalls = async () => {
      if (!zipcode) return;
      setIsLoading(true);
      try {
        const data = await hallService.getHallsByZipcode(zipcode);
        setHalls(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch halls. Please try again.');
        // Mock data for fallback dev experience if API fails
        /*
        setHalls([
           {
             hallId: '1',
             name: 'Grand Imperial Hall',
             address: { address: 'Plot 45', city: 'Delhi', state: 'DL', zipcode: '110025' },
             capacity: 500,
             basePrice: 50000,
             description: 'Luxury hall for grand weddings.',
             facilities: ['AC', 'Parking', 'WiFi'],
             contacts: [],
             lat: '0', lng: '0',
             status: 'ACTIVE',
             media: [{ id: 'm1', hallId: '1', type: 'IMAGE', driveUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', thumbnailUrl: '', sortOrder: 1 }]
           }
        ]);
        */
      } finally {
        setIsLoading(false);
      }
    };

    fetchHalls();
  }, [zipcode]);

  if (!zipcode) return <div className="container">Please provide a zipcode to search.</div>;

  return (
    <div className="container" style={{ paddingTop: '0.25rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1>Venues in {zipcode}</h1>
        <p className="text-muted">{halls.length} results found</p>
      </header>

      {isLoading && <p>Loading venues...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="hall-grid">
        {halls.filter(hall => !searchQuery || hall.name.toLowerCase().includes(searchQuery)).map((hall) => (
          <div key={hall.hallId} className="hall-card">
            <div className="hall-image">
              {hall.media?.[0] ? (
                <img src={hall.media[0].driveUrl} alt={hall.name} />
              ) : (
                <div className="placeholder-img">No Image</div>
              )}
            </div>
            <div className="hall-details">
              <h3>{hall.name}</h3>
              <p className="location">
                <MapPin size={14} /> {hall.address.city}, {hall.address.state}
              </p>

              <div className="hall-meta">
                <span><Users size={14} /> {hall.capacity} Guests</span>
                <span><IndianRupee size={14} /> {hall.basePrice.toLocaleString()} / day</span>
              </div>

              <div className="hall-actions">
                <Link to={`/hall/${hall.hallId}`}>
                  <Button variant="outline" style={{ width: '100%' }}>View Details</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .hall-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        .hall-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: white;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hall-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .hall-image {
          height: 200px;
          background: #f0f0f0;
        }
        .hall-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hall-details {
          padding: 1rem;
        }
        .hall-details h3 {
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
        }
        .location {
          color: var(--color-text-muted);
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }
        .hall-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .hall-meta span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .text-muted { color: var(--color-text-muted); }
        .error-text { color: var(--color-error); }
      `}</style>
    </div>
  );
};
