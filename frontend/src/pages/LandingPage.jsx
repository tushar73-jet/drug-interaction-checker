import React, { useState, useEffect } from 'react';
import { Heart, Shield, Zap, Users, ArrowRight, Check, Menu, X, ShieldAlert, Lock, ClipboardCheck, LayoutDashboard, Database, Cpu, Globe, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({ totalDrugs: '1,700+', totalInteractions: '190,000+', accuracy: '99.9%' });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
        const response = await fetch(`${API_BASE_URL}/api/v1/drugs/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalDrugs: data.totalDrugs.toLocaleString() + '+',
            totalInteractions: data.totalInteractions.toLocaleString() + '+',
            accuracy: '99.9%'
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  const navLinks = [
    { name: 'Features', id: 'features' },
    { name: 'How It Works', id: 'how-it-works' },
    { name: 'Safety', id: 'safety' }
  ];

  return (
    <div style={{ background: '#020617', color: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scrolled ? '1rem 2rem' : '1.5rem 2rem',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: scrolled ? 'rgba(2, 6, 23, 0.85)' : 'transparent',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(20, 184, 166, 0.1)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        zIndex: 1000
      }}>
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ 
            fontSize: '1.5rem', 
            fontWeight: '800', 
            color: '#14b8a6', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            cursor: 'pointer'
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <ShieldAlert size={24} />
          </div>
          MedCheck
        </div>
        
        {/* Desktop Menu */}
        <div style={{ display: 'none' }} className="lg:flex">
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <a 
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                style={{ 
                  cursor: 'pointer', 
                  textDecoration: 'none', 
                  color: '#94a3b8',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#14b8a6'}
                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/login')}
            className="desktop-only"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
          >
            Login
          </button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')} 
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              boxShadow: '0 4px 14px 0 rgba(20, 184, 166, 0.39)'
            }}
          >
            Get Started
          </motion.button>
          
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-toggle"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#14b8a6', 
              display: 'none',
              padding: '0.5rem'
            }}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '70px',
              left: '1rem',
              right: '1rem',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '2rem',
              zIndex: 900,
              border: '1px solid rgba(20, 184, 166, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}
          >
            {navLinks.map((link) => (
              <a 
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f8fafc' }}
              >
                {link.name}
              </a>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
            <button 
              onClick={() => navigate('/login')}
              style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#14b8a6', fontSize: '1.1rem', fontWeight: '600' }}
            >
              Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 1024px) {
          .lg\\:flex { display: flex !important; }
        }
        @media (max-width: 1023px) {
          .mobile-toggle { display: block !important; }
          .desktop-only { display: none !important; }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .tech-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #94a3b8;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }
        .tech-badge:hover {
          background: rgba(13, 148, 136, 0.1);
          border-color: rgba(13, 148, 136, 0.3);
          color: #14b8a6;
          transform: translateY(-2px);
        }
      `}</style>

      {/* Hero Section */}
      <section style={{
        padding: '10rem 2rem 4rem',
        textAlign: 'center',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        {/* Background glow effects */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, rgba(2, 6, 23, 0) 70%)',
          zIndex: -1
        }} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '900px' }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.25rem',
            background: 'rgba(20, 184, 166, 0.1)',
            borderRadius: '50px',
            border: '1px solid rgba(20, 184, 166, 0.2)',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#2dd4bf'
          }}>
            <Database size={16} /> Clinical Intelligence v2.0
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
            fontWeight: '900',
            marginBottom: '1.5rem',
            lineHeight: '1.1',
            background: 'linear-gradient(to right, #f8fafc, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            Prevent Drug Interactions.
            <br />
            <span style={{ 
              background: 'linear-gradient(to right, #2dd4bf, #14b8a6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Elevate Patient Safety.</span>
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
            marginBottom: '3rem',
            maxWidth: '700px',
            margin: '0 auto 3rem',
            lineHeight: '1.6'
          }}>
            MedCheck leverages clinical-grade intelligence to analyze potential 
            drug-drug interactions in seconds, providing clinicians with actionable insights.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')} 
              style={{
                padding: '1.25rem 2.5rem',
                background: '#14b8a6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              Get Started <ArrowRight size={22} />
            </motion.button>
            <motion.button 
              whileHover={{ background: 'rgba(20, 184, 166, 0.1)' }}
              onClick={() => scrollToSection('features')}
              style={{
                padding: '1.25rem 2.5rem',
                background: 'transparent',
                color: '#f8fafc',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1.1rem'
              }}
            >
              Learn More
            </motion.button>
          </div>

          {/* New Technology Stack Section */}
          <div style={{ marginTop: '4rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="tech-badge">
              <Server size={14} /> Node.js
            </div>
            <div className="tech-badge">
              <Cpu size={14} /> Prisma
            </div>
            <div className="tech-badge">
              <Database size={14} /> MongoDB
            </div>
            <div className="tech-badge">
              <Globe size={14} /> React
            </div>
          </div>

          <div style={{
            marginTop: '5rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '4rem',
            flexWrap: 'wrap',
            padding: '2.5rem',
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {[
              { label: 'Drugs Analyzed', value: stats.totalDrugs },
              { label: 'Interactions Matrix', value: stats.totalInteractions },
              { label: 'Clinical Accuracy', value: stats.accuracy }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#14b8a6', marginBottom: '0.25rem' }}>{stat.value}</div>
                <div style={{ color: '#64748b', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Walkthrough Section */}
      <section id="features" style={{
        padding: '8rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '900',
            marginBottom: '1.5rem',
            color: '#f8fafc',
            letterSpacing: '-0.02em'
          }}>
            Feature Walkthrough
          </h2>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Technical capabilities designed for clinical precision.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem'
        }}>
          {[
            {
              icon: <Zap size={40} />,
              title: 'O(1) Search Performance',
              desc: 'High-speed medication indexing and search using sub-millisecond prefix matching logic.',
              color: '#0ea5e9'
            },
            {
              icon: <LayoutDashboard size={40} />,
              title: 'Interactive Network Mapping',
              desc: 'Dynamic graph visualization powered by React Flow for complex multi-drug relationship analysis.',
              color: '#8b5cf6'
            },
            {
              icon: <Shield size={40} />,
              title: 'Secure PRISMA ORM Layer',
              desc: 'Type-safe database interactions protecting sensitive clinical data with enterprise-grade ORM.',
              color: '#14b8a6'
            },
            {
              icon: <Lock size={40} />,
              title: 'HIPAA Compliant Vault',
              desc: 'End-to-end encryption for patient profiles and clinician notes using industry-standard protocols.',
              color: '#f43f5e'
            }
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, background: 'rgba(20, 184, 166, 0.05)', borderColor: 'rgba(20, 184, 166, 0.2)' }}
              style={{
                padding: '2.5rem',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default'
              }}
            >
              <div style={{ 
                width: '70px', 
                height: '70px', 
                borderRadius: '16px', 
                background: `${feature.color}15`, 
                color: feature.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: '#f8fafc', letterSpacing: '-0.01em' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.7', fontSize: '1.05rem' }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Professional Workflow */}
      <section id="how-it-works" style={{
        padding: '8rem 2rem',
        background: 'rgba(15, 23, 42, 0.3)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '900',
            textAlign: 'center',
            marginBottom: '5rem',
            color: '#f8fafc'
          }}>
            Technical Workflow
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '4rem',
            position: 'relative'
          }}>
            {[
              { number: '01', title: 'Medication Entry', desc: 'Secure input of medication regimens via our type-validated search interface.' },
              { number: '02', title: 'Engine Analysis', desc: 'Backend identification of clinical interaction clusters across the profile matrix.' },
              { number: '03', title: 'Risk Verification', desc: 'Review of machine-generated severity ratings and physiological mechanism reports.' },
              { number: '04', title: 'Data Archival', desc: 'Secure persistence of clinical documentation with encrypted metadata storage.' }
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'left', position: 'relative' }}>
                <div style={{
                  fontSize: '4rem',
                  fontWeight: '900',
                  color: 'rgba(20, 184, 166, 0.1)',
                  position: 'absolute',
                  top: '-30px',
                  left: '-10px',
                  zIndex: 0
                }}>
                  {step.number}
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: '#14b8a6' }}>
                    {step.title}
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" style={{
        padding: '8rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(13, 148, 136, 0.05) 100%)',
          borderRadius: '32px',
          padding: '4rem',
          border: '1px solid rgba(20, 184, 166, 0.2)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '900',
            marginBottom: '3rem',
            color: '#f8fafc'
          }}>
            Secure Infrastructure
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem'
          }}>
            {[
              { icon: <Lock size={32} />, title: 'Advanced Encryption', desc: 'AES-256 bit encryption for all rest data and TLS 1.3 for data in transit.' },
              { icon: <Shield size={32} />, title: 'System Validation', desc: 'Continuous integration of clinical databases with automated integrity checks.' },
              { icon: <Users size={32} />, title: 'RBAC Controls', desc: 'Granular Role-Based Access Control for hospital and clinical deployments.' },
              { icon: <ClipboardCheck size={32} />, title: 'Audit Readiness', desc: 'Immutable log archiving for rigorous medical compliance auditing.' }
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ color: '#14b8a6', marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem', color: '#f8fafc' }}>
                  {item.title}
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '8rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #020617 0%, #0d9488 200%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
        >
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '900',
            marginBottom: '1.5rem',
            color: '#f8fafc'
          }}>
            Ready to Deploy Clinical Intelligence?
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: '#cbd5e1',
            marginBottom: '3rem',
            maxWidth: '650px',
            margin: '0 auto 3rem'
          }}>
            Start your free clinician trial of MedCheck today and modernize your patient safety protocols.
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')} 
            style={{
              padding: '1.25rem 3rem',
              background: 'white',
              color: '#0d9488',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '1.1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 30px -5px rgba(255,255,255,0.2)'
            }}
          >
            Get Started Now <ArrowRight size={22} />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '5rem 2rem 3rem',
        background: '#020617',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '4rem',
          marginBottom: '4rem'
        }}>
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ 
              color: '#14b8a6', 
              fontWeight: '900', 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ShieldAlert size={24} /> MedCheck
            </div>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6' }}>
              Advanced clinical decision support for multi-drug interaction analysis and patient safety documentation.
            </p>
          </div>
          
          {[
            {
              title: 'Product',
              links: [
                { name: 'Checker', path: '/dashboard/checker' },
                { name: 'History', path: '/dashboard/history' },
                { name: 'Documentation', path: '#' },
              ]
            },
            {
              title: 'Company',
              links: [
                { name: 'About Us', path: '/dashboard/about' },
                { name: 'Clinical Policy', path: '#' },
                { name: 'Security', path: '/hipaa' },
              ]
            },
            {
              title: 'Legal',
              links: [
                { name: 'HIPAA Compliance', path: '/hipaa' },
                { name: 'Privacy Policy', path: '#' },
                { name: 'Terms of Service', path: '#' },
                { name: 'Clinical Disclaimer', path: '/disclaimer' },
              ]
            }
          ].map((col, i) => (
            <div key={i}>
              <div style={{ color: '#f8fafc', fontWeight: '800', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.05em' }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {col.links.map((link, j) => (
                  <div 
                    key={j} 
                    onClick={() => link.path !== '#' && navigate(link.path)}
                    style={{ 
                      cursor: link.path !== '#' ? 'pointer' : 'default', 
                      color: '#64748b', 
                      fontSize: '1rem',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => link.path !== '#' && (e.target.style.color = '#14b8a6')}
                    onMouseLeave={(e) => link.path !== '#' && (e.target.style.color = '#64748b')}
                  >
                    {link.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#475569',
          fontSize: '0.9rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>© 2026 MedCheck Clinical. Powered by Node.js, Prisma, and MongoDB.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Heart size={18} />
            <Shield size={18} />
            <Users size={18} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
