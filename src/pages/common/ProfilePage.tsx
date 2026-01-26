import { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import type { User } from '../../types';
import { User as UserIcon, MapPin, Phone, Shield } from 'lucide-react';

export const ProfilePage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await authService.getProfile();
            setUser(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading profile...</div>;
    if (error) return <div className="container" style={{ padding: '2rem', color: 'red' }}>{error}</div>;
    if (!user) return <div className="container" style={{ padding: '2rem' }}>No user data found.</div>;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar-large">
                        <UserIcon size={48} />
                    </div>
                    <div>
                        <h1>{user.name}</h1>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                    </div>
                </div>

                <div className="profile-details">
                    <div className="detail-item">
                        <Phone size={20} className="icon-muted" />
                        <div>
                            <label>Phone</label>
                            <p>{user.phone}</p>
                        </div>
                    </div>

                    <div className="detail-item">
                        <Shield size={20} className="icon-muted" />
                        <div>
                            <label>Status</label>
                            <p className={user.status === 'ACTIVE' ? 'text-success' : 'text-error'}>
                                {user.status}
                            </p>
                        </div>
                    </div>

                    {user.address && (
                        <div className="detail-item">
                            <MapPin size={20} className="icon-muted" />
                            <div>
                                <label>Address</label>
                                <p>{user.address.address}</p>
                                <p>{user.address.city}, {user.address.state} - {user.address.zipcode}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .profile-card {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid var(--color-border);
                    max-width: 600px;
                    margin: 0 auto;
                    overflow: hidden;
                    box-shadow: var(--shadow-md);
                }
                .profile-header {
                    background: #f8f9fa;
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    border-bottom: 1px solid var(--color-border);
                }
                .avatar-large {
                    width: 80px;
                    height: 80px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--color-border);
                    color: var(--color-primary);
                }
                .profile-header h1 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.5rem;
                }
                .role-badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 99px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    background: #e2e8f0;
                    color: #475569;
                }
                .role-badge.owner { background: #dbeafe; color: #1e40af; }
                .role-badge.admin { background: #fee2e2; color: #991b1b; }
                
                .profile-details {
                    padding: 2rem;
                    display: grid;
                    gap: 1.5rem;
                }
                .detail-item {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                }
                .icon-muted { color: var(--color-text-muted); margin-top: 0.25rem; }
                .detail-item label {
                    display: block;
                    font-size: 0.875rem;
                    color: var(--color-text-muted);
                    margin-bottom: 0.25rem;
                }
                .detail-item p {
                    margin: 0;
                    font-weight: 500;
                    color: var(--color-text-main);
                }
                .text-success { color: #166534; }
                .text-error { color: #991b1b; }
            `}</style>
        </div>
    );
};
