import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createUser } from '../services/api';
import './ProfileSelector.css';

const ProfileSelector = ({ users, selectedProfile, onSelect, onUserCreated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddUser = async () => {
        if (!newUserName.trim()) return;

        setLoading(true);
        try {
            const res = await createUser({ name: newUserName });
            toast.success('User added successfully');
            setNewUserName('');
            onUserCreated();
            if (res.data?.data?._id) {
                onSelect(res.data.data._id);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add user');
        } finally {
            setLoading(false);
        }
    };

    const getSelectedName = () => {
        if (!selectedProfile) return 'Admin (View All)';
        const user = users.find(u => u._id === selectedProfile);
        return user ? user.name : 'Unknown Profile';
    };

    return (
        <div className="profile-selector-container" ref={dropdownRef}>
            <div className="profile-selector-trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{getSelectedName()}</span>
                <span className="arrow">▼</span>
            </div>

            {isOpen && (
                <div className="profile-dropdown">
                    <div className="dropdown-search">
                        <input
                            type="text"
                            placeholder="Search current profile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="dropdown-list">
                        <div
                            className={`dropdown-item ${selectedProfile === '' ? 'selected' : ''}`}
                            onClick={() => {
                                onSelect('');
                                setIsOpen(false);
                            }}
                        >
                            {selectedProfile === '' && <span className="check">✓</span>}
                            <span style={{ fontWeight: 500 }}>Admin (View All)</span>
                        </div>

                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <div
                                    key={user._id}
                                    className={`dropdown-item ${selectedProfile === user._id ? 'selected' : ''}`}
                                    onClick={() => {
                                        onSelect(user._id);
                                        setIsOpen(false);
                                    }}
                                >
                                    {selectedProfile === user._id && <span className="check">✓</span>}
                                    {user.name}
                                </div>
                            ))
                        ) : (
                            <div className="no-results">No users found</div>
                        )}
                    </div>

                    <div className="dropdown-footer">
                        <input
                            type="text"
                            placeholder="Add new user..."
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                        />
                        <button
                            className="btn-add"
                            onClick={handleAddUser}
                            disabled={loading || !newUserName.trim()}
                        >
                            {loading ? '...' : 'Add'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileSelector;
