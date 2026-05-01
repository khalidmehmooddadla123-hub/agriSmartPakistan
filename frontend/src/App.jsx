import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Prices from './pages/Prices';
import Weather from './pages/Weather';
import News from './pages/News';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AdminPanel from './pages/admin/AdminPanel';
import DiseaseDetection from './pages/DiseaseDetection';
import NotFound from './pages/NotFound';
import CropMap from './pages/CropMap';
import FarmTools from './pages/FarmTools';
import IrrigationCalc from './pages/tools/IrrigationCalc';
import FertilizerCalc from './pages/tools/FertilizerCalc';
import YieldPredictor from './pages/tools/YieldPredictor';
import CropRotation from './pages/tools/CropRotation';
import ZakatCalc from './pages/tools/ZakatCalc';
import ExpenseTracker from './pages/ExpenseTracker';
import Marketplace from './pages/Marketplace';
import Forum from './pages/Forum';
import Subsidies from './pages/Subsidies';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Farms from './pages/Farms';
import FarmDetail from './pages/FarmDetail';
import CropCalendar from './pages/CropCalendar';
import Onboarding from './pages/Onboarding';
import SoilTests from './pages/SoilTests';
import Equipment from './pages/Equipment';
import Help from './pages/Help';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-lg">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-lg">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return user.role === 'admin' ? children : <Navigate to="/dashboard" />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-lg">Loading...</div>;
  return user ? <Navigate to="/dashboard" /> : children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/prices" element={<ProtectedRoute><Prices /></ProtectedRoute>} />
          <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
          <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/disease" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><CropMap /></ProtectedRoute>} />
          <Route path="/tools" element={<ProtectedRoute><FarmTools /></ProtectedRoute>} />
          <Route path="/tools/irrigation" element={<ProtectedRoute><IrrigationCalc /></ProtectedRoute>} />
          <Route path="/tools/fertilizer" element={<ProtectedRoute><FertilizerCalc /></ProtectedRoute>} />
          <Route path="/tools/yield" element={<ProtectedRoute><YieldPredictor /></ProtectedRoute>} />
          <Route path="/tools/rotation" element={<ProtectedRoute><CropRotation /></ProtectedRoute>} />
          <Route path="/tools/zakat" element={<ProtectedRoute><ZakatCalc /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><ExpenseTracker /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
          <Route path="/subsidies" element={<ProtectedRoute><Subsidies /></ProtectedRoute>} />
          <Route path="/farms" element={<ProtectedRoute><Farms /></ProtectedRoute>} />
          <Route path="/farms/:id" element={<ProtectedRoute><FarmDetail /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CropCalendar /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/soil-tests" element={<ProtectedRoute><SoilTests /></ProtectedRoute>} />
          <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin/*" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
