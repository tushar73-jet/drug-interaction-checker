import React from 'react';
import { User, Bell, Search, Menu } from 'lucide-react';
import { useAuth } from './AuthContext';
import './Header.css';

const Header = ({ onMenuClick }) => {
    const { user } = useAuth();

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-toggle" onClick={onMenuClick}>
                    <Menu size={24} />
                </button>
                <div className="search-bar-placeholder">
                    <Search size={18} />
                    <span>Search patient or clinical database...</span>
                </div>
            </div>

            <div className="header-right">
                <div className="notification-bell">
                    <Bell size={20} />
                    <span className="notification-badge"></span>
                </div>

                <div className="user-profile">
                    <div className="user-info">
                        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>Dr. {user?.name || 'Guest'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clinical Specialist</div>
                    </div>
                    <div className="user-avatar">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
