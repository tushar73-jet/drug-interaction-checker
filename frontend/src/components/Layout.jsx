import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from './AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const Layout = () => {
    const { user, isLoaded } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!isLoaded) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="animate-pulse" style={{ color: 'var(--primary)', fontWeight: '600' }}>Loading Clinician Portal...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-container">
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                onNavItemClick={() => setIsSidebarOpen(false)} 
            />
            <main className="main-content">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <div className="page-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
