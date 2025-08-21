import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  User, 
  Calculator, 
  FileText, 
  Download,
  Eye,
  Edit,
  Save,
  X,
  ArrowLeft,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Funkce pro mapování stavů mzdy
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'draft':
      return { label: 'Rozpracováno', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    case 'ready_for_approval':
      return { label: 'Připraveno ke schválení', color: 'bg-blue-100 text-blue-800', icon: AlertTriangle };
    case 'approved':
      return { label: 'Schváleno', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    case 'paid':
      return { label: 'Vyplaceno', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
    default:
      return { label: 'Neznámý', color: 'bg-gray-100 text-gray-800', icon: Clock };
  }
};

export default function PayrollDetail() {
  const { employeeId, svjId, year, month } = useParams<{ employeeId: string; svjId: string; year: string; month: string }>();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Query pro detail mzdy z Nhost
  const { data: payrollData, isLoading } = useQuery({
    queryKey: ['payroll-detail', employeeId, svjId, year, month],
    queryFn: () => apiService.getPayrollDetail(employeeId!, svjId!, parseInt(year!), parseInt(month!)),
    enabled: !!employeeId && !!svjId && !!year && !!month
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiService.updatePayrollRecord(employeeId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-detail', employeeId, svjId, year, month] });
      setIsEditing(false);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Načítání detailu mzdy...</span>
      </div>
    );
  }

  if (!payrollData) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Mzda nebyla nalezena
          </h3>
          <p className="text-gray-600 mb-4">
            Požadovaný záznam mzdy neexistuje
          </p>
          <Link to="/payroll">
            <Button>Zpět na přehled mezd</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(payrollData.status);
  const StatusIcon = statusInfo.icon;

  const handleSave = () => {
    console.log('Ukládám změny v mzdě');
    updateMutation.mutate(payrollData);
  };

  const handleApprove = () => {
    updateMutation.mutate({
      ...payrollData,
      status: 'approved'
    });
  };

  const handleGenerateDocument = (docType: string) => {
    console.log(`Generuji dokument: ${docType}`);
  };

  const handleRecalculate = () => {
    console.log('Přepočítávám mzdu');
    // Zde by byla logika pro přepočítání na základě změn
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět na seznam
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {payrollData?.employee?.name || 'Neznámý zaměstnanec'}
            </h1>
            <p className="text-gray-600">
              {payrollData?.svj?.name || 'Neznámé SVJ'} • {payrollData?.month || 0}/{payrollData?.year || 0}
            </p>
          </div>
          <Badge className={statusInfo.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
        <div className="flex gap-2">
          {payrollData?.status === 'draft' && (
            <>
              <Button 
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditing ? 'Zrušit' : 'Upravit'}
              </Button>
              {isEditing && (
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Uložit
                </Button>
              )}
              <Button onClick={handleRecalculate} className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Přepočítat
              </Button>
            </>
          )}
          {payrollData?.status === 'ready_for_approval' && (
            <Button onClick={handleApprove} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Schválit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Levý sloupec - Základní info a dokumenty */}
        <div className="space-y-6">
          {/* Základní informace o zaměstnanci */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Základní údaje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Osobní číslo</label>
                <p className="text-sm">{payrollData.employee.personalNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Pozice</label>
                <p className="text-sm">{payrollData.employee.position}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Datum nástupu</label>
                <p className="text-sm">{new Date(payrollData.employee.workStartDate).toLocaleDateString('cs-CZ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Bankovní účet</label>
                <p className="text-sm">{payrollData.employee.bankAccount}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Zdravotní pojišťovna</label>
                <p className="text-sm">{payrollData.employee.healthInsurance}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dokumenty */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dokumenty
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant={payrollData.documents.payslip ? "default" : "outline"}
                size="sm"
                onClick={() => handleGenerateDocument('payslip')}
                className="w-full flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {payrollData.documents.payslip ? 'Stáhnout' : 'Generovat'} výplatní pásku
              </Button>
              <Button 
                variant={payrollData.documents.bankTransfer ? "default" : "outline"}
                size="sm"
                onClick={() => handleGenerateDocument('bankTransfer')}
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {payrollData.documents.bankTransfer ? 'Stáhnout' : 'Generovat'} příkaz k úhradě
              </Button>
              <Button 
                variant={payrollData.documents.taxStatement ? "default" : "outline"}
                size="sm"
                onClick={() => handleGenerateDocument('taxStatement')}
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {payrollData.documents.taxStatement ? 'Stáhnout' : 'Generovat'} daňové hlášení
              </Button>
            </CardContent>
          </Card>

          {/* Poznámky */}
          <Card>
            <CardHeader>
              <CardTitle>Poznámky</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea 
                  value={payrollData?.notes || ''}
                  onChange={(e) => {
                    // V edit módu by se upravoval lokální state, zatím jen read-only
                    console.log('Poznámky změněny:', e.target.value);
                  }}
                  className="w-full h-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Zadejte poznámky..."
                />
              ) : (
                <p className="text-sm text-gray-700">{payrollData?.notes || 'Žádné poznámky'}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prostřední sloupec - Výpočet mezd */}
        <div className="space-y-6">
          {/* Pracovní údaje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pracovní údaje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Pracovní dny</label>
                  {isEditing ? (
                    <input 
                      type="number"
                      value={payrollData.calculationData.workDays}
                      onChange={(e) => setPayrollData({
                        ...payrollData,
                        calculationData: {
                          ...payrollData.calculationData,
                          workDays: Number(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm bg-gray-50 p-2 rounded">{payrollData.calculationData.workDays}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Odpracované dny</label>
                  {isEditing ? (
                    <input 
                      type="number"
                      value={payrollData.calculationData.workedDays}
                      onChange={(e) => setPayrollData({
                        ...payrollData,
                        calculationData: {
                          ...payrollData.calculationData,
                          workedDays: Number(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm bg-gray-50 p-2 rounded">{payrollData.calculationData.workedDays}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Celkem hodin</label>
                  {isEditing ? (
                    <input 
                      type="number"
                      value={payrollData.calculationData.totalHours}
                      onChange={(e) => setPayrollData({
                        ...payrollData,
                        calculationData: {
                          ...payrollData.calculationData,
                          totalHours: Number(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm bg-gray-50 p-2 rounded">{payrollData.calculationData.totalHours}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Přesčas (hod)</label>
                  {isEditing ? (
                    <input 
                      type="number"
                      value={payrollData.calculationData.overtimeHours}
                      onChange={(e) => setPayrollData({
                        ...payrollData,
                        calculationData: {
                          ...payrollData.calculationData,
                          overtimeHours: Number(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm bg-gray-50 p-2 rounded">{payrollData.calculationData.overtimeHours}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Nemocenské (dny)</label>
                  {isEditing ? (
                    <input 
                      type="number"
                      value={payrollData.calculationData.sickDays}
                      onChange={(e) => setPayrollData({
                        ...payrollData,
                        calculationData: {
                          ...payrollData.calculationData,
                          sickDays: Number(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm bg-gray-50 p-2 rounded">{payrollData.calculationData.sickDays}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Dovolená (dny)</label>
                  {isEditing ? (
                    <input 
                      type="number"
                      value={payrollData.calculationData.vacationDays}
                      onChange={(e) => setPayrollData({
                        ...payrollData,
                        calculationData: {
                          ...payrollData.calculationData,
                          vacationDays: Number(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-sm bg-gray-50 p-2 rounded">{payrollData.calculationData.vacationDays}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Srážky */}
          {payrollData.deductions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Srážky</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payrollData.deductions.map((deduction, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-red-700">{deduction.type}</span>
                        <span className="font-bold text-red-700">{deduction.amount.toLocaleString()} Kč</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">{deduction.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pravý sloupec - Výpočet */}
        <div className="space-y-6">
          {/* Mzdový výpočet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Mzdový výpočet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Základní mzda</span>
                  <span className="text-sm font-medium">{payrollData.salaryComponents.basicSalary.toLocaleString()} Kč</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Přesčas</span>
                  <span className="text-sm font-medium">{payrollData.salaryComponents.overtime.toLocaleString()} Kč</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bonus</span>
                  <span className="text-sm font-medium">{payrollData.salaryComponents.bonus.toLocaleString()} Kč</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Příplatky</span>
                  <span className="text-sm font-medium">{payrollData.salaryComponents.allowances.toLocaleString()} Kč</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold">
                  <span>Hrubá mzda</span>
                  <span>{payrollData.salaryComponents.grossSalary.toLocaleString()} Kč</span>
                </div>
              </div>
              
              <div className="pt-3 space-y-2 border-t">
                <div className="flex justify-between text-red-600">
                  <span className="text-sm">Sociální pojištění (6,5%)</span>
                  <span className="text-sm font-medium">-{payrollData.salaryComponents.socialInsurance.toLocaleString()} Kč</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span className="text-sm">Zdravotní pojištění (4,5%)</span>
                  <span className="text-sm font-medium">-{payrollData.salaryComponents.healthInsurance.toLocaleString()} Kč</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span className="text-sm">Daň z příjmu</span>
                  <span className="text-sm font-medium">-{payrollData.salaryComponents.tax.toLocaleString()} Kč</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="text-sm">Sleva na dani</span>
                  <span className="text-sm font-medium">+{payrollData.salaryComponents.taxDeduction.toLocaleString()} Kč</span>
                </div>
                {payrollData.deductions.map((deduction, index) => (
                  <div key={index} className="flex justify-between text-red-600">
                    <span className="text-sm">{deduction.type}</span>
                    <span className="text-sm font-medium">-{deduction.amount.toLocaleString()} Kč</span>
                  </div>
                ))}
                <hr />
                <div className="flex justify-between font-bold text-lg text-green-600">
                  <span>Čistá mzda</span>
                  <span>{(payrollData.salaryComponents.netSalary - payrollData.deductions.reduce((sum, d) => sum + d.amount, 0)).toLocaleString()} Kč</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historie změn */}
          <Card>
            <CardHeader>
              <CardTitle>Historie změn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payrollData.history.map((entry, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-gray-900">
                      {new Date(entry.date).toLocaleString('cs-CZ')}
                    </div>
                    <div className="text-gray-600">{entry.user}</div>
                    <div className="text-gray-700">{entry.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
