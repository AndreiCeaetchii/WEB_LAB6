import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import DashboardPage from './pages/Dashboard';
import GaragePage from './pages/Garage';
import CarDetailPage from './pages/CarDetail';
import ExpensesPage from './pages/Expenses';
import InsurancePage from './pages/Insurance';
import CarteaVerdePage from './pages/CarteaVerde';
import SettingsPage from './pages/Settings';
import NotFoundPage from './pages/NotFound';

export default function App() {
  return (
    <HashRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route element={<Layout />}>
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
    </HashRouter>
  );
}
