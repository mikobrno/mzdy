import { Route, Routes } from 'react-router-dom';
import { DashboardPage } from './pages/dashboard';
import { SvjPage, SvjDetailPage, SvjNewPage } from './modules/svj';
import { EmployeesPage, EmployeeDetailPage, EmployeeNewPage, EmployeeEditPage } from './modules/employees';
import { PayrollsPage } from './modules/payrolls';
import { HealthInsuranceCompaniesPage } from './modules/health-insurance-companies';
import { PdfTemplatesPage } from './modules/pdf-templates';
import { ExecutionsPage } from './modules/executions';
import { PayrollDeductionsPage } from './modules/payroll-deductions';
import { Layout } from './components/layout/layout';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Dočasně přesměrujeme hlavní stránku na SVJ, než opravíme Dashboard */}
        <Route path="/" element={<SvjPage />} />
        
        {/* SVJ Routes */}
        <Route path="/svj" element={<SvjPage />} />
        <Route path="/svj/new" element={<SvjNewPage />} />
        <Route path="/svj/:id" element={<SvjDetailPage />} />

        {/* Employee Routes */}
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/employees/new" element={<EmployeeNewPage />} />
        <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />
        
        {/* Ostatní routy, které budeme postupně opravovat */}
        <Route path="/payrolls" element={<PayrollsPage />} />
        <Route path="/health-insurance-companies" element={<HealthInsuranceCompaniesPage />} />
        <Route path="/pdf-templates" element={<PdfTemplatesPage />} />
        <Route path="/executions" element={<ExecutionsPage />} />
        <Route path="/payroll-deductions" element={<PayrollDeductionsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
