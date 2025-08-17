import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  CalendarDays, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Download,
  Eye,
  Settings,
  Play,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data pro mzdový workflow
const mockPayrollCycles = [
  {
    id: '1',
    month: 12,
    year: 2025,
    status: 'completed',
    totalEmployees: 45,
    processedEmployees: 45,
    pendingApproval: 0,
    approved: 45,
    createdAt: '2025-12-01',
    approvedAt: '2025-12-15',
    approvedBy: 'Hlavní účetní'
  },
  {
    id: '2', 
    month: 1,
    year: 2026,
    status: 'pending_approval',
    totalEmployees: 47,
    processedEmployees: 47,
    pendingApproval: 47,
    approved: 0,
    createdAt: '2026-01-01',
    approvedAt: null,
    approvedBy: null
  }
];

const mockSVJPayrolls = [
  {
    svjId: '1',
    svjName: 'Dřevařská 851/4',
    month: 1,
    year: 2026,
    status: 'ready_for_approval',
    employeeCount: 3,
    totalGrossSalary: 45000,
    totalNetSalary: 33750,
    lastModified: '2026-01-10',
    documents: {
      payslips: true,
      bankTransfer: false,
      csszXml: false,
      healthInsuranceXml: false
    }
  },
  {
    svjId: '2', 
    svjName: 'Knihovky 318',
    month: 1,
    year: 2026,
    status: 'in_progress',
    employeeCount: 2,
    totalGrossSalary: 28000,
    totalNetSalary: 21000,
    lastModified: '2026-01-08',
    documents: {
      payslips: false,
      bankTransfer: false,
      csszXml: false,
      healthInsuranceXml: false
    }
  },
  {
    svjId: '3',
    svjName: 'Kotlářská 670/38',
    month: 1,
    year: 2026,
    status: 'approved',
    employeeCount: 5,
    totalGrossSalary: 67500,
    totalNetSalary: 50625,
    lastModified: '2026-01-12',
    documents: {
      payslips: true,
      bankTransfer: true,
      csszXml: true,
      healthInsuranceXml: true
    }
  }
];

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'in_progress':
      return { label: 'Zpracování', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    case 'ready_for_approval':
      return { label: 'Čeká na schválení', color: 'bg-blue-100 text-blue-800', icon: AlertTriangle };
    case 'approved':
      return { label: 'Schváleno', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    case 'completed':
      return { label: 'Dokončeno', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
    default:
      return { label: 'Neznámý', color: 'bg-gray-100 text-gray-800', icon: Clock };
  }
};

export default function PayrollWorkflow() {
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTarget, setSettingsTarget] = useState<null | typeof mockSVJPayrolls[number]>(null);

  const currentCycle = mockPayrollCycles.find(c => c.month === selectedMonth && c.year === selectedYear);
  const svjPayrolls = mockSVJPayrolls.filter(p => p.month === selectedMonth && p.year === selectedYear);

  const handleGenerateMonthlyPayrolls = () => {
    // Simulace automatického generování mezd
    console.log(`Generuji mzdy pro ${selectedMonth}/${selectedYear}`);
    setShowGenerateModal(false);
  };

  const handleApprovePayrolls = (svjId: string) => {
    console.log(`Schvaluji mzdy pro SVJ ${svjId}`);
  };

  const handleGenerateDocuments = (svjId: string, docType: string) => {
    console.log(`Generuji ${docType} pro SVJ ${svjId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mzdová agenda</h1>
          <p className="text-gray-600">Správa měsíčního mzdového workflow</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Automatické generování
          </Button>
          <Button className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Aktualizovat
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Výběr období
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-1">Měsíc</label>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Výběr měsíce"
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2025, i, 1).toLocaleString('cs-CZ', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rok</label>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Výběr roku"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Overview */}
      {currentCycle && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Users className="h-5 w-5" />
              Přehled mzdového cyklu - {selectedMonth}/{selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{currentCycle.totalEmployees}</div>
                <div className="text-sm">Celkem zaměstnanců</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentCycle.processedEmployees}</div>
                <div className="text-sm">Zpracováno</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{currentCycle.pendingApproval}</div>
                <div className="text-sm">Čeká na schválení</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentCycle.approved}</div>
                <div className="text-sm">Schváleno</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SVJ Payrolls List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Mzdy podle SVJ</h2>
        
        {svjPayrolls.map((payroll) => {
          const statusInfo = getStatusInfo(payroll.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <Card key={payroll.svjId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{payroll.svjName}</CardTitle>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <CardDescription>
                      {payroll.employeeCount} zaměstnanců • Hrubé mzdy: {payroll.totalGrossSalary.toLocaleString()} Kč • 
                      Čisté mzdy: {payroll.totalNetSalary.toLocaleString()} Kč
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      aria-label="Otevřít detail mezd"
                      onClick={() => navigate(`/salaries/${payroll.svjId}/${selectedYear}/${selectedMonth}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      aria-label="Nastavení mezd"
                      onClick={() => { setSettingsTarget(payroll); setShowSettingsModal(true); }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Workflow Actions */}
                  <div className="flex gap-2">
                    {payroll.status === 'ready_for_approval' && (
                      <Button 
                        onClick={() => handleApprovePayrolls(payroll.svjId)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Schválit mzdy
                      </Button>
                    )}
                    {payroll.status === 'approved' && (
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Schváleno dne {payroll.lastModified}
                      </div>
                    )}
                  </div>

                  {/* Document Generation */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Dokumenty a exporty:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Button 
                        variant={payroll.documents.payslips ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleGenerateDocuments(payroll.svjId, 'payslips')}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-3 w-3" />
                        {payroll.documents.payslips ? 'Stáhnout' : 'Generovat'} pásky
                      </Button>
                      <Button 
                        variant={payroll.documents.bankTransfer ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleGenerateDocuments(payroll.svjId, 'bankTransfer')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-3 w-3" />
                        {payroll.documents.bankTransfer ? 'Stáhnout' : 'Generovat'} XML Banka
                      </Button>
                      <Button 
                        variant={payroll.documents.csszXml ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleGenerateDocuments(payroll.svjId, 'csszXml')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-3 w-3" />
                        {payroll.documents.csszXml ? 'Stáhnout' : 'Generovat'} XML ČSSZ
                      </Button>
                      <Button 
                        variant={payroll.documents.healthInsuranceXml ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleGenerateDocuments(payroll.svjId, 'healthInsuranceXml')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-3 w-3" />
                        {payroll.documents.healthInsuranceXml ? 'Stáhnout' : 'Generovat'} XML ZP
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Poslední úprava: {payroll.lastModified}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Automatické generování mezd</CardTitle>
              <CardDescription>
                Vygenerovat mzdy pro {selectedMonth}/{selectedYear} ze všech aktivních zaměstnanců?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Systém vytvoří kopie mezd z předchozího měsíce pro všechny aktivní zaměstnance. 
                    Můžete je poté upravit podle potřeby.
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowGenerateModal(false)}>
                    Zrušit
                  </Button>
                  <Button onClick={handleGenerateMonthlyPayrolls}>
                    Generovat mzdy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

          {/* Settings Modal */}
          {showSettingsModal && settingsTarget && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Nastavení období</CardTitle>
                  <CardDescription>
                    {settingsTarget.svjName} — {selectedMonth}/{selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Automaticky generovat výplatní pásky</span>
                      <input type="checkbox" defaultChecked className="rounded" aria-label="Automaticky generovat výplatní pásky" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Automaticky vytvářet export pro banku</span>
                      <input type="checkbox" className="rounded" aria-label="Automaticky vytvářet export pro banku" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Povolit schvalování předsedou výboru</span>
                      <input type="checkbox" defaultChecked className="rounded" aria-label="Povolit schvalování předsedou výboru" />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <Button variant="outline" onClick={() => setShowSettingsModal(false)}>Zavřít</Button>
                      <Button onClick={() => { console.log('Ukládám nastavení období', settingsTarget.svjId, selectedMonth, selectedYear); setShowSettingsModal(false); }}>Uložit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
    </div>
  );
}
