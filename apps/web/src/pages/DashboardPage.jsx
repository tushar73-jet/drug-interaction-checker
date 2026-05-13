import React, { useState, useEffect } from 'react';
import { Pill, ShieldAlert, Database, Activity, Network, History, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { label: 'Checks Today', value: '-', icon: <Activity size={22} />, trend: 'Loading...', color: 'var(--primary)' },
        { label: 'Interactions Detected', value: '-', icon: <ShieldAlert size={22} />, trend: 'Loading...', color: 'var(--danger)' },
        { label: 'Drugs in Database', value: '—', icon: <Database size={22} />, trend: 'Loading...', color: 'var(--info)' },
        { label: 'Interaction Pairs', value: '—', icon: <Network size={22} />, trend: 'Loading...', color: 'var(--warning)' },
    ]);
    const [recentHistory, setRecentHistory] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
                const response = await fetch(`${API_BASE_URL}/api/v1/drugs/stats`);
                if (!response.ok) throw new Error(`Stats API error: ${response.status}`);
                const backendStats = await response.json();

                const savedHistory = JSON.parse(localStorage.getItem('interaction_history') || '[]');
                const todayStr = new Date().toDateString();
                const todayChecks = savedHistory.filter(item => new Date(item.date).toDateString() === todayStr).length;
                const totalInteractions = savedHistory.reduce((sum, item) => sum + (item.count || 0), 0);

                // Keep last 5 history items for the quick-access panel
                setRecentHistory(savedHistory.slice(-5).reverse());

                setStats([
                    {
                        label: 'Checks Today',
                        value: todayChecks.toString(),
                        icon: <Activity size={22} />,
                        trend: todayChecks > 0 ? '+Active' : 'No Activity',
                        color: 'var(--primary)'
                    },
                    {
                        label: 'Interactions Detected',
                        value: totalInteractions.toString(),
                        icon: <ShieldAlert size={22} />,
                        trend: 'Session Total',
                        color: 'var(--danger)'
                    },
                    {
                        label: 'Drugs in Database',
                        value: backendStats.totalDrugs != null ? backendStats.totalDrugs.toLocaleString() : '1,700+',
                        icon: <Database size={22} />,
                        trend: 'Live Data',
                        color: 'var(--info)'
                    },
                    {
                        label: 'Interaction Pairs',
                        value: backendStats.totalInteractions != null ? backendStats.totalInteractions.toLocaleString() : '190,000+',
                        icon: <Network size={22} />,
                        trend: 'Live Data',
                        color: 'var(--warning)'
                    },
                ]);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
                // Fallback with static values
                setStats(prev => prev.map(s => ({
                    ...s,
                    value: s.label.includes('Database') ? '1,700+' : s.label.includes('Pairs') ? '190,000+' : s.value === '-' ? '0' : s.value,
                    trend: s.label.includes('Live') ? 'Offline' : s.trend,
                })));
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="section-title">Clinical Dashboard</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    Welcome back, <strong style={{ color: 'var(--primary)' }}>Dr. {user?.name || 'Clinician'}</strong>. Here is today's overview of medication safety checks.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                {stats.map((stat, index) => (
                    <div key={index} className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{
                                padding: '0.75rem',
                                background: `${stat.color}18`,
                                borderRadius: '12px',
                                color: stat.color,
                                display: 'flex'
                            }}>
                                {stat.icon}
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: stat.trend.includes('+') || stat.trend === 'Live Data' ? 'var(--success)' : 'var(--text-muted)',
                                background: stat.trend.includes('+') || stat.trend === 'Live Data' ? '#dcfce7' : '#f1f5f9',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px'
                            }}>
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--secondary)', letterSpacing: '-0.03em' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '0.125rem' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="surface-card" style={{ cursor: 'pointer', borderLeft: '4px solid var(--primary)' }} onClick={() => navigate('/dashboard/checker')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Run Interaction Check</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Search drugs and analyze interaction risks with AI explanations.</p>
                        </div>
                        <ArrowRight size={20} color="var(--primary)" />
                    </div>
                </div>
                <div className="surface-card" style={{ cursor: 'pointer', borderLeft: '4px solid var(--info)' }} onClick={() => navigate('/dashboard/history')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>View Check History</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Review past interaction analyses and reload previous drug profiles.</p>
                        </div>
                        <ArrowRight size={20} color="var(--info)" />
                    </div>
                </div>
            </div>

            {/* Recent History */}
            {recentHistory.length > 0 && (
                <div className="surface-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
                            <History size={18} color="var(--primary)" /> Recent Checks
                        </h3>
                        <button className="btn btn-ghost" style={{ fontSize: '0.8125rem' }} onClick={() => navigate('/dashboard/history')}>
                            View All <ArrowRight size={14} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recentHistory.map((item, i) => (
                            <div
                                key={i}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'var(--primary-light)', border: '1px solid hsl(var(--primary) / 0.1)', cursor: 'pointer' }}
                                onClick={() => navigate('/dashboard/checker', { state: { prefillDrugs: item.drugs, patientName: item.patientName } })}
                            >
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9375rem' }}>{item.drugs?.join(' + ') || 'Unknown'}</div>
                                    {item.patientName && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>Patient: {item.patientName}</div>}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: item.count > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                        {item.count > 0 ? `${item.count} interaction${item.count !== 1 ? 's' : ''}` : 'No interactions'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                                        {new Date(item.date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;

