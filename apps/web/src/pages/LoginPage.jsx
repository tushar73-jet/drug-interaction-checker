import React from 'react';
import { SignIn } from '@clerk/react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const { isSignedIn, isLoaded } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isLoaded && isSignedIn) {
            navigate('/dashboard');
        }
    }, [isLoaded, isSignedIn, navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)',
            padding: '1.5rem',
            flexDirection: 'column',
            gap: '2rem'
        }}>
            <div style={{ textAlign: 'center', color: 'white', marginBottom: '1rem' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <ShieldAlert size={32} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>MedCheck</h1>
                <p style={{ opacity: 0.8, fontWeight: '600', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Drug Interaction Analyzer</p>
            </div>

            <SignIn 
                appearance={{
                    elements: {
                        formButtonPrimary: 'bg-primary hover:bg-primary-dark',
                        card: 'shadow-2xl border-none'
                    }
                }}
                signUpUrl="/signup"
                routing="path"
                path="/login"
            />
        </div>
    );
};

export default LoginPage;
