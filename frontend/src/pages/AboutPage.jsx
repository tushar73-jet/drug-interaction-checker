import React from 'react';
import { ShieldCheck, Database, Info, Globe, Mail } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="section-title"><Info size={24} /> About MedCheck AI</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                    A professional-grade clinical decision support tool designed to enhance patient safety through real-time drug interaction monitoring.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <section className="card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Database size={20} className="text-primary" /> Data Sources
                    </h3>
                    <p style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>
                        Our interaction engine is powered by high-fidelity clinical datasets, including:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li><strong>RxNorm:</strong> Standardized nomenclature for clinical drugs.</li>
                        <li><strong>NIH Drug-Drug Interactions:</strong> Comprehensive database of known adverse interactions.</li>
                        <li><strong>Kaggle DDI Dataset:</strong> Supplemented with modern clinical research findings.</li>
                    </ul>
                </section>

                <section className="card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <ShieldCheck size={20} className="text-success" /> Clinical Compliance
                    </h3>
                    <p style={{ color: 'var(--text-main)' }}>
                        MedCheck AI is designed with HIPAA and GDPR standards in mind. No patient-identifiable information (PII) is stored on our servers. All interaction checks are processed using anonymized drug identifiers.
                    </p>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Globe size={24} className="text-muted" />
                        <div>
                            <div style={{ fontWeight: '600' }}>Official Website</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>www.medcheck.ai</div>
                        </div>
                    </div>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Mail size={24} className="text-muted" />
                        <div>
                            <div style={{ fontWeight: '600' }}>Clinical Support</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>support@medcheck.ai</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                &copy; 2026 MedCheck AI Inc. Version 2.4.0-stable
            </div>
        </div>
    );
};

export default AboutPage;
