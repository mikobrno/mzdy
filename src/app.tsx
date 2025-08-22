import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/layout';
import { ProtectedRoute } from './components/auth/protected-route';
import { DashboardPage } from './pages/dashboard';
import { SvjPage, SvjDetailPage, SvjNewPage, SvjEditPage } from './modules/svj';
import { EmployeesPage, EmployeeDetailPage, EmployeeNewPage, EmployeeEditPage } from './modules/employees';
import { PayrollsPage, PayrollNewPage, PayrollDetailPage, PayrollEditPage } from './modules/payrolls';
import { HealthInsuranceCompaniesPage } from './modules/health-insurance-companies';
import { PdfTemplatesPage } from './modules/pdf-templates';
import { ExecutionsPage } from './modules/executions';
import { PayrollDeductionsPage } from './modules/payroll-deductions';
import { LoginPage } from './pages/login.page';
import { useAuth } from '@/hooks/use-auth'; // use consistent import

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
          <Route path="/health-insurance-companies" element={<HealthInsuranceCompaniesPage />} />
          <Route path="/pdf-templates" element={<PdfTemplatesPage />} />
          <Route path="/executions" element={<ExecutionsPage />} />
          <Route path="/payroll-deductions" element={<PayrollDeductionsPage />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Routes>
      {/* Veřejná routa pro přihlášení */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Všechny ostatní cesty jsou nyní chráněné */}
      <Route path="/*" element={<ProtectedPages />} />
    </Routes>
  );
}

export default App;
