import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/toast';
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

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'draft':
    case 'pending':
      return { label: 'Návrh', color: 'bg-gray-100 text-gray-800', icon: Clock };
    case 'ready_for_approval':
      return { label: 'K schválení', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    case 'approved':
      return { label: 'Schváleno', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    case 'paid':
      return { label: 'Vyplaceno', color: 'bg-blue-100 text-blue-800', icon: CheckCircle };
    default:
      return { label: 'Neznámý', color: 'bg-gray-100 text-gray-800', icon: Clock };
  }
};

export default function PayrollDetail() {
  const { payrollId } = useParams<{ payrollId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  // Fetch payroll data from Supabase
  const { data: payrollData, isLoading } = useQuery({
    queryKey: ['payroll-detail', payrollId],
    queryFn: () => apiService.getPayrollById(payrollId!),
    enabled: !!payrollId
  });

  // Fetch employee info if we have employee_id
  const { data: employeeData } = useQuery({
    queryKey: ['employee', payrollData?.employee_id],
    queryFn: () => apiService.getEmployee(payrollData.employee_id),
    enabled: !!payrollData?.employee_id
  });

  // Update mutation
  const updatePayrollMutation = useMutation({
    mutationFn: (data: any) => apiService.updatePayroll(payrollId!, data),
    onSuccess: () => {
      success('Mzda byla úspěšně aktualizována');
      queryClient.invalidateQueries({ queryKey: ['payroll-detail', payrollId] });
      setIsEditing(false);
    },
    onError: (err: any) => {
      error('Chyba při aktualizaci: ' + (err?.message || 'Neznámá chyba'));
    }
  });

  const handleSave = () => {
    updatePayrollMutation.mutate(editForm);
  };

  const handleApprove = () => {
    updatePayrollMutation.mutate({ status: 'approved' });
  };

  const handleGenerateDocument = (docType: string) => {
    console.log(`Generuji dokument: ${docType}`);
    // TODO: Implement document generation via apiService
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2 text-gray-600">Načítání…</span>
      </div>
    );
  }

  if (!payrollData) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Mzdová data nebyla nalezena.</p>
          <Button onClick={() => navigate('/payrolls')} className="mt-4">
            Zpět na seznam
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(payrollData.status);
  const StatusIcon = statusInfo.icon;

  // Create display-friendly data structure
  const displayData = {
    employee: {
      firstName: employeeData?.full_name?.split(' ')[0] || 'N/A',
      lastName: employeeData?.full_name?.split(' ').slice(1).join(' ') || 'N/A',
      personalNumber: employeeData?.personal_id_number || 'N/A',
      bankAccount: employeeData?.bank_account || 'N/A',
      healthInsurance: 'VZP', // TODO: Map from health_insurance_company_id
      address: employeeData?.address || 'N/A'
    },
    svj: {
      name: 'SVJ - data z payroll', // TODO: Fetch SVJ info
      ico: 'N/A'
    },
    payrollPeriod: {
      month: payrollData.month || 1,
      year: payrollData.year || new Date().getFullYear()
    },
    status: payrollData.status || 'draft',
    calculationData: {
      grossSalary: payrollData.base_salary || payrollData.gross_wage || 0,
      netSalary: payrollData.net_wage || 0,
      healthInsurance: payrollData.health_insurance_amount || 0,
      socialInsurance: payrollData.social_insurance_amount || 0,
      taxAdvance: payrollData.tax_advance || 0,
      employeeDeductions: [] // TODO: Fetch from executions/payroll_deductions tables
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate('/payrolls')}
          >
            <ArrowLeft className="h-4 w-4" />
            Zpět na seznam
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {displayData.employee.firstName} {displayData.employee.lastName}
            </h1>
            <p className="text-gray-600">
              {displayData.svj.name} • {displayData.payrollPeriod.month}/{displayData.payrollPeriod.year}
            </p>
          </div>
          <Badge className={statusInfo.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
        <div className="flex gap-2">
          {displayData.status === 'draft' && (
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
                <Button 
                  onClick={handleSave} 
                  className="flex items-center gap-2"
                  disabled={updatePayrollMutation.isPending}
                >
                  <Save className="h-4 w-4" />
                  Uložit
                </Button>
              )}
            </>
          )}
          {displayData.status === 'ready_for_approval' && (
            <Button 
              onClick={handleApprove} 
              className="flex items-center gap-2"
              disabled={updatePayrollMutation.isPending}
            >
              <CheckCircle className="h-4 w-4" />
              Schválit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic employee info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Základní údaje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Jméno</label>
                <p className="text-sm">{displayData.employee.firstName} {displayData.employee.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Osobní číslo</label>
                <p className="text-sm font-mono">{displayData.employee.personalNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Bankovní účet</label>
                <p className="text-sm font-mono">{displayData.employee.bankAccount}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Zdravotní pojišťovna</label>
                <p className="text-sm">{displayData.employee.healthInsurance}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Adresa</label>
                <p className="text-sm">{displayData.employee.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dokumenty
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => handleGenerateDocument('payslip')}
              >
                <Download className="h-4 w-4 mr-2" />
                Výplatní páska
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => handleGenerateDocument('xml')}
              >
                <Download className="h-4 w-4 mr-2" />
                XML pro CSSZ
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Salary calculation */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Výpočet mzdy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Hrubá mzda</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.base_salary || displayData.calculationData.grossSalary}
                        onChange={(e) => setEditForm({...editForm, base_salary: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="text-lg font-semibold">{displayData.calculationData.grossSalary.toLocaleString('cs-CZ')} Kč</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Zdravotní pojištění</label>
                    <p className="text-sm">{displayData.calculationData.healthInsurance.toLocaleString('cs-CZ')} Kč</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Sociální pojištění</label>
                    <p className="text-sm">{displayData.calculationData.socialInsurance.toLocaleString('cs-CZ')} Kč</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Záloha na daň</label>
                    <p className="text-sm">{displayData.calculationData.taxAdvance.toLocaleString('cs-CZ')} Kč</p>
                  </div>
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-600">Čistá mzda</label>
                    <p className="text-xl font-bold text-green-600">{displayData.calculationData.netSalary.toLocaleString('cs-CZ')} Kč</p>
                  </div>
                </div>
              </div>

              {displayData.calculationData.employeeDeductions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Srážky</h4>
                  <div className="space-y-2">
                    {displayData.calculationData.employeeDeductions.map((deduction: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{deduction.name}</p>
                          <p className="text-xs text-gray-600">VS: {deduction.variableSymbol}</p>
                        </div>
                        <p className="text-sm font-medium text-red-600">-{deduction.amount.toLocaleString('cs-CZ')} Kč</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
