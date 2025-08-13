import { Routes, Route } from 'react-router-dom'
import { createContext } from 'react'
import Navigation from '@/components/layout/navigation'
import Dashboard from '@/pages/dashboard'
import { AuthContext, useAuthProvider } from '@/hooks/use-auth'

// Placeholder pages for other routes
function SVJPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Správa SVJ</h1>
      <p className="text-gray-600">Zde bude seznam všech SVJ a možnost jejich správy.</p>
    </div>
  )
}

function EmployeesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Zaměstnanci</h1>
      <p className="text-gray-600">Zde bude seznam všech zaměstnanců napříč SVJ.</p>
    </div>
  )
}

function SalariesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Mzdová agenda</h1>
      <p className="text-gray-600">Zde bude správa mezd, výpočty a schvalování.</p>
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
  const auth = useAuthProvider()

  return (
    <AuthContext.Provider value={auth}>
      <div className="min-h-screen gradient-bg">
        <Navigation />
        
        {/* Main content */}
        <main className="ml-64 min-h-screen">
          <div className="container mx-auto p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/svj/*" element={<SVJPage />} />
              <Route path="/employees/*" element={<EmployeesPage />} />
              <Route path="/salaries/*" element={<SalariesPage />} />
              <Route path="/communication/*" element={<CommunicationPage />} />
              <Route path="/settings/*" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </AuthContext.Provider>
  )
}