import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/layout';
import { ProtectedRoute } from './components/auth/protected-route';
import DashboardPage from './pages/dashboard';
import { SvjPage, SvjDetailPage, SvjNewPage, SvjEditPage } from './modules/svj';
import { EmployeesPage, EmployeeDetailPage, EmployeeNewPage, EmployeeEditPage } from './modules/employees';
import { PayrollsPage, PayrollNewPage, PayrollDetailPage, PayrollEditPage } from './modules/payrolls';
import { HealthInsuranceCompaniesPage } from './modules/health-insurance-companies';
import PayrollPage from './pages/payroll';
import PayrollMonthly from './pages/payroll-monthly';
import { PdfTemplatesPage } from './modules/pdf-templates';
import { ExecutionsPage } from './modules/executions';
import { PayrollDeductionsPage } from './modules/payroll-deductions';
import { LoginPage } from './pages/login.page';
import { useAuth } from '@/hooks/use-auth'; // use consistent import
import { ToastProvider } from './components/ui/toast';
import SettingsMainPage from './pages/settings-main';
import EmailSettingsPage from './pages/settings-email';
import TaxSettingsPage from './pages/settings-taxes';
import UserSettingsPage from './pages/settings-users';
import ApiSettingsPage from './pages/settings-api';
import SecuritySettingsPage from './pages/settings-security';
import CompanySettingsPage from './pages/settings-company';
import AppearanceSettingsPage from './pages/settings-appearance';
import BackupSettingsPage from './pages/settings-backup';
import BillingSettingsPage from './pages/settings-billing';
import DocumentsSettingsPage from './pages/settings-documents';
import NotificationsSettingsPage from './pages/settings-notifications';
import SystemSettingsPage from './pages/settings-system';

// Komponenta, která seskupuje všechny chráněné stránky
function ProtectedPages() {
  const { user, isLoading } = useAuth();
  console.log("Stav autentizace:", { user, isLoading });

  return (
    <ProtectedRoute>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          {/* SVJ Routes */}
          <Route path="/svj" element={<SvjPage />} />
          <Route path="/svj/new" element={<SvjNewPage />} />
          <Route path="/svj/:id" element={<SvjDetailPage />} />
          <Route path="/svj/:id/edit" element={<SvjEditPage />} />
          {/* Employee Routes */}
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/new" element={<EmployeeNewPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />
          {/* Ostatní routy */}
          <Route path="/payrolls" element={<PayrollsPage />} />
          <Route path="/payrolls/new" element={<PayrollNewPage />} />
          <Route path="/payrolls/:id" element={<PayrollDetailPage />} />
          <Route path="/payrolls/:id/edit" element={<PayrollEditPage />} />
          {/* Payroll index and monthly view (legacy singular path used in multiple places) */}
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/payroll/:svjId/:year/:month" element={<PayrollMonthly />} />
          <Route path="/health-insurance-companies" element={<HealthInsuranceCompaniesPage />} />
          <Route path="/pdf-templates" element={<PdfTemplatesPage />} />
          {/* Settings routes (restore older UI) */}
          <Route path="/settings" element={<SettingsMainPage />} />
          <Route path="/settings/main" element={<SettingsMainPage />} />
          <Route path="/settings/email" element={<EmailSettingsPage />} />
          <Route path="/settings/taxes" element={<TaxSettingsPage />} />
          <Route path="/settings/api" element={<ApiSettingsPage />} />
          <Route path="/settings/users" element={<UserSettingsPage />} />
          <Route path="/settings/company" element={<CompanySettingsPage />} />
          <Route path="/settings/documents" element={<DocumentsSettingsPage />} />
          <Route path="/settings/appearance" element={<AppearanceSettingsPage />} />
          <Route path="/settings/backup" element={<BackupSettingsPage />} />
          <Route path="/settings/billing" element={<BillingSettingsPage />} />
          <Route path="/settings/notifications" element={<NotificationsSettingsPage />} />
          <Route path="/settings/security" element={<SecuritySettingsPage />} />
          <Route path="/settings/system" element={<SystemSettingsPage />} />
          <Route path="/executions" element={<ExecutionsPage />} />
          <Route path="/payroll-deductions" element={<PayrollDeductionsPage />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Veřejná routa pro přihlášení */}
        <Route path="/login" element={<LoginPage />} />

        {/* Všechny ostatní cesty jsou nyní chráněné */}
        <Route path="/*" element={<ProtectedPages />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
