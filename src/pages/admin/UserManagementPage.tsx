import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { userService } from '../../services/userService';
import type { CreateUserRequest } from '../../services/userService';
import type { User, UserStatus, Role } from '../../types';
import { notificationService } from '../../services/notificationService';
import { validateMobile, sanitizeMobileInput } from '../../utils/validation';

// ─── Types ───────────────────────────────────────────────────────────────────

type ModalMode = 'create' | 'edit';

const EMPTY_FORM: CreateUserRequest = {
    phone: '',
    name: '',
    role: 'OWNER',
    status: 'ACTIVE',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    lat: 0,
    lng: 0,
};

// ─── Component ───────────────────────────────────────────────────────────────

export const UserManagementPage = () => {
    const location = useLocation();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<CreateUserRequest>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [location.key]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getAllOwners();
            setUsers(data);
        } catch {
            notificationService.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    // ── Status toggle ──────────────────────────────────────────────────────
    const handleStatusToggle = async (user: User) => {
        const newStatus: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        try {
            await userService.updateUserStatus(user, newStatus);
            notificationService.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
        } catch {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: user.status } : u));
            notificationService.error('Failed to update status');
        }
    };

    // ── Modal helpers ──────────────────────────────────────────────────────
    const openCreateModal = () => {
        setModalMode('create');
        setEditingUser(null);
        setFormData(EMPTY_FORM);
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setModalMode('edit');
        setEditingUser(user);
        setFormData({
            phone: user.phone,
            name: user.name,
            role: user.role,
            status: user.status,
            address: user.address?.address || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            zipcode: user.address?.zipcode || '',
            lat: 0,
            lng: 0,
        });
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    // ── Form change ────────────────────────────────────────────────────────
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const sanitized = name === 'phone' ? sanitizeMobileInput(value) : value;
        setFormData(prev => ({ ...prev, [name]: sanitized }));
    };

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateMobile(formData.phone)) {
            notificationService.error('Please enter a valid 10-digit mobile number (starting with 1-9)');
            return;
        }
        setSubmitting(true);
        try {
            if (modalMode === 'create') {
                await userService.createUser(formData);
                notificationService.success('User created successfully');
                // Refresh list from server to get full user objects with IDs
                await fetchUsers();
            } else if (editingUser) {
                await userService.updateUser(editingUser.id, formData);
                // Manually merge since backend may return a flat shape without nested address
                const merged: User = {
                    ...editingUser,
                    name: formData.name,
                    phone: formData.phone,
                    role: formData.role,
                    status: formData.status,
                    address: {
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        zipcode: formData.zipcode,
                    },
                };
                setUsers(prev => prev.map(u => u.id === editingUser.id ? merged : u));
                notificationService.success('User updated successfully');
            }
            closeModal();
        } catch {
            notificationService.error(modalMode === 'create' ? 'Failed to create user' : 'Failed to update user');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────
    if (loading) return <div style={{ padding: '2rem', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Loading...</div>;

    return (
        <div className="container um-page">
            {/* Header */}
            <div className="um-header">
                <div>
                    <h1 className="um-title">User Management</h1>
                    <p className="um-subtitle">Manage owners and their account status</p>
                </div>
                <button id="create-user-btn" className="um-btn-primary" onClick={openCreateModal}>
                    + Create User
                </button>
            </div>

            {/* Table */}
            <div className="um-card">
                <table className="um-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Mobile</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Active</th>
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="um-empty">No users found</td>
                            </tr>
                        ) : users.map(user => (
                            <tr key={user.id}>
                                <td className="um-name">{user.name || '—'}</td>
                                <td>{user.phone}</td>
                                <td>
                                    <span className={`um-role-badge um-role-${user.role.toLowerCase()}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`um-status-badge um-status-${user.status.toLowerCase()}`}>
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
                                <td>
                                    <button
                                        id={`edit-user-${user.id}`}
                                        className="um-btn-edit"
                                        onClick={() => openEditModal(user)}
                                        title="Edit user"
                                    >
                                        ✏️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="um-overlay" id="user-modal" onClick={closeModal}>
                    <div className="um-modal" onClick={e => e.stopPropagation()}>
                        <div className="um-modal-header">
                            <h2 className="um-modal-title">
                                {modalMode === 'create' ? 'Create User' : 'Edit User'}
                            </h2>
                            <button id="close-user-modal" className="um-modal-close" onClick={closeModal}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="um-form">
                            <div className="um-form-row">
                                <div className="um-form-group">
                                    <label htmlFor="cu-name">Name</label>
                                    <input
                                        id="cu-name"
                                        type="text"
                                        name="name"
                                        placeholder="Full name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                                <div className="um-form-group">
                                    <label htmlFor="cu-phone">Phone <span className="um-required">*</span></label>
                                    <input
                                        id="cu-phone"
                                        type="tel"
                                        name="phone"
                                        placeholder="10-digit mobile"
                                        maxLength={10}
                                        value={formData.phone}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="um-form-row">
                                <div className="um-form-group">
                                    <label htmlFor="cu-role">Role</label>
                                    <select id="cu-role" name="role" value={formData.role} onChange={handleFormChange} required>
                                        <option value="OWNER">OWNER</option>
                                        <option value="CUSTOMER">CUSTOMER</option>
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="HALL_MANAGER">HALL MANAGER</option>
                                    </select>
                                </div>
                                <div className="um-form-group">
                                    <label htmlFor="cu-status">Status</label>
                                    <select id="cu-status" name="status" value={formData.status} onChange={handleFormChange} required>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </div>
                            </div>

                            <div className="um-form-group">
                                <label htmlFor="cu-address">Address</label>
                                <input
                                    id="cu-address"
                                    type="text"
                                    name="address"
                                    placeholder="Street address"
                                    value={formData.address}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="um-form-row um-form-row-3">
                                <div className="um-form-group">
                                    <label htmlFor="cu-city">City</label>
                                    <input id="cu-city" type="text" name="city" placeholder="City" value={formData.city} onChange={handleFormChange} />
                                </div>
                                <div className="um-form-group">
                                    <label htmlFor="cu-state">State</label>
                                    <input id="cu-state" type="text" name="state" placeholder="State" value={formData.state} onChange={handleFormChange} />
                                </div>
                                <div className="um-form-group">
                                    <label htmlFor="cu-zipcode">Zipcode</label>
                                    <input id="cu-zipcode" type="text" name="zipcode" placeholder="Zipcode" value={formData.zipcode} onChange={handleFormChange} />
                                </div>
                            </div>

                            <div className="um-modal-actions">
                                <button type="button" id="cancel-user-modal" className="um-btn-cancel" onClick={closeModal}>Cancel</button>
                                <button type="submit" id="submit-user-modal" className="um-btn-primary" disabled={submitting}>
                                    {submitting ? (modalMode === 'create' ? 'Creating...' : 'Saving...') : (modalMode === 'create' ? 'Create User' : 'Save Changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                /* ── Page ── */
                .um-page {
                    padding-top: var(--spacing-6);
                    padding-bottom: var(--spacing-8);
                }
                .um-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: var(--spacing-4);
                    margin-bottom: var(--spacing-4);
                    flex-wrap: wrap;
                }
                .um-title {
                    font-size: var(--font-size-xl);
                    font-weight: 700;
                    color: var(--color-text-main);
                    margin: 0;
                }
                .um-subtitle {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-muted);
                    margin: 2px 0 0;
                }

                /* ── Card / Table ── */
                .um-card {
                    background: var(--color-surface);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--color-border);
                    box-shadow: var(--shadow-sm);
                    overflow-x: auto;   /* horizontal scroll on mobile */
                    -webkit-overflow-scrolling: touch;
                }
                .um-table {
                    width: 100%;
                    min-width: 520px;   /* prevents columns from squishing */
                    border-collapse: collapse;
                    font-size: var(--font-size-sm);
                }
                .um-table th {
                    padding: var(--spacing-3) var(--spacing-4);
                    text-align: left;
                    font-size: var(--font-size-xs);
                    font-weight: 600;
                    color: var(--color-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    background: var(--color-background);
                    border-bottom: 1px solid var(--color-border);
                }
                .um-table td {
                    padding: var(--spacing-3) var(--spacing-4);
                    color: var(--color-text-main);
                    border-bottom: 1px solid var(--color-border);
                    vertical-align: middle;
                }
                .um-table tbody tr:last-child td {
                    border-bottom: none;
                }
                .um-table tbody tr:hover {
                    background: var(--color-background);
                }
                .um-name {
                    font-weight: 500;
                }
                .um-empty {
                    text-align: center;
                    color: var(--color-text-muted);
                    font-size: var(--font-size-sm);
                    padding: var(--spacing-8) !important;
                }

                /* ── Badges ── */
                .um-status-badge, .um-role-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-size-xs);
                    font-weight: 600;
                    letter-spacing: 0.02em;
                }
                .um-status-active  { background: #dcfce7; color: #166534; }
                .um-status-inactive { background: #fee2e2; color: #991b1b; }

                .um-role-owner        { background: #dbeafe; color: #1d4ed8; }
                .um-role-customer     { background: #fef9c3; color: #854d0e; }
                .um-role-admin        { background: #f3e8ff; color: #7e22ce; }
                .um-role-hall_manager { background: #ffedd5; color: #9a3412; }

                /* ── Toggle Switch (original) ── */
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

                /* ── Edit button ── */
                .um-btn-edit {
                    background: none;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    padding: 3px 7px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .um-btn-edit:hover { background: var(--color-background); }

                /* ── Buttons ── */
                .um-btn-primary {
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    padding: var(--spacing-2) var(--spacing-4);
                    border-radius: var(--radius-md);
                    font-size: var(--font-size-sm);
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                    white-space: nowrap;
                }
                .um-btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
                .um-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

                .um-btn-cancel {
                    background: transparent;
                    border: 1px solid var(--color-border);
                    padding: var(--spacing-2) var(--spacing-4);
                    border-radius: var(--radius-md);
                    font-size: var(--font-size-sm);
                    font-weight: 500;
                    color: var(--color-text-main);
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .um-btn-cancel:hover { background: var(--color-background); }

                /* ── Modal ── */
                .um-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: var(--spacing-4);
                }
                .um-modal {
                    background: var(--color-surface);
                    border-radius: var(--radius-lg);
                    width: 100%;
                    max-width: 520px;
                    box-shadow: var(--shadow-lg);
                    border: 1px solid var(--color-border);
                    overflow: hidden;
                }
                .um-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--spacing-4) var(--spacing-6);
                    border-bottom: 1px solid var(--color-border);
                }
                .um-modal-title {
                    font-size: var(--font-size-base);
                    font-weight: 700;
                    color: var(--color-text-main);
                    margin: 0;
                }
                .um-modal-close {
                    background: none;
                    border: none;
                    font-size: var(--font-size-base);
                    color: var(--color-text-muted);
                    cursor: pointer;
                    padding: 2px 6px;
                    border-radius: var(--radius-sm);
                    transition: color 0.15s;
                }
                .um-modal-close:hover { color: var(--color-text-main); }

                /* ── Form ── */
                .um-form {
                    padding: var(--spacing-4) var(--spacing-6);
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-3);
                }
                .um-form-row {
                    display: flex;
                    gap: var(--spacing-3);
                }
                .um-form-row-3 .um-form-group { flex: 1; }
                .um-form-row .um-form-group   { flex: 1; }
                .um-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .um-form-group label {
                    font-size: var(--font-size-xs);
                    font-weight: 600;
                    color: var(--color-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .um-required { color: var(--color-error); }
                .um-form-group input,
                .um-form-group select {
                    padding: var(--spacing-2) var(--spacing-3);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    font-size: var(--font-size-sm);
                    font-family: var(--font-family-base);
                    color: var(--color-text-main);
                    background: var(--color-surface);
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    width: 100%;
                    box-sizing: border-box;
                }
                .um-form-group input:focus,
                .um-form-group select:focus {
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 2px rgba(0,94,184,0.12);
                }
                .um-modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--spacing-2);
                    padding-top: var(--spacing-2);
                    border-top: 1px solid var(--color-border);
                    margin-top: var(--spacing-1);
                }

                /* ── Responsive (mobile) ── */
                @media (max-width: 640px) {
                    .um-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .um-btn-primary {
                        text-align: center;
                    }
                    .um-overlay {
                        align-items: flex-end;
                        padding: 0;
                    }
                    .um-modal {
                        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                    .um-form-row {
                        flex-direction: column;
                    }
                    .um-modal-actions {
                        flex-direction: column-reverse;
                    }
                    .um-modal-actions button {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};
