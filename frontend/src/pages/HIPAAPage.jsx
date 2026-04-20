import React from 'react';
import { Shield, Lock, EyeOff, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HIPAAPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <nav style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid rgba(20, 184, 166, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#14b8a6',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600'
                    }}
                >
                    <ArrowLeft size={20} /> Back
                </button>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#14b8a6' }}>HIPAA Compliance</div>
            </nav>

            <main style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '1rem',
                        background: 'rgba(20, 184, 166, 0.1)',
                        borderRadius: '1rem',
                        color: '#14b8a6',
                        marginBottom: '1.5rem'
                    }}>
                        <Shield size={48} />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
                        Healthcare Data Protection
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto' }}>
                        MedCheck is committed to maintaining the highest standards of clinical data security and HIPAA compliance for healthcare providers.
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '2rem', marginBottom: '4rem' }}>
                    {[
                        {
                            icon: <Lock size={24} />,
                            title: "Zero-PII Storage Policy",
                            desc: "MedCheck does not store Patient Identifiable Information (PII) on our servers. All drug interaction checks are processed using anonymized identifiers and clinical nomenclature (RxNorm)."
                        },
                        {
                            icon: <EyeOff size={24} />,
                            title: "End-to-End Encryption",
                            desc: "All communication between your clinical terminal and our interaction engine is encrypted using industry-standard TLS 1.3. Data at rest (interaction logs) is encrypted using AES-256."
                        },
                        {
                            icon: <FileText size={24} />,
                            title: "Audit Logging & Transparency",
                            desc: "Every clinical check generates an immutable audit record, enabling healthcare institutions to maintain full oversight of decision-support activities and compliance reporting."
                        }
                    ].map((feature, i) => (
                        <div key={i} style={{
                            padding: '2rem',
                            background: 'rgba(30, 41, 59, 0.5)',
                            borderRadius: '1.25rem',
                            border: '1px solid rgba(20, 184, 166, 0.1)',
                            display: 'flex',
                            gap: '1.5rem'
                        }}>
                            <div style={{ color: '#14b8a6', flexShrink: 0 }}>{feature.icon}</div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>{feature.title}</h3>
                                <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <section style={{
                    padding: '3rem',
                    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(15, 23, 42, 0) 100%)',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(20, 184, 166, 0.2)'
                }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem' }}>Provider Responsibilities</h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {[
                            "Ensure that local workstations are secured in accordance with institutional policy.",
                            "Avoid entering patient names or social security numbers into search fields.",
                            "Review all interaction findings against official FDA labeling and prescribing information.",
                            "Maintain secure session management (log out when clinical terminals are unattended)."
                        ].map((text, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <CheckCircle size={18} style={{ color: '#14b8a6', flexShrink: 0 }} />
                                <span style={{ color: '#cbd5e1', fontSize: '1rem' }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <footer style={{ marginTop: '5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                    <p>Last Updated: April 2026</p>
                    <p>MedCheck Compliance Office — compliance@medcheck.org</p>
                </footer>
            </main>
        </div>
    );
};

export default HIPAAPage;
