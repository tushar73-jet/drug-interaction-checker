import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

const DisclaimerPage = () => {
    const navigate = useNavigate();
    const { user, isLoaded } = useAuth();

    useEffect(() => {
        if (isLoaded && !user) {
            navigate('/', { replace: true });
        }
    }, [user, isLoaded, navigate]);

    const handleAccept = () => {
        localStorage.setItem('medical_disclaimer_accepted', 'true');
        navigate('/dashboard', { replace: true });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f172a',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                maxWidth: '600px',
                width: '100%',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(13, 148, 136, 0.2)',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '1rem',
                        background: 'rgba(234, 179, 8, 0.1)',
                        borderRadius: '1rem',
                        color: '#eab308',
                        marginBottom: '1.5rem'
                    }}>
                        <ShieldAlert size={40} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem' }}>
                        Medical Disclaimer
                    </h1>
                    <p style={{ color: '#94a3b8' }}>
                        Important information for Clinical Decision Support
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {[
                        "This tool is intended for use by healthcare professionals for clinical decision support ONLY.",
                        "It is not a substitute for professional clinical judgment, diagnosis, or treatment.",
                        "Data is based on multi-source interaction databases and may not be exhaustive.",
                        "Always verify findings against official drug labeling and institutional protocols."
                    ].map((text, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ color: '#14b8a6', flexShrink: 0, marginTop: '0.2rem' }}>
                                <CheckCircle size={20} />
                            </div>
                            <p style={{ fontSize: '0.9375rem', lineHeight: '1.6', color: '#cbd5e1' }}>{text}</p>
                        </div>
                    ))}
                </div>

                <div style={{
                    padding: '1.25rem',
                    background: 'rgba(244, 63, 94, 0.05)',
                    border: '1px solid rgba(244, 63, 94, 0.1)',
                    borderRadius: '0.75rem',
                    marginBottom: '2.5rem',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    <AlertTriangle size={24} style={{ color: '#f43f5e', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.875rem', color: '#f43f5e', fontWeight: '500' }}>
                        By proceeding, you acknowledge that you are a qualified medical professional and accept responsibility for clinical decisions.
                    </p>
                </div>

                <button
                    onClick={handleAccept}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: '#14b8a6',
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    I Accept and Proceed <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default DisclaimerPage;
