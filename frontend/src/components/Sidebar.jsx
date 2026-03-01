import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Pill, History, Info, LogOut, ShieldAlert, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, onNavItemClick }) => {
    const { logout } = useAuth();

    const navItems = [
        { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/checker', icon: <Pill size={20} />, label: 'Check Interactions' },
        { to: '/history', icon: <History size={20} />, label: 'History' },
        { to: '/about', icon: <Info size={20} />, label: 'About' },
    ];

    const handleNavClick = () => {
        if (onNavItemClick) onNavItemClick();
    };

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose}></div>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="sidebar-logo">
                            <ShieldAlert size={20} />
                        </div>
                        <span className="sidebar-title">MedCheck AI</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            end={item.to === '/'}
                            onClick={handleNavClick}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={logout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
