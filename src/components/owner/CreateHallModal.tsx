import { useState } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import { Button } from '../common/Button';
import type { HallRequest } from '../../types';
import { hallService } from '../../services/hallService';
import { toast } from 'react-hot-toast';

interface CreateHallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
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

export const CreateHallModal = ({ isOpen, onClose, onSuccess }: CreateHallModalProps) => {
    const [formData, setFormData] = useState<HallRequest>(initialFormState);
    const [loading, setLoading] = useState(false);
    const [newFacility, setNewFacility] = useState('');

    if (!isOpen) return null;

    const validateContacts = (contacts: string[]) => {
        const phoneRegex = /^\d{10}$/;
        return contacts.every(contact => phoneRegex.test(contact));
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
            await hallService.createHall(submissionData);
            toast.success('Hall created successfully');
            setFormData(initialFormState);
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to create hall');
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
        // Only allow digits
        if (value && !/^\d*$/.test(value)) return;

        const newContacts = [...formData.contacts];
        newContacts[index] = value;
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
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Add New Hall</h3>
                    <button onClick={onClose} className="close-btn"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
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
                        <div className="tags-container">
                            {formData.facilities.map((facility, index) => (
                                <span key={index} className="tag">
                                    {facility}
                                    <button type="button" onClick={() => removeFacility(index)}><X size={14} /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-section">
                        <label>Contacts <span className="required">*</span></label>
                        <p className="description-text">Enter valid 10-digit phone numbers.</p>
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
                                {index > 0 && (
                                    <button type="button" onClick={() => removeContact(index)} className="remove-btn">
                                        <Trash size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addContact} className="text-btn">
                            <Plus size={16} /> Add another contact
                        </button>
                    </div>

                    <div className="modal-footer">
                        <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
                        <Button variant="primary" type="submit" isLoading={loading}>Create Hall</Button>
                    </div>
                </form>
            </div >

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
                    border-radius: 8px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    background: white;
                    z-index: 10;
                }
                .modal-header h3 { margin: 0; }
                .close-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #666;
                }
                .modal-form {
                    padding: 1.5rem;
                }
                .form-section {
                    margin-bottom: 1.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid #eee;
                }
                .form-section h4 {
                    margin: 0 0 1rem 0;
                    font-size: 1rem;
                    color: #444;
                }
                .form-group {
                    margin-bottom: 1rem;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                @media (max-width: 600px) {
                    .form-row { grid-template-columns: 1fr; }
                }
                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    font-size: 0.9rem;
                }
                .required {
                    color: #ef4444;
                    margin-left: 0.25rem;
                }
                .description-text {
                    font-size: 0.8rem;
                    color: #666;
                    margin-bottom: 0.5rem;
                    margin-top: -0.25rem;
                }
                input, textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                }
                .input-with-button {
                    display: flex;
                    gap: 0.5rem;
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
                    margin-top: 2rem;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid #eee;
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
