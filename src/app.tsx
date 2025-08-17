import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from '@/components/layout/navigation'
import Dashboard from '@/pages/dashboard'
import SVJDetail from '@/pages/svj-detail'
import SVJListPage from '@/pages/svj'
import SVJNewPage from '@/pages/svj-new'
import EmployeesPage from '@/pages/employees'
import PayrollPage from '@/pages/payroll'
import EmployeeDetailPage from './pages/employee-detail'
import EmployeeEditPage from './pages/employee-edit'
import EmployeeNewPage from './pages/employee-new'
import Templates from '@/pages/templates'
import TemplateEditor from '@/pages/template-editor'
import Settings from '@/pages/settings'
import DynamicVariables from '@/pages/dynamic-variables'
import PayrollMonthly from '@/pages/payroll-monthly'
import CommunicationCampaigns from '@/pages/communication-campaigns'
import SettingsMain from '@/pages/settings-main'
import EmailSettings from '@/pages/settings-email'
import TaxSettings from '@/pages/settings-taxes'
import UserSettings from '@/pages/settings-users'
import ApiSettings from '@/pages/settings-api'
import SecuritySettings from '@/pages/settings-security'
import CompanySettings from '@/pages/settings-company'
import DocumentsSettings from '@/pages/settings-documents'
import BackupSettings from '@/pages/settings-backup'
import NotificationsSettings from '@/pages/settings-notifications'
import AppearanceSettings from '@/pages/settings-appearance'
import SystemSettings from '@/pages/settings-system'
import BillingSettings from '@/pages/settings-billing'
import ProfileSettings from '@/pages/profile-settings'
import NotificationCenter from '@/pages/notification-center'
import PdfTemplatesPage from '@/pages/pdf-templates'
import PdfGeneratorPage from '@/pages/pdf-generator'
import PdfHubPage from '@/pages/pdf'
import EmailComposePage from '@/pages/email-compose'
// auth provider is applied in main.tsx; no local provider here

// Placeholder pages for other routes

function EmployeesPageLegacy() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Zaměstnanci</h1>
      <p className="text-gray-600">Zde bude seznam všech zaměstnanců napříč SVJ.</p>
    </div>
  )
}

 

function CommunicationPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Komunikační modul</h1>
      <p className="text-gray-600">Zde budou e-mailové šablony a kampaně.</p>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Nastavení</h1>
      <p className="text-gray-600">Zde bude konfigurace systému a uživatelských práv.</p>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      {/* Main content */}
      <main className="ml-64 min-h-screen">
        <div className="container mx-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/svj" element={<SVJListPage />} />
            <Route path="/svj/new" element={<SVJNewPage />} />
            <Route path="/svj/:id" element={<SVJDetail />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/new" element={<EmployeeNewPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/payroll/:svjId/:year/:month" element={<PayrollMonthly />} />
            {/* Backward compatibility redirects */}
            <Route path="/salaries/:svjId/:year/:month" element={<PayrollMonthly />} />
            <Route path="/salaries/*" element={<PayrollPage />} />
            <Route path="/payroll-workflow" element={<PayrollPage />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/new" element={<TemplateEditor />} />
            <Route path="/templates/:id/edit" element={<TemplateEditor />} />
            <Route path="/dynamic-variables" element={<DynamicVariables />} />
            <Route path="/communication-campaigns" element={<CommunicationCampaigns />} />
            <Route path="/communication/*" element={<CommunicationPage />} />
            <Route path="/pdf" element={<PdfHubPage />} />
            {/* Backward compatibility */}
            <Route path="/pdf-templates" element={<PdfHubPage />} />
            <Route path="/pdf-generator" element={<PdfHubPage />} />
            <Route path="/email-compose" element={<EmailComposePage />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/settings" element={<SettingsMain />} />
            <Route path="/settings/email" element={<EmailSettings />} />
            <Route path="/settings/taxes" element={<TaxSettings />} />
            <Route path="/settings/users" element={<UserSettings />} />
            <Route path="/settings/api" element={<ApiSettings />} />
            <Route path="/settings/security" element={<SecuritySettings />} />
            <Route path="/settings/company" element={<CompanySettings />} />
            <Route path="/settings/documents" element={<DocumentsSettings />} />
            <Route path="/settings/backup" element={<BackupSettings />} />
            <Route path="/settings/notifications" element={<NotificationsSettings />} />
            <Route path="/settings/appearance" element={<AppearanceSettings />} />
            <Route path="/settings/system" element={<SystemSettings />} />
            <Route path="/settings/billing" element={<BillingSettings />} />
            <Route path="/settings/*" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}