import React, { useState, useEffect } from 'react';
import { Bell, Menu, Sun, Moon } from 'lucide-react';
import { useAuth } from './AuthContext';
import { UserButton } from '@clerk/react';
import './Header.css';

const Header = ({ onMenuClick }) => {
    const { user } = useAuth();
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-toggle" onClick={onMenuClick}>
                    <Menu size={24} />
                </button>
            </div>

            <div className="header-right">
                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px'
                    }}
                    title="Toggle Theme"
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <div className="notification-bell">
                    <Bell size={20} />
                    <span className="notification-badge"></span>
                </div>

                <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div className="user-info" style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                            {user?.fullName || user?.firstName || 'Doctor'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clinical Specialist</div>
                    </div>
                    <UserButton afterSignOutUrl="/login" />
                </div>
            </div>
        </header>
    );
};

export default Header;
