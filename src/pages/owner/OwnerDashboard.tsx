import { useEffect, useState } from 'react';
import { hallService } from '../../services/hallService';
import type { Hall } from '../../types';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
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
            await hallService.updateHallStatus(hallId, newStatus as any); // Type cast might be needed if strict
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
                            <div className="hall-header">
                                <h3>{hall.name}</h3>
                                {hall.status && (
                                    <span className={`status-badge ${hall.status.toLowerCase()}`}>
                                        {hall.status}
                                    </span>
                                )}
                            </div>

                            <div className="hall-facilities">
                                {hall.facilities?.map((facility, index) => (
                                    <span key={index} className="facility-tag">{facility}</span>
                                ))}
                            </div>

                            <div className="hall-details">
                                <p><strong>Location:</strong> {hall.address?.city || 'N/A'}, {hall.address?.state || 'N/A'}</p>
                                <p><strong>Contacts:</strong> {hall.contacts?.length ? hall.contacts.join(', ') : 'N/A'}</p>
                                <p><strong>Capacity:</strong> {hall.capacity} guests</p>
                            </div>

                            <div className="hall-actions">
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setHallToEdit(hall);
                                        setIsCreateModalOpen(true);
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant={hall.status === 'ACTIVE' ? 'outline' : 'success'}
                                    onClick={() => handleStatusChange(hall.hallId, hall.status || 'INACTIVE')}
                                >
                                    {hall.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => handleDelete(hall.hallId)}
                                >
                                    Delete
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
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                }
                .hall-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }
                .hall-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                }
                .status-badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .status-badge.active { background: #dcfce7; color: #166534; }
                .status-badge.inactive { background: #f3f4f6; color: #374151; }
                
                .hall-facilities {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                .facility-tag {
                    background: #eef2ff;
                    color: #4f46e5;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                }
                
                .hall-details {
                    margin-bottom: 1.5rem;
                    flex-grow: 1;
                }
                .hall-details p {
                    margin: 0.25rem 0;
                    color: #4b5563;
                    font-size: 0.95rem;
                }
                
                .hall-actions {
                    display: flex;
                    gap: 1rem;
                    border-top: 1px solid #f3f4f6;
                    padding-top: 1rem;
                }
                .hall-actions button {
                    flex: 1;
                }
            `}</style>
        </div>
    );
};
