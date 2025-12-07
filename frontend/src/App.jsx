import React from 'react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';

function App() {
    return (
        <>
            <Toaster position="top-right" />
            <Dashboard />
        </>
    );
}

export default App;
