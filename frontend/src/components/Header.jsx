import React, { useRef, useState, useEffect } from 'react';
import { User, Bell, Search, Menu, Plus, Sun, Moon } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
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
        document.documentElement.setAttribute('data-theme', theme);
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
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_BASE_URL}/api/drugs/search?q=${query}`);
                if (response.ok) {
                    const data = await response.json();
                    searchCache.current[query] = data.drugs || [];
                    setSuggestions(data.drugs || []);
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
                    {suggestions.length > 0 && (
                        <div className="search-suggestions card" style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            marginTop: '0.5rem',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            padding: '0.5rem'
                        }}>
                            {suggestions.map((drug, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelect(drug)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        color: 'var(--secondary)'
                                    }}
                                    className="suggestion-item"
                                >
                                    <span style={{ fontWeight: '600' }}>{drug.name}</span>
                                    <Plus size={14} className="text-muted" />
                                </div>
                            ))}
                        </div>
                    )}
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
