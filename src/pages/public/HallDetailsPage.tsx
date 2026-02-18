import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { hallService } from '../../services/hallService';
import type { Hall } from '../../types';
import { Button } from '../../components/common/Button';
import { MapPin, Users, IndianRupee, CheckCircle, ChevronLeft } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

export const HallDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [hall, setHall] = useState<Hall | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchHall = async () => {
            if (!id) return;
            try {
                const data = await hallService.getHallById(id);
                setHall(data);
                if (data.media && data.media.length > 0) {
                    setActiveImage(data.media[0].driveUrl); // Or generic placeholder
                }
            } catch (error) {
                console.error(error);
                notificationService.error('Failed to load hall details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchHall();
    }, [id]);

    if (isLoading) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <p>Loading hall details...</p>
            </div>
        );
    }

    if (!hall) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>Hall not found</h2>
                <Link to="/halls" style={{ color: 'var(--color-primary)', marginTop: '1rem', display: 'inline-block' }}>
                    &larr; Back to Search
                </Link>
            </div>
        );
    }

    return (
        <div className="hall-details-page">
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/halls" className="back-link">
                        <ChevronLeft size={16} /> Back to Search
                    </Link>
                </div>

                {/* Hero / Gallery Section */}
                <div className="gallery-section">
                    <div className="main-image">
                        <img
                            src={activeImage || 'https://via.placeholder.com/800x500?text=No+Image'}
                            alt={hall.name}
                        />
                    </div>
                    {hall.media && hall.media.length > 0 && (
                        <div className="thumbnail-list">
                            {hall.media.map((media) => (
                                <button
                                    key={media.id}
                                    className={`input-thumbnail ${activeImage === media.driveUrl ? 'active' : ''}`}
                                    onClick={() => setActiveImage(media.driveUrl)}
                                >
                                    <img src={media.thumbnailUrl || media.driveUrl} alt="Thumbnail" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="details-grid">
                    {/* Main Info */}
                    <div className="info-column">
                        <h1 className="hall-title">{hall.name}</h1>
                        <p className="hall-location">
                            <MapPin size={18} /> {hall.address.address}, {hall.address.city}, {hall.address.state} - {hall.address.zipcode}
                        </p>

                        <div className="tags">
                            <span className="capacity-tag">
                                <Users size={16} /> Up to {hall.capacity} Guests
                            </span>
                            <span className="price-tag">
                                <IndianRupee size={16} /> ₹{hall.basePrice.toLocaleString()} / day
                            </span>
                        </div>

                        <div className="section">
                            <h3>About this Hall</h3>
                            <p className="description">{hall.description}</p>
                        </div>

                        <div className="section">
                            <h3>Amenities</h3>
                            <div className="amenities-grid">
                                {hall.facilities.map((text, idx) => (
                                    <div key={idx} className="amenity-item">
                                        <CheckCircle size={16} color="var(--color-primary)" />
                                        <span>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Booking / Action Sidebar */}
                    <div className="action-column">
                        <div className="booking-card">
                            <h3>Interested in this Hall?</h3>
                            <p className="subtext">Check availability or request a quote directly from the owner.</p>

                            <div className="price-summary">
                                <span className="label">Base Price</span>
                                <span className="value">₹{hall.basePrice.toLocaleString()}</span>
                            </div>

                            <Button onClick={() => notificationService.info('Availability Calendar coming soon!')} style={{ width: '100%', marginBottom: '1rem' }}>
                                Check Availability
                            </Button>

                            <Button variant="outline" onClick={() => notificationService.info('Contact feature coming soon!')} style={{ width: '100%' }}>
                                Contact Owner
                            </Button>

                            <p className="disclaimer">
                                * Final price may vary based on guest count and services.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hall-details-page {
                    padding-bottom: 4rem;
                }
                .breadcrumb {
                    padding: 0.25rem 0 1rem 0;
                }
                .back-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--color-text-muted);
                    font-size: 0.9rem;
                    transition: color 0.2s;
                }
                .back-link:hover {
                    color: var(--color-primary);
                }

                .gallery-section {
                    margin-bottom: 2rem;
                }
                .main-image {
                    width: 100%;
                    height: 400px;
                    background: #eee;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    margin-bottom: 1rem;
                }
                .main-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .thumbnail-list {
                    display: flex;
                    gap: 1rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }
                .input-thumbnail {
                    width: 80px;
                    height: 60px;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    cursor: pointer;
                    border: 2px solid transparent;
                    padding: 0;
                    background: none;
                }
                .input-thumbnail.active {
                    border-color: var(--color-primary);
                }
                .input-thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    gap: 2.5rem;
                }
                @media (max-width: 900px) {
                    .details-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .hall-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: var(--color-text-main);
                }
                .hall-location {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--color-text-muted);
                    margin-bottom: 1.5rem;
                }

                .tags {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }
                .capacity-tag, .price-tag {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .section {
                    margin-bottom: 2.5rem;
                }
                .section h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }
                .description {
                    line-height: 1.6;
                    color: var(--color-text-muted);
                }

                .amenities-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 1rem;
                }
                .amenity-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--color-text-main);
                }

                /* Action Column */
                .booking-card {
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    position: sticky;
                    top: 2rem;
                    box-shadow: var(--shadow-md);
                }
                .booking-card h3 {
                    margin-bottom: 0.5rem;
                }
                .booking-card .subtext {
                    font-size: 0.875rem;
                    color: var(--color-text-muted);
                    margin-bottom: 1.5rem;
                }
                .price-summary {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--color-border);
                }
                .price-summary .value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--color-primary);
                }
                .disclaimer {
                    font-size: 0.75rem;
                    color: var(--color-text-light);
                    margin-top: 1rem;
                    font-style: italic;
                }
            `}</style>
        </div>
    );
};
