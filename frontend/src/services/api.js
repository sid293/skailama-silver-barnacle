import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

export const getUsers = () => api.get('/users');
export const createEvent = (data) => api.post('/events', data);
export const getEvents = (params) => api.get('/events', { params });
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const getEvent = (id, params) => api.get(`/events/${id}`, { params });

export const createUser = (data) => api.post('/users', data);
export default api;
