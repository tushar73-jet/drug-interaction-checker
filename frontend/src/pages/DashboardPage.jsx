import React, { useState, useEffect } from 'react';
import { Pill, ShieldAlert, Database, ArrowUpRight, Activity, Users } from 'lucide-react';

const DashboardPage = () => {
    const [stats, setStats] = useState([
        { label: 'Checks Today', value: '-', icon: <Activity className="text-primary" />, trend: 'Loading...', color: 'var(--primary)' },
        { label: 'Interactions Detected', value: '-', icon: <ShieldAlert className="text-danger" />, trend: 'Loading...', color: 'var(--danger)' },
        { label: 'Drugs in Database', value: '10,482+', icon: <Database className="text-info" />, trend: 'Updated Weekly', color: 'var(--info)' },
    ]);

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

                setStats([
                    {
                        label: 'Checks Today',
                        value: todayChecks.toString(),
                        icon: <Activity className="text-primary" />,
                        trend: todayChecks > 0 ? '+Active' : 'No Activity',
                        color: 'var(--primary)'
                    },
                    {
                        label: 'Interactions Detected',
                        value: totalInteractions.toString(),
                        icon: <ShieldAlert className="text-danger" />,
                        trend: 'Historical',
                        color: 'var(--danger)'
                    },
                    {
                        label: 'Drugs in Database',
                        value: backendStats.totalDrugs?.toLocaleString() || '10,482+',
                        icon: <Database className="text-info" />,
                        trend: 'Live Seed',
                        color: 'var(--info)'
                    },
                ]);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="section-title">Clinical Dashboard</h2>
                <p style={{ color: 'var(--text-muted)' }}>Welcome back, Doctor. Here is today's overview of medication safety checks.</p>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{
                                padding: '0.75rem',
                                background: `${stat.color}15`,
                                borderRadius: '12px',
                                color: stat.color
                            }}>
                                {stat.icon}
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: stat.trend.includes('+') ? 'var(--success)' : 'var(--text-muted)',
                                background: stat.trend.includes('+') ? '#dcfce7' : '#f1f5f9',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px'
                            }}>
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--secondary)' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
};

export default DashboardPage;
