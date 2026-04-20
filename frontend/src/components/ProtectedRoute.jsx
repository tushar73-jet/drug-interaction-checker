import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0f172a',
        color: '#14b8a6'
      }}>
        <div className="animate-pulse" style={{ fontWeight: '600' }}>Verifying clinician credentials...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
