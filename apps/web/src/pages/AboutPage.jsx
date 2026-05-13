import React from 'react';
import { Info, Database, ShieldCheck, Globe, Mail, Users, Zap } from 'lucide-react';

const AboutPage = () => {
    return (
        <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Hero Section */}
            <div style={{
                marginBottom: '4rem',
                textAlign: 'left'
            }}>
                <div style={{
                    display: 'inline-flex',
                    padding: '0.5rem 1rem',
                    background: 'rgba(20, 184, 166, 0.1)',
                    borderRadius: '50px',
                    color: '#14b8a6',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '1.5rem',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Info size={16} /> Clinical Information System
                </div>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    color: '#f8fafc',
                    marginBottom: '1rem'
                }}>
                    A Specialized Clinical <span style={{ color: '#14b8a6' }}>Decision Support Tool</span>
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    color: '#94a3b8',
                    lineHeight: '1.6'
                }}>
                    MedCheck analyzes high-fidelity clinical datasets to provide healthcare providers with actionable, real-time drug interaction insights.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {/* Data Source Card */}
                <div style={{
                    padding: '2.5rem',
                    background: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(20, 184, 166, 0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ color: '#14b8a6', marginBottom: '1.25rem' }}>
                        <Database size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc', marginBottom: '1rem' }}>
                        Evidence-Based Data
                    </h3>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        Our interaction engine cross-references multiple authoritative sources:
                    </p>
                    <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { title: "RxNorm", desc: "Standardized drug nomenclature" },
                            { title: "NIH DDI", desc: "Peer-reviewed interaction database" },
                            { title: "Clinical Trials", desc: "Aggregate adverse event reporting" }
                        ].map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <Zap size={16} style={{ color: '#14b8a6', marginTop: '0.25rem' }} />
                                <div>
                                    <div style={{ fontWeight: '600', color: '#cbd5e1' }}>{item.title}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{item.desc}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Compliance Card */}
                <div style={{
                    padding: '2.5rem',
                    background: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(20, 184, 166, 0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ color: '#14b8a6', marginBottom: '1.25rem' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc', marginBottom: '1rem' }}>
                        Security & Privacy
                    </h3>
                    <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                        MedCheck is architected with a "Privacy First" approach for medical environments.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ 
                            padding: '1rem', 
                            background: 'rgba(20, 184, 166, 0.05)', 
                            borderRadius: '1rem',
                            border: '1px solid rgba(20, 184, 166, 0.1)'
                        }}>
                            <div style={{ fontWeight: '600', color: '#14b8a6', marginBottom: '0.25rem' }}>HIPAA Alignment</div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Zero-PII storage policy for audit compliance.</div>
                        </div>
                        <div style={{ 
                            padding: '1rem', 
                            background: 'rgba(20, 184, 166, 0.05)', 
                            borderRadius: '1rem',
                            border: '1px solid rgba(20, 184, 166, 0.1)'
                        }}>
                            <div style={{ fontWeight: '600', color: '#14b8a6', marginBottom: '0.25rem' }}>Encryption</div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>TLS 1.3 secured communication channels.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div style={{ 
                    padding: '1.5rem', 
                    background: 'rgba(15, 23, 42, 0.5)', 
                    borderRadius: '1rem', 
                    border: '1px solid rgba(20, 184, 166, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ color: '#14b8a6' }}><Globe size={24} /></div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization</div>
                        <div style={{ fontWeight: '600', color: '#f8fafc' }}>MedCheck Global</div>
                    </div>
                </div>
                <div style={{ 
                    padding: '1.5rem', 
                    background: 'rgba(15, 23, 42, 0.5)', 
                    borderRadius: '1rem', 
                    border: '1px solid rgba(20, 184, 166, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ color: '#14b8a6' }}><Mail size={24} /></div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Support</div>
                        <div style={{ fontWeight: '600', color: '#f8fafc' }}>info@medcheck.org</div>
                    </div>
                </div>
                <div style={{ 
                    padding: '1.5rem', 
                    background: 'rgba(15, 23, 42, 0.5)', 
                    borderRadius: '1rem', 
                    border: '1px solid rgba(20, 184, 166, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ color: '#14b8a6' }}><Users size={24} /></div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Community</div>
                        <div style={{ fontWeight: '600', color: '#f8fafc' }}>Open-Science Core</div>
                    </div>
                </div>
            </div>

            <div style={{ 
                marginTop: '5rem', 
                textAlign: 'center', 
                paddingBottom: '2rem',
                color: '#475569',
                fontSize: '0.875rem'
            }}>
                &copy; {new Date().getFullYear()} MedCheck Clinical Systems. All professional trademarks acknowledged.
            </div>
        </div>
    );
};

export default AboutPage;
