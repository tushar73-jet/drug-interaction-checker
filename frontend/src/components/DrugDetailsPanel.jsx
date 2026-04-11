import React, { useState, useEffect } from 'react';
import { X, Activity, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

const DrugDetailsPanel = ({ drugName, onClose }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!drugName) return;
        
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_BASE_URL}/api/drugs/details/${drugName}`);
                if (response.ok) {
                    const data = await response.json();
                    setDetails(data.details);
                }
            } catch (error) {
                console.error("Failed to fetch drug details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [drugName]);

    if (!drugName) return null;

    return (
        <div className="card" style={{
            position: 'fixed',
            right: '20px',
            top: '100px',
            width: '350px',
            maxHeight: '80vh',
            zIndex: 1000,
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            border: '1px solid var(--primary)',
            animation: 'fadeIn 0.3s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--primary-light)', borderRadius: '0.5rem' }}>
                        <Activity className="text-primary" size={20} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{drugName}</h3>
                </div>
                <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem' }}>
                    <X size={20} />
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Analyzing pharmacology...</div>
                </div>
            ) : details ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Drug Class</div>
                        <div style={{ fontWeight: '600' }}>{details.class}</div>
                    </div>

                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Clinical Indications</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {details.indications.map((ind, i) => (
                                <span key={i} className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.7rem' }}>{ind}</span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Mechanism of Action</div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{details.action}</p>
                    </div>

                    <div style={{ padding: '1rem', background: '#fff7ed', borderRadius: '0.75rem', border: '1px solid #ffedd5' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#9a3412' }}>
                            <AlertTriangle size={16} />
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Safety Warnings</span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#9a3412', listStyleType: 'disc' }}>
                            {details.warnings.map((w, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{w}</li>)}
                        </ul>
                    </div>
                </div>
            ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No localized info found.</div>
            )}
            
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.8125rem' }}>
                View Full Monograph
            </button>
        </div>
    );
};

export default DrugDetailsPanel;
