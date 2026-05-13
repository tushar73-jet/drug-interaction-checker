import React, { useRef, useState, useEffect } from 'react';
import { User, Bell, Search, Menu, Plus, Sun, Moon } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/react';
import './Header.css';

const Header = ({ onMenuClick }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    const searchCache = useRef({});

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

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 1) {
                setSuggestions([]);
                return;
            }
            if (searchCache.current[query]) {
                setSuggestions(searchCache.current[query]);
                return;
            }
            try {
                const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
                const response = await fetch(`${API_BASE_URL}/api/v1/drugs/search?q=${query}`);
                if (response.ok) {
                    const data = await response.json();
                    searchCache.current[query] = data.data?.drugs || [];
                    setSuggestions(data.data?.drugs || []);
                }
            } catch (error) {
                console.error('Header search failed:', error);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (drug) => {
        setQuery('');
        setSuggestions([]);
        navigate('/checker', { state: { prefillDrugs: [drug.name] } });
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-toggle" onClick={onMenuClick}>
                    <Menu size={24} />
                </button>
                <div className="search-bar-container" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <div className="search-input-wrapper">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search clinical database..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                padding: '0.5rem',
                                fontSize: '0.9375rem'
                            }}
                        />
                    </div>
                </div>
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
                            {user?.name || 'Doctor'}
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
