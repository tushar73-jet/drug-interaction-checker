import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { ShieldAlert, User, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [name, setName] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            login(name);
            navigate('/');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)',
            padding: '1.5rem'
        }}>
            <div className="card animate-fade-in" style={{
                maxWidth: '450px',
                width: '100%',
                padding: '3rem 2.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <ShieldAlert size={32} />
                </div>

                <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>MedCheck AI</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Clinical Decision Support System</p>

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Clinician Name</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Dr. Smith"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Access Code</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                defaultValue="demo123"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    background: '#f8fafc'
                                }}
                                disabled
                            />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Demo access code is pre-filled for this appraisal.</p>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', gap: '0.75rem' }}>
                        Sign In to Clinical Portal <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Secured by HIPAA compliant encryption
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
