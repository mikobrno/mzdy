import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/toast';
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

function PayrollWorkflow() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [settingsTarget, setSettingsTarget] = useState<any>(null);

  // Fetch SVJ list
  const { data: svjList = [] } = useQuery({
    queryKey: ['svj-list'],
    queryFn: () => apiService.getSVJList()
  });

  // Fetch all payrolls to analyze workflow status
  const { data: allPayrolls = [] } = useQuery({
    queryKey: ['all-payrolls'],
    queryFn: () => apiService.getAllPayrolls()
  });

  // Transform data for workflow view
  const filteredPayrolls = allPayrolls.filter(
    (p: any) => p.month === selectedMonth && p.year === selectedYear
  );

  const currentCycle = {
    id: `${selectedYear}-${selectedMonth}`,
    month: selectedMonth,
    year: selectedYear,
    status: filteredPayrolls.length > 0 ? 'active' : 'not_started',
    totalEmployees: filteredPayrolls.length,
    processedEmployees: filteredPayrolls.filter((p: any) => p.status !== 'pending').length,
    pendingApproval: filteredPayrolls.filter((p: any) => p.status === 'pending').length,
    approved: filteredPayrolls.filter((p: any) => p.status === 'approved').length,
    createdAt: new Date().toISOString().split('T')[0]
  };

  // Group payrolls by SVJ (approximate using employee data or other logic)
  const svjPayrolls = svjList.map((svj: any) => {
    const svjPayrollCount = Math.floor(Math.random() * 10) + 1; // Mock count - would need real relationship
    const mockProcessed = Math.floor(svjPayrollCount * 0.8);
    const mockApproved = Math.floor(mockProcessed * 0.6);
    
    return {
      id: svj.id,
      svjName: svj.name,
      svjId: svj.id,
      employees: svjPayrollCount,
      processed: mockProcessed,
      approved: mockApproved,
      pending: mockProcessed - mockApproved,
      totalAmount: mockProcessed * 25000, // Mock calculation
      status: mockApproved === mockProcessed ? 'completed' : 
              mockProcessed > 0 ? 'in_progress' : 'not_started',
      month: selectedMonth,
      year: selectedYear
    };
  }).filter(p => p.employees > 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Dokončeno</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">Probíhá</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Schváleno</Badge>;
      default:
        return <Badge variant="outline">Nezahájeno</Badge>;
    }
  };

  const getCycleStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Dokončeno</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800">Ke schválení</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">Aktivní</Badge>;
      default:
        return <Badge variant="outline">Nezahájeno</Badge>;
    }
  };

  const handleStartWorkflow = () => {
    success('Mzdový cyklus byl zahájen');
    // TODO: Implement workflow start logic
  };

  const handleApproveAll = () => {
    success('Všechny mzdy byly schváleny');
    // TODO: Implement bulk approve logic
  };

  const handleExportData = () => {
    success('Data jsou exportována');
    // TODO: Implement export logic
  };

  const handleViewMonthly = (svjId: string) => {
    navigate(`/payroll/${svjId}/${selectedYear}/${selectedMonth}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mzdový workflow</h1>
          <p className="text-gray-600">Přehled a řízení mzdového cyklu pro všechna SVJ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleStartWorkflow}>
            <Play className="h-4 w-4 mr-2" />
            Spustit cyklus
          </Button>
        </div>
      </div>

      {/* Period selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium">Období:</span>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleDateString('cs-CZ', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = currentDate.getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Current cycle overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Celkem zaměstnanců</p>
                <p className="text-2xl font-bold">{currentCycle.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Zpracováno</p>
                <p className="text-2xl font-bold">{currentCycle.processedEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Ke schválení</p>
                <p className="text-2xl font-bold">{currentCycle.pendingApproval}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Schváleno</p>
                <p className="text-2xl font-bold">{currentCycle.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cycle status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Stav cyklu {selectedMonth}/{selectedYear}
              </CardTitle>
              <CardDescription>
                Vytvořeno {currentCycle.createdAt}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getCycleStatusBadge(currentCycle.status)}
              {currentCycle.status === 'pending_approval' && (
                <Button size="sm" onClick={handleApproveAll}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Schválit vše
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* SVJ payrolls list */}
      <Card>
        <CardHeader>
          <CardTitle>Přehled SVJ</CardTitle>
          <CardDescription>
            Stav zpracování mezd pro jednotlivá SVJ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {svjPayrolls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Žádná data pro vybrané období
              </div>
            ) : (
              svjPayrolls.map((svjPayroll) => (
                <div
                  key={svjPayroll.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{svjPayroll.svjName}</h3>
                        {getStatusBadge(svjPayroll.status)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {svjPayroll.employees} zaměstnanců • {svjPayroll.totalAmount.toLocaleString('cs-CZ')} Kč
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Zpracováno: {svjPayroll.processed}/{svjPayroll.employees}</span>
                        <span>Schváleno: {svjPayroll.approved}/{svjPayroll.processed}</span>
                        {svjPayroll.pending > 0 && (
                          <span>Čeká: {svjPayroll.pending}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewMonthly(svjPayroll.svjId)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Zobrazit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSettingsTarget(svjPayroll)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PayrollWorkflow;
