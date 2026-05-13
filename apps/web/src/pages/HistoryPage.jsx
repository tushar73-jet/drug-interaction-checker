import React, { useState, useEffect } from 'react';
import { History, Trash2, Calendar, Pill, ShieldAlert, ArrowRight, Download } from 'lucide-react';
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

    const deleteItem = (indexToDelete) => {
        const newHistory = history.filter((_, idx) => idx !== indexToDelete);
        setHistory(newHistory);
        localStorage.setItem('interaction_history', JSON.stringify(newHistory));
    };

    const exportToCSV = () => {
        if (history.length === 0) return;

        const headers = ['Date', 'Patient Name', 'Drugs Searched', 'Interactions Found'];
        const csvRows = [headers.join(',')];

        history.forEach(item => {
            const date = new Date(item.date).toLocaleString().replace(/,/g, '');
            const patient = item.patientName || 'N/A';
            const drugs = item.drugs.join(' + ').replace(/,/g, ' ');
            const count = item.count || 0;
            csvRows.push(`${date},${patient},${drugs},${count}`);
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `clinical_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 className="section-title"><History size={24} /> Search History</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Review your past 10 clinical interaction checks.</p>
                </div>
                {history.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={exportToCSV} className="btn btn-ghost" style={{ color: 'var(--primary)' }}>
                            <Download size={18} /> Export CSV
                        </button>
                        <button onClick={clearHistory} className="btn btn-ghost" style={{ color: 'var(--danger)' }}>
                            <Trash2 size={18} /> Clear All
                        </button>
                    </div>
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
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => deleteItem(index)} className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--danger)', opacity: 0.7 }}>
                                        <Trash2 size={18} />
                                    </button>
                                    <button onClick={() => handleRerun(item)} className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--primary)' }}>
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
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
