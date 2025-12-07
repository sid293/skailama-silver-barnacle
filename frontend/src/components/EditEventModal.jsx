import React from 'react';
import EventForm from './EventForm';

const EditEventModal = ({ event, users, onClose, onSuccess }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Edit Event</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <EventForm
                        users={users}
                        initialData={event}
                        onEventCreated={onSuccess}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditEventModal;
