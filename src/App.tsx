import { HashRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import DashboardPage from './pages/Dashboard';
import GaragePage from './pages/Garage';
import CarDetailPage from './pages/CarDetail';
import ExpensesPage from './pages/Expenses';
import InsurancePage from './pages/Insurance';
import CarteaVerdePage from './pages/CarteaVerde';
import SettingsPage from './pages/Settings';
import NotFoundPage from './pages/NotFound';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ShareLandingPage from './pages/ShareLanding';

export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/share/:token" element={<ShareLandingPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="garage" element={<GaragePage />} />
            <Route path="garage/:id" element={<CarDetailPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="insurance" element={<InsurancePage />} />
            <Route path="cartea-verde" element={<CarteaVerdePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
