import React, { useState, useEffect } from 'react';
import EventForm from './EventForm';
import EventList from './EventList';
import ProfileSelector from './ProfileSelector';
import { getEvents, getUsers } from '../services/api';
import './Dashboard.css';

const TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland'
];

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedProfile, setSelectedProfile] = useState(() => {
        return localStorage.getItem('selectedProfile') || '';
    });

    const [viewTimezone, setViewTimezone] = useState(() => {
        return localStorage.getItem('viewTimezone') || 'UTC';
    });

    const handleProfileChange = (profileId) => {
        setSelectedProfile(profileId);
        if (profileId) {
            localStorage.setItem('selectedProfile', profileId);
        } else {
            localStorage.removeItem('selectedProfile');
        }
    };

    const handleTimezoneChange = (e) => {
        const tz = e.target.value;
        setViewTimezone(tz);
        localStorage.setItem('viewTimezone', tz);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eventsRes, usersRes] = await Promise.all([
                getEvents({ timezone: viewTimezone, profile: selectedProfile }),
                getUsers()
            ]);
            setEvents(eventsRes.data.data || []);
            setUsers(usersRes.data.data || []);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [viewTimezone, selectedProfile]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Event Management</h1>
                    <p className="subtitle">Create and manage events across multiple timezones</p>
                </div>
                <div className="current-profile-wrapper">
                    <ProfileSelector
                        users={users}
                        selectedProfile={selectedProfile}
                        onSelect={handleProfileChange}
                        onUserCreated={fetchData}
                    />
                </div>
            </header>

            <main className="dashboard-content">
                <section className="left-panel">
                    <EventForm
                        users={users}
                        selectedProfile={selectedProfile}
                        onEventCreated={fetchData}
                    />
                </section>

                <section className="right-panel">
                    <div className="panel-header">
                        <h2>Events</h2>
                        <div className="timezone-selector">
                            <label>View in Timezone</label>
                            <select value={viewTimezone} onChange={handleTimezoneChange}>
                                {TIMEZONES.map(tz => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <EventList
                        events={events}
                        users={users}
                        loading={loading}
                        onEventUpdated={fetchData}
                    />
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
