import { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import type { User } from '../../types';
import { toast } from 'react-hot-toast';

export const UserManagementPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllOwners();
            setUsers(data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (user: User) => {
        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        // Optimistic update
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));

        try {
            await userService.updateUserStatus(user, newStatus);
            toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
        } catch (error) {
            // Revert on failure
            setUsers(users.map(u => u.id === user.id ? { ...u, status: user.status } : u));
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <h2>User Management (Owners)</h2>
            <div className="table-responsive">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Mobile</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.phone}</td>
                                <td>
                                    <span className={`status-badge ${user.status.toLowerCase()}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={user.status === 'ACTIVE'}
                                            onChange={() => handleStatusToggle(user)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .table-responsive {
                    overflow-x: auto;
                    margin-top: 1.5rem;
                }
                .user-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .user-table th, .user-table td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                }
                .user-table th {
                    background: #f8f9fa;
                    font-weight: 600;
                }
                .status-badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 999px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                .status-badge.active {
                    background: #dcfce7;
                    color: #166534;
                }
                .status-badge.inactive {
                    background: #fee2e2;
                    color: #991b1b;
                }

                /* Toggle Switch */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 40px;
                    height: 24px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .4s;
                }
                input:checked + .slider {
                    background-color: #2196F3;
                }
                input:focus + .slider {
                    box-shadow: 0 0 1px #2196F3;
                }
                input:checked + .slider:before {
                    transform: translateX(16px);
                }
                .slider.round {
                    border-radius: 34px;
                }
                .slider.round:before {
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
};
