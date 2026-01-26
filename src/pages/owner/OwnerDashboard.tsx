import { useEffect, useState } from 'react';
import { hallService } from '../../services/hallService';
import type { Hall } from '../../types';
import { toast } from 'react-hot-toast';
import { Plus, Trash, MapPin, Users } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { CreateHallModal } from '../../components/owner/CreateHallModal';

export const OwnerDashboard = () => {
    const [halls, setHalls] = useState<Hall[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [hallToEdit, setHallToEdit] = useState<Hall | null>(null);

    useEffect(() => {
        fetchHalls();
    }, []);

    const fetchHalls = async () => {
        try {
            const data = await hallService.getOwnerHalls();
            setHalls(data);
        } catch (error) {
            toast.error('Failed to fetch halls');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setHallToEdit(null);
        setIsCreateModalOpen(true);
    };

    const handleStatusChange = async (hallId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await hallService.updateHallStatus(hallId, newStatus as any);
            toast.success(`Hall ${newStatus.toLowerCase()}d successfully`);
            fetchHalls();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (hallId: string) => {
        if (!window.confirm('Are you sure you want to delete this hall?')) return;

        try {
            await hallService.updateHallStatus(hallId, 'DELETED');
            toast.success('Hall deleted successfully');
            fetchHalls();
        } catch (error) {
            toast.error('Failed to delete hall');
        }
    };

    if (loading) return <div>Loading...</div>;

    const activeHalls = halls.filter(h => h.status !== 'DELETED');

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>My Halls</h2>
                <Button variant="primary" onClick={handleCreateNew}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />New Hall
                </Button>
            </div>

            <CreateHallModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchHalls}
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
                            <div className="card-top-row">
                                <div className="status-container">
                                    <span className={`status-badge ${hall.status?.toLowerCase() || 'inactive'}`}>
                                        {hall.status}
                                    </span>
                                </div>
                                <button
                                    className="delete-icon-btn"
                                    onClick={() => handleDelete(hall.hallId)}
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
                    padding: 1rem 1.5rem;
                    background: #f9fafb;
                    border-top: 1px solid #f3f4f6;
                    gap: 1rem;
                }
                .action-btn {
                    padding: 0.4rem 1rem;
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
};
