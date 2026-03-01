import React from 'react';
import { Pill, ShieldAlert, Database, ArrowUpRight, Activity, Users } from 'lucide-react';

const DashboardPage = () => {
    const stats = [
        { label: 'Checks Today', value: '42', icon: <Activity className="text-primary" />, trend: '+12%', color: 'var(--primary)' },
        { label: 'Dangerous Pairs Found', value: '8', icon: <ShieldAlert className="text-danger" />, trend: 'High Priority', color: 'var(--danger)' },
        { label: 'Drugs in Database', value: '10,482+', icon: <Database className="text-info" />, trend: 'Updated Weekly', color: 'var(--info)' },
        { label: 'Active Clinicians', value: '1,204', icon: <Users className="text-secondary" />, trend: '+5%', color: 'var(--secondary)' },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="section-title">Clinical Dashboard</h2>
                <p style={{ color: 'var(--text-muted)' }}>Welcome back, Doctor. Here is today's overview of medication safety checks.</p>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

            <div className="dashboard-grid">
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem' }}>System Integrity Status</h3>
                        <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }}>View Logs</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            { status: 'Operational', name: 'Interaction Engine v2.4', time: 'Last sync: 2h ago' },
                            { status: 'Operational', name: 'RxNorm Database Provider', time: 'Last sync: 10m ago' },
                            { status: 'Maintenance', name: 'Report Generation Service', time: 'Scheduled: Mar 5' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: i < 2 ? '1.25rem' : '0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: item.status === 'Operational' ? 'var(--success)' : 'var(--warning)'
                                }}></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.9375rem' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</div>
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: item.status === 'Operational' ? 'var(--success)' : 'var(--warning)' }}>{item.status}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ background: 'var(--secondary)', color: 'white' }}>
                    <h3 style={{ fontSize: '1.125rem', color: 'white', marginBottom: '1rem' }}>Clinical Tip</h3>
                    <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        Always cross-reference checker results with patient's medical history for a complete assessment of risk factors like kidney/liver function.
                    </p>
                    <button className="btn" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', width: '100%', fontSize: '0.875rem' }}>
                        Open Guidelines <ArrowUpRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
