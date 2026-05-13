import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import CheckerPage from './pages/CheckerPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import LandingPage from './pages/LandingPage';
import DisclaimerPage from './pages/DisclaimerPage';
import HIPAAPage from './pages/HIPAAPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/*" element={<LoginPage />} />
          <Route path="/signup/*" element={<SignUpPage />} />
          <Route path="/hipaa" element={<HIPAAPage />} />

          {/* Clinical Disclaimer Workflow (Semi-Protected) */}
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          
          {/* Protected Clinical App Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="checker" element={<CheckerPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
