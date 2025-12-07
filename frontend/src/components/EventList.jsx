import React, { useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import EditEventModal from './EditEventModal';
import './EventList.css';

dayjs.extend(utc);
dayjs.extend(timezone);

const EventList = ({ events, loading, onEventUpdated, users }) => {
    const [selectedEventLogs, setSelectedEventLogs] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);

    const getProfileNames = (profileIds) => {
        if (!profileIds || profileIds.length === 0) return 'None';
        return profileIds.map(id => {
            const user = users.find(u => u._id === id);
            return user ? user.name : id;
        }).join(', ');
    };

    const formatDate = (dateString, tz) => {
        if (!dateString) return 'N/A';
        return dayjs(dateString).tz(tz || 'UTC');
    };

    if (loading) {
        return <div className="loading-state">Loading events...</div>;
    }

    if (!events || events.length === 0) {
        return <div className="empty-state">No events found</div>;
    }

    return (
        <div className="event-list">
            {events.map(event => (
                <div key={event._id} className="event-card">
                    <div className="event-header">
                        <span className="event-profiles">
                            Profiles: {getProfileNames(event.profiles)}
                        </span>
                        <span className="event-tz-badge">{event.displayTimezone}</span>
                    </div>

                    <div className="event-times">
                        <div className="time-row">
                            <div className="time-detail">
                                <span className="label">Start: {formatDate(event.startDate, event.displayTimezone).format('MMM D, YYYY')}</span>
                                <span className="value">{formatDate(event.startDate, event.displayTimezone).format('h:mm A')}</span>
                            </div>
                        </div>
                        <div className="time-row">
                            <div className="time-detail">
                                <span className="label">End: {formatDate(event.endDate, event.displayTimezone).format('MMM D, YYYY')}</span>
                                <span className="value">{formatDate(event.endDate, event.displayTimezone).format('h:mm A')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="event-meta-dates">
                        <div className="meta-row">
                            <span className="meta-label">Created:</span> {formatDate(event.createdAt, event.displayTimezone).format('MMM D, YYYY at h:mm A')}
                        </div>
                        <div className="meta-row">
                            <span className="meta-label">Updated:</span> {formatDate(event.updatedAt, event.displayTimezone).format('MMM D, YYYY at h:mm A')}
                        </div>
                    </div>

                    <div className="event-actions">
                        <button
                            className="btn-text"
                            style={{ marginRight: '12px' }}
                            onClick={() => setEditingEvent(event)}
                        >
                            Edit
                        </button>
                        <button
                            className="btn-text"
                            onClick={() => setSelectedEventLogs(event)}
                        >
                            View Logs
                        </button>
                    </div>
                </div>
            ))}

            {editingEvent && (
                <EditEventModal
                    event={editingEvent}
                    users={users}
                    onClose={() => setEditingEvent(null)}
                    onSuccess={() => {
                        setEditingEvent(null);
                        onEventUpdated();
                    }}
                />
            )}

            {selectedEventLogs && (
                <div className="modal-overlay" onClick={() => setSelectedEventLogs(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Event Update History</h3>
                            <button className="close-btn" onClick={() => setSelectedEventLogs(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="logs-list">
                                {selectedEventLogs.changeLog && selectedEventLogs.changeLog.length > 0 ? (
                                    selectedEventLogs.changeLog.map((log, index) => (
                                        <div key={index} className="log-item">
                                            <div className="log-time">
                                                {dayjs(log.changedAt).format('MMM D, YYYY at h:mm A')}
                                            </div>
                                            <div className="log-fields">
                                                Fields updated: <span className="highlight">{log.fields.join(', ')}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="empty-logs">No update history available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventList;
