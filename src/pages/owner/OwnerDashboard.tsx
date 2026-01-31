import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useHallStore } from '../../context/useHallStore';
import type { Hall } from '../../types';
import { toast } from 'react-hot-toast';
import { Plus, MapPin, Users, ListOrdered } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { CreateHallModal } from '../../components/owner/CreateHallModal';

export const OwnerDashboard = () => {
    const { halls, isLoading, fetchHalls, updateHallStatus, setSelectedHallId } = useHallStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [hallToEdit, setHallToEdit] = useState<Hall | null>(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // fetchHalls handles silent background updates if already loaded
        fetchHalls();
    }, [searchParams.get('refresh'), fetchHalls]);

    const handleCreateNew = () => {
        setHallToEdit(null);
        setIsViewMode(false);
        setIsCreateModalOpen(true);
    };

    const handleStatusChange = async (hallId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await updateHallStatus(hallId, newStatus as any);
            toast.success(`Hall ${newStatus.toLowerCase()}d successfully`);
        } catch (error) {
            // Error handled in store
        }
    };



    // Only show full-page loading if it's the very first load and we're currently fetching
    if (isLoading && halls.length === 0) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            Loading...
        </div>
    );

    const activeHalls = halls.filter(h => h.status !== 'DELETED');

    return (
        <div className="container" style={{ paddingTop: '0.25rem', paddingBottom: '0.5rem' }}>
            <div className="dashboard-header">
                <Button variant="outline" onClick={() => { }} style={{ padding: '0.25rem 0.5rem', height: 'auto', border: '1px solid #e2e8f0' }}>
                    <ListOrdered size={16} style={{ marginRight: '0.4rem' }} />Filter
                </Button>

                <div className="header-action-right">
                    <Button variant="primary" onClick={handleCreateNew} style={{ whiteSpace: 'nowrap', padding: '0.25rem 0.75rem' }}>
                        <Plus size={18} style={{ marginRight: '0.25rem', flexShrink: 0 }} />Add
                    </Button>
                </div>
            </div>

            <CreateHallModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => fetchHalls(true)}
                hallToEdit={hallToEdit}
                initialViewMode={isViewMode}
            />

            {activeHalls.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '4rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <p>You haven't added any halls yet.</p>
                </div>
            ) : (
                <div className="hall-grid">
                    {activeHalls.map(hall => (
                        <div key={hall.hallId} className="hall-card">
                            <div className="card-info-area">
                                <div className="card-top-row">
                                    <div className="status-container">
                                        <span className={`status-badge ${hall.status?.toLowerCase() || 'inactive'}`}>
                                            {hall.status}
                                        </span>
                                    </div>
                                    <button
                                        className="view-icon-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setHallToEdit(hall);
                                            setIsViewMode(true);
                                            setIsCreateModalOpen(true);
                                        }}
                                        title="View Details"
                                    >
                                        View
                                    </button>
                                </div>

                                <div className="card-content">
                                    <h3 className="hall-name">{hall.name}</h3>

                                    <div className="hall-facilities">
                                        {hall.facilities?.map((facility, index) => (
                                            <span key={index} className="facility-tag">{facility}</span>
                                        ))}
                                    </div>

                                    <div className="hall-info-row">
                                        <MapPin size={16} className="info-icon" />
                                        <span>{hall.address?.city || 'N/A'}, {hall.address?.state || 'N/A'}</span>
                                    </div>
                                    <div className="hall-info-row">
                                        <Users size={16} className="info-icon" />
                                        <span>{hall.capacity} guests</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-bottom-row">
                                <Button
                                    variant="outline"
                                    onClick={() => handleStatusChange(hall.hallId, hall.status || 'INACTIVE')}
                                    className={`action-btn ${hall.status === 'ACTIVE' ? 'btn-deactivate' : 'btn-activate'}`}
                                >
                                    {hall.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setSelectedHallId(hall.hallId);
                                        navigate(`/hall/availability`);
                                    }}
                                    className="action-btn"
                                    disabled={hall.status !== 'ACTIVE'}
                                    title={hall.status !== 'ACTIVE' ? "Activate hall to request bookings" : ""}
                                >
                                    Request Booking
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )
            }

            <style>{`
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                    padding-bottom: 0.25rem;
                    min-height: 40px;
                }
                /* Removed unnecessary classes */
                .hall-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                }
                .hall-card {
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .hall-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
                }
                
                .card-top-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 1rem 1rem 0.5rem 1rem;
                }
                
                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .status-badge.active { background: #dcfce7; color: #166534; }
                .status-badge.inactive { background: #fee2e2; color: #dc2626; }
                
                
                .view-icon-btn {
                    background: white;
                    border: 1px solid #3b82f6;
                    color: #2563eb;
                    cursor: pointer;
                    padding: 0.25rem 0.75rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .view-icon-btn:hover {
                    background: #f3f4f6;
                    color: #111827;
                    border-color: #d1d5db;
                }
                
                .card-content {
                    padding: 0.5rem 1rem 0.5rem 1rem;
                    flex-grow: 1;
                }
                
                .hall-name {
                    margin: 0 0 0.75rem 0;
                    font-size: 1.35rem;
                    color: #111827;
                }
                
                .hall-facilities {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                .facility-tag {
                    background: #f3f4f6;
                    color: #4b5563;
                    padding: 0.2rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                
                .hall-info-row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    color: #6b7280;
                    font-size: 0.9rem;
                }
                .info-icon {
                    color: #9ca3af;
                }
                
                .card-bottom-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.75rem;
                    background: #f9fafb;
                    border-top: 1px solid #f3f4f6;
                    gap: 1rem;
                }
                .action-btn {
                    padding: 0.3rem 0.75rem;
                    font-size: 0.9rem;
                }
                .btn-deactivate {
                    border-color: #fecaca !important;
                    color: #ef4444 !important;
                    background: white !important;
                }
                .btn-deactivate:hover {
                    background: #fee2e2 !important;
                }
                .btn-activate {
                    border-color: #86efac !important;
                    color: #16a34a !important;
                    background: white !important;
                }
                .btn-activate:hover {
                    background: #dcfce7 !important;
                }
                .card-info-area {
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                }
            `}</style>
        </div >
    );
};
