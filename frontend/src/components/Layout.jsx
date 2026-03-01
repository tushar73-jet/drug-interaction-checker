import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from './AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const Layout = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <Header />
                <div className="page-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
