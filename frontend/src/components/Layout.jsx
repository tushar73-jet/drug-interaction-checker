import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from './AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Unhandled render error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '1rem',
                    padding: '3rem',
                    textAlign: 'center'
                }}>
                    <h2 style={{ margin: 0 }}>Something went wrong</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        An unexpected error occurred in this page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9375rem'
                        }}
                    >
                        Reload page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

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
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </div>
            </main>
        </div>
    );
};

export default Layout;
