import React, { useState, useEffect } from 'react';
import { History, Trash2, Calendar, Pill, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    const handleRerun = (item) => {
        navigate('/checker', { state: { prefillDrugs: item.drugs, patientName: item.patientName } });
    };

    useEffect(() => {
        const savedHistory = localStorage.getItem('interaction_history');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    const clearHistory = () => {
        localStorage.removeItem('interaction_history');
        setHistory([]);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 className="section-title"><History size={24} /> Search History</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Review your past 10 clinical interaction checks.</p>
                </div>
                {history.length > 0 && (
                    <button onClick={clearHistory} className="btn btn-ghost" style={{ color: 'var(--danger)' }}>
                        <Trash2 size={18} /> Clear All
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {history.length > 0 ? (
                    history.map((item, index) => (
                        <div key={index} className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        padding: '0.75rem',
                                        background: 'var(--primary-light)',
                                        borderRadius: '10px',
                                        color: 'var(--primary)'
                                    }}>
                                        <Pill size={20} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                                            {item.drugs.map((drug, di) => (
                                                <React.Fragment key={di}>
                                                    <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>{drug}</span>
                                                    {di < item.drugs.length - 1 && <span style={{ color: 'var(--text-muted)' }}>+</span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        {item.patientName && (
                                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                                Patient: {item.patientName}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Calendar size={14} /> {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: item.count > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: '600' }}>
                                                <ShieldAlert size={14} /> {item.count} interaction{item.count !== 1 ? 's' : ''} found
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleRerun(item)} className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )).reverse()
                ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', borderStyle: 'dashed' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            <History size={48} style={{ opacity: 0.2 }} />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>No History Yet</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Your clinical searches will appear here for quick reference.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
