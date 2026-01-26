import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useHallStore } from '../../context/useHallStore';
import type { Hall } from '../../types';
import { toast } from 'react-hot-toast';
import { Plus, Trash, MapPin, Users, ListOrdered } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { CreateHallModal } from '../../components/owner/CreateHallModal';

export const OwnerDashboard = () => {
    const { halls, isLoading, fetchHalls, updateHallStatus, setSelectedHallId } = useHallStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [hallToEdit, setHallToEdit] = useState<Hall | null>(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // fetchHalls handles silent background updates if already loaded
        fetchHalls();
    }, [searchParams.get('refresh'), fetchHalls]);

    const handleCreateNew = () => {
        setHallToEdit(null);
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

    const handleDelete = async (hallId: string) => {
        if (!window.confirm('Are you sure you want to delete this hall?')) return;

        try {
            await updateHallStatus(hallId, 'DELETED');
            toast.success('Hall deleted successfully');
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
            />

            {activeHalls.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '4rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <p>You haven't added any halls yet.</p>
                </div>
            ) : (
                <div className="hall-grid">
                    {activeHalls.map(hall => (
                        <div key={hall.hallId} className="hall-card">
                            <div className="card-clickable-area" onClick={() => {
                                setSelectedHallId(hall.hallId);
                                navigate(`/hall/availability`);
                            }}>
                                <div className="card-top-row">
                                    <div className="status-container">
                                        <span className={`status-badge ${hall.status?.toLowerCase() || 'inactive'}`}>
                                            {hall.status}
                                        </span>
                                    </div>
                                    <button
                                        className="delete-icon-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(hall.hallId);
                                        }}
                                        title="Delete Hall"
                                    >
                                        <Trash size={20} />
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
                                    variant={hall.status === 'ACTIVE' ? 'outline' : 'success'}
                                    onClick={() => handleStatusChange(hall.hallId, hall.status || 'INACTIVE')}
                                    className="action-btn"
                                >
                                    {hall.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setHallToEdit(hall);
                                        setIsCreateModalOpen(true);
                                    }}
                                    className="action-btn"
                                >
                                    Edit
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
                .status-badge.inactive { background: #f3f4f6; color: #374151; }
                
                .delete-icon-btn {
                    background: none;
                    border: none;
                    color: #ef4444;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 50%;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .delete-icon-btn:hover {
                    background: #fee2e2;
                }
                
                .card-content {
                    padding: 0.5rem 1.5rem 1.5rem 1.5rem;
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
                    padding: 1rem;
                    background: #f9fafb;
                    border-top: 1px solid #f3f4f6;
                    gap: 1rem;
                }
                .action-btn {
                    padding: 0.4rem 1rem;
                    font-size: 0.9rem;
                }
                .card-clickable-area {
                    cursor: pointer;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                }
                .card-clickable-area:hover .hall-name {
                    color: #2563eb;
                }
            `}</style>
        </div>
    );
};
