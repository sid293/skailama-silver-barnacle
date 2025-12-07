import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createEvent, updateEvent } from '../services/api';
import './EventForm.css';
import dayjs from 'dayjs';

const TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Asia/Kolkata',
    'Asia/Tokyo',
    'Australia/Sydney'
];

const EventForm = ({ users, onEventCreated, initialData, onCancel, selectedProfile }) => {
    const [profiles, setProfiles] = useState([]);
    const [timezone, setTimezone] = useState('America/New_York');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setProfiles(initialData.profiles || []);
            setTimezone(initialData.timezone || 'UTC');
            if (initialData.startDate) {
                setStartDate(dayjs(initialData.startDate).format('YYYY-MM-DDTHH:mm'));
            }
            if (initialData.endDate) {
                setEndDate(dayjs(initialData.endDate).format('YYYY-MM-DDTHH:mm'));
            }
        } else if (selectedProfile) {
            setProfiles([selectedProfile]);
        }
    }, [initialData, selectedProfile]);

    const isEditing = !!initialData;

    const handleProfileChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setProfiles(selectedOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (profiles.length === 0) {
            toast.error('Please select at least one profile');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                profiles,
                timezone,
                startDate,
                endDate
            };

            if (isEditing) {
                await updateEvent(initialData._id, payload);
                toast.success('Event updated successfully');
            } else {
                await createEvent(payload);
                toast.success('Event created successfully');
            }

            if (isEditing && onCancel) {
                onCancel();
            } else {
                setProfiles([]);
                setStartDate('');
                setEndDate('');
            }
            onEventCreated();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} event`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="event-form-wrapper">
            <h2>{isEditing ? 'Edit Event' : 'Create Event'}</h2>

            <form onSubmit={handleSubmit} className="event-form">
                <div className="form-group">
                    <label>Profiles</label>
                    <div className="select-wrapper">
                        <select
                            multiple
                            value={profiles}
                            onChange={handleProfileChange}
                            className="form-control multiselect"
                        >
                            {users.map(user => (
                                <option key={user._id} value={user._id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                        <small className="hint">Hold Ctrl/Cmd to select multiple profiles</small>
                    </div>
                </div>

                <div className="form-group">
                    <label>Timezone</label>
                    <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="form-control"
                    >
                        {TIMEZONES.map(tz => (
                            <option key={tz} value={tz}>{tz}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Start Date & Time</label>
                    <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label>End Date & Time</label>
                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                    {isEditing && (
                        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Event' : '+ Create Event')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EventForm;
