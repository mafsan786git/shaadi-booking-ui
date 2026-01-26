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

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>My Halls</h2>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />New Hall
                </Button>
            </div>

            <CreateHallModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchHalls}
            />

            {halls.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '4rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <p>You haven't added any halls yet.</p>
                </div>
            ) : (
                <div className="hall-grid">
                    {halls.map(hall => (
                        <div key={hall.hallId} className="hall-card">
                            <div className="hall-info">
                                <h3>{hall.name}</h3>
                                <p>{hall.address.city}, {hall.address.state}</p>
                                <p>Capacity: {hall.capacity}</p>
                                <span className={`status-badge ${hall.status.toLowerCase()}`}>
                                    {hall.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .hall-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                .hall-card {
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .status-badge {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    border-radius: 999px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin-top: 1rem;
                }
                .status-badge.active {
                    background: #dcfce7;
                    color: #166534;
                }
            `}</style>
        </div>
    );
};
