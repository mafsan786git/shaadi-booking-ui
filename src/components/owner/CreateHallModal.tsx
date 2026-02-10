import { useState, useEffect } from 'react';
import { X, Plus, Trash } from 'lucide-react';

import type { Hall, HallRequest } from '../../types';
import { hallService } from '../../services/hallService';
import { toast } from 'react-hot-toast';
import { validateMobile, sanitizeMobileInput } from '../../utils/validation';

interface CreateHallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    hallToEdit?: Hall | null;
    initialViewMode?: boolean;
}

const initialFormState: HallRequest = {
    name: '',
    address: {
        address: '',
        city: '',
        state: '',
        zipcode: ''
    },
    lat: '0.0',
    lng: '0.0',
    capacity: 0,
    basePrice: 0,
    facilities: [],
    description: '',
    contacts: ['']
};

export const CreateHallModal = ({ isOpen, onClose, onSuccess, hallToEdit, initialViewMode = false }: CreateHallModalProps) => {
    const [formData, setFormData] = useState<HallRequest>(initialFormState);
    const [isViewMode, setIsViewMode] = useState(initialViewMode);
    const [loading, setLoading] = useState(false);
    const [newFacility, setNewFacility] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsViewMode(!!initialViewMode);
            if (hallToEdit) {
                setFormData({
                    name: hallToEdit.name,
                    address: hallToEdit.address,
                    lat: hallToEdit.lat || '0.0',
                    lng: hallToEdit.lng || '0.0',
                    capacity: hallToEdit.capacity,
                    basePrice: hallToEdit.basePrice,
                    facilities: hallToEdit.facilities,
                    description: hallToEdit.description || '',
                    contacts: hallToEdit.contacts.length > 0 ? hallToEdit.contacts : ['']
                });
            } else {
                setFormData(initialFormState);
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, hallToEdit, initialViewMode]);

    if (!isOpen) return null;

    const validateContacts = (contacts: string[]) => {
        return contacts.every(contact => validateMobile(contact));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateContacts(formData.contacts)) {
            toast.error('All contacts must be valid 10-digit phone numbers');
            return;
        }

        setLoading(true);
        try {
            const submissionData = {
                ...formData,
                capacity: formData.capacity || 0,
                basePrice: formData.basePrice || 0
            };

            if (hallToEdit) {
                await hallService.updateHall(hallToEdit.hallId, submissionData);
                toast.success('Hall updated successfully');
            } else {
                await hallService.createHall(submissionData);
                toast.success('Hall created successfully');
            }

            setFormData(initialFormState);
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(hallToEdit ? 'Failed to update hall' : 'Failed to create hall');
        } finally {
            setLoading(false);
        }
    };

    const addFacility = () => {
        if (newFacility.trim()) {
            setFormData({
                ...formData,
                facilities: [...formData.facilities, newFacility.trim()]
            });
            setNewFacility('');
        }
    };

    const removeFacility = (index: number) => {
        setFormData({
            ...formData,
            facilities: formData.facilities.filter((_, i) => i !== index)
        });
    };

    const handleContactChange = (index: number, value: string) => {
        const sanitized = sanitizeMobileInput(value);
        const newContacts = [...formData.contacts];
        newContacts[index] = sanitized;
        setFormData({ ...formData, contacts: newContacts });
    };

    const addContact = () => {
        setFormData({ ...formData, contacts: [...formData.contacts, ''] });
    };

    const removeContact = (index: number) => {
        setFormData({
            ...formData,
            contacts: formData.contacts.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="modal-overlay">
            <div className={`modal-content ${isViewMode ? 'view-mode' : ''}`}>
                <div className="modal-header">
                    <h3>{isViewMode ? 'Hall Details' : (hallToEdit ? 'Edit Hall' : 'Add New Hall')}</h3>
                        <button onClick={onClose} className="close-btn"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-body">
                        <fieldset disabled={isViewMode} style={{ border: 'none', padding: 0, margin: 0 }}>
                            <div className="form-group">
                                <label>Hall Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Grand Palace"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Capacity <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={!formData.capacity ? '' : formData.capacity}
                                        onChange={e => {
                                            const val = parseInt(e.target.value);
                                            setFormData({ ...formData, capacity: isNaN(val) ? 0 : val });
                                        }}
                                        onKeyDown={e => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                        placeholder="e.g. 500"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Base Price <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={!formData.basePrice ? '' : formData.basePrice}
                                        onChange={e => {
                                            const val = parseInt(e.target.value);
                                            setFormData({ ...formData, basePrice: isNaN(val) ? 0 : val });
                                        }}
                                        onKeyDown={e => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                        placeholder="e.g. 50000"
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Address</h4>
                                <div className="form-group">
                                    <label>Street Address <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.address.address}
                                        onChange={e => setFormData({
                                            ...formData,
                                            address: { ...formData.address, address: e.target.value }
                                        })}
                                        placeholder="e.g. 123 Main St, Near Park"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.address.city}
                                            onChange={e => setFormData({
                                                ...formData,
                                                address: { ...formData.address, city: e.target.value }
                                            })}
                                            placeholder="e.g. Prayagraj"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.address.state}
                                            onChange={e => setFormData({
                                                ...formData,
                                                address: { ...formData.address, state: e.target.value }
                                            })}
                                            placeholder="e.g. Uttar Pradesh"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Zipcode <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.address.zipcode}
                                            onChange={e => setFormData({
                                                ...formData,
                                                address: { ...formData.address, zipcode: e.target.value }
                                            })}
                                            placeholder="e.g. 210002"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Describe the hall features, ambiance, and suitability for events..."
                                />
                            </div>

                            <div className="form-section">
                                <label>Facilities</label>
                                {!isViewMode && (
                                    <div className="input-with-button">
                                        <input
                                            type="text"
                                            value={newFacility}
                                            onChange={e => setNewFacility(e.target.value)}
                                            placeholder="Add facility (e.g. WiFi, AC)"
                                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                                        />
                                        <button type="button" onClick={addFacility} className="add-btn">Add</button>
                                    </div>
                                )}
                                <div className="tags-container">
                                    {formData.facilities.map((facility, index) => (
                                        <span key={index} className="tag">
                                            {facility}
                                            {!isViewMode && <button type="button" onClick={() => removeFacility(index)}><X size={14} /></button>}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="form-section">
                                <label>Contacts <span className="required">*</span></label>
                                {!isViewMode && <p className="description-text">Enter valid 10-digit phone numbers.</p>}
                                {formData.contacts.map((contact, index) => (
                                    <div key={index} className="input-with-button mb-2">
                                        <input
                                            type="text"
                                            value={contact}
                                            onChange={e => handleContactChange(index, e.target.value)}
                                            placeholder="10-digit Phone Number"
                                            maxLength={10}
                                            required
                                        />
                                        {index > 0 && !isViewMode && (
                                            <button type="button" onClick={() => removeContact(index)} className="remove-btn">
                                                <Trash size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {!isViewMode && (
                                    <button type="button" onClick={addContact} className="text-btn">
                                        <Plus size={16} /> Add another contact
                                    </button>
                                )}
                            </div>
                        </fieldset>
                    </div>

                    <div className="modal-footer">
                        {isViewMode ? (
                            <>
                                <button type="button" onClick={onClose} className="btn-secondary">Close</button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsViewMode(false);
                                    }}
                                    className="btn-primary"
                                >
                                    Edit
                                </button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={loading} className="btn-primary">
                                    {hallToEdit ? 'Update Hall' : 'Create Hall'}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    padding: 1rem;
                }
                .modal-content {
                    background: white;
                    border-radius: 12px;
                    width: 95%;
                    max-width: 600px;
                    max-height: 90vh;
                    display: grid;
                    grid-template-rows: auto 1fr auto;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    animation: slideUp 0.3s ease-out;
                }
                .modal-header {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    z-index: 10;
                }
                .delete-header-btn {
                    background: #fee2e2;
                    border: 1px solid #fca5a5;
                    color: #b91c1c;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    padding: 0.25rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .delete-header-btn:hover {
                    background: #fecaca;
                }
                .modal-header h3 { margin: 0; }
                .close-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #666;
                }
                .modal-form {
                    display: grid;
                    grid-template-rows: 1fr auto;
                    min-height: 0;
                    overflow: hidden;
                }
                .modal-body {
                    padding: 1.5rem;
                    overflow-y: auto;
                    min-height: 0;
                    -webkit-overflow-scrolling: touch;
                    overscroll-behavior: contain;
                }
                .form-section {
                    margin-bottom: 0.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #eee;
                }
                .form-section h4 {
                    margin: 0 0 0.25rem 0;
                    font-size: 0.9rem;
                    color: #444;
                }
                .form-group {
                    margin-bottom: 0.4rem;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem;
                }
                @media (max-width: 600px) {
                    .form-row { grid-template-columns: 1fr; }
                }
                label {
                    display: block;
                    margin-bottom: 0.15rem;
                    font-weight: 500;
                    font-size: 0.8rem;
                }
                .required {
                    color: #ef4444;
                    margin-left: 0.25rem;
                }
                .description-text {
                    font-size: 0.8rem;
                    color: #666;
                    margin-bottom: 0.25rem;
                    margin-top: -0.25rem;
                }
                input, textarea {
                    width: 100%;
                    padding: 0.4rem 0.6rem;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 0.9rem;
                }
                .input-with-button {
                    display: flex;
                    gap: 0.5rem;
                }
                .input-with-button input {
                    flex: 1;
                }

                /* Button Styles matching BookingModal */
                .btn-secondary {
                    padding: 0.6rem 1.25rem;
                    background: white;
                    border: 1px solid #cbd5e1;
                    color: #475569;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }
                .btn-secondary:hover {
                    background: #f1f5f9;
                }
                .btn-primary {
                    padding: 0.6rem 1.25rem;
                    background: linear-gradient(135deg, #005EB8 0%, #0093E9 100%);
                    border: none;
                    color: white;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0, 94, 184, 0.3);
                    font-size: 0.9rem;
                }
                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 8px -1px rgba(0, 94, 184, 0.4);
                }
                .btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }
                .add-btn {
                    padding: 0 1rem;
                    background: #f0f0f0;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .tags-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }
                .tag {
                    background: #eef2ff;
                    color: #4f46e5;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                }
                .tag button {
                    background: none;
                    border: none;
                    padding: 0;
                    color: currentColor;
                    cursor: pointer;
                    display: flex;
                }
                .text-btn {
                    background: none;
                    border: none;
                    color: #4f46e5;
                    font-weight: 500;
                    padding: 0;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .modal-footer {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    padding: 1.25rem 1.5rem;
                    border-top: 1px solid #e2e8f0;
                    background: #f8fafc;
                    flex-shrink: 0;
                }
                @media (max-width: 600px) {
                    .modal-overlay {
                        padding: 0;
                        align-items: flex-end;
                    }
                    .modal-content {
                        width: 100vw;
                        height: 92vh;
                        max-height: 92vh;
                        border-radius: 16px 16px 0 0;
                        grid-template-rows: auto 1fr; /* Form itself handles body/footer */
                    }
                    .modal-form {
                        grid-template-rows: 1fr auto;
                        height: 100%;
                    }
                    .modal-header {
                        padding: 1rem 1.25rem;
                    }
                    .modal-body {
                        padding: 1.25rem 1.25rem 4rem 1.25rem; /* Increased bottom padding */
                    }
                    .modal-footer {
                        padding: 1rem 1.25rem;
                        background: #f8fafc;
                        border-top: 1px solid #e2e8f0;
                        box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
                    }
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .mb-2 { margin-bottom: 0.5rem; }
                .remove-btn {
                    background: none;
                    border: none;
                    color: #ef4444;
                    cursor: pointer;
                }
            `}</style>
        </div >
    );
};
