import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Calculator, 
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Settings,
  Calendar,
  TrendingUp,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { nhostApiService } from '@/services/nhost-api';

export default function TaxSettings() {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const { data: taxSettings, isLoading } = useQuery({
    queryKey: ['tax-settings'],
    queryFn: () => nhostApiService.getTaxSettings(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: insuranceCompanies } = useQuery({
    queryKey: ['insurance-companies'],
    queryFn: () => nhostApiService.getInsuranceCompanies(),
    staleTime: 1000 * 60 * 15,
  });

  const [formData, setFormData] = useState(taxSettings || {
    incomeTax: {
      rate: 15,
      basicDeduction: 2570,
      childDeduction: 1367,
      disabilityDeduction: 1345,
      lastUpdated: '2025-01-01',
      validFrom: '2025-01-01'
    },
    socialInsurance: {
      employeeRate: 6.5,
      employerRate: 24.8,
      maxBase: 1935552,
      lastUpdated: '2025-01-01'
    },
    healthInsurance: {
      employeeRate: 4.5,
      employerRate: 9,
      minBase: 17300,
      maxBase: 193556,
      lastUpdated: '2025-01-01'
    },
    minimumWage: {
      hourly: 118.1,
      monthly: 20000,
      lastUpdated: '2025-01-01'
    },
    mealVouchers: {
      maxTaxFree: 200,
      employerContribution: 55,
      lastUpdated: '2025-01-01'
    },
    autoUpdate: {
      enabled: true,
      source: 'Ministerstvo financí',
      lastCheck: new Date().toISOString()
    }
  });

  const updateTaxRatesMutation = useMutation({
    mutationFn: () => nhostApiService.updateTaxRates(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-settings'] });
      setIsUpdating(false);
    },
    onError: () => {
      setIsUpdating(false);
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: (data: any) => nhostApiService.saveTaxSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-settings'] });
    }
  });

  React.useEffect(() => {
    if (taxSettings) {
      setFormData(taxSettings);
    }
  }, [taxSettings]);
  incomeTax: {
    rate: 15, // %
    basicDeduction: 2570, // Kč měsíčně
    childDeduction: 1367, // Kč za dítě
    disabilityDeduction: 1345, // Kč pro ZTP
    lastUpdated: '2025-01-01',
    validFrom: '2025-01-01'
  },
  socialInsurance: {
    employeeRate: 6.5, // %
    employerRate: 24.8, // %
    maxBase: 1935552, // Kč ročně (2025)
    lastUpdated: '2025-01-01'
  },
  healthInsurance: {
    employeeRate: 4.5, // %
    employerRate: 9, // %
    minBase: 17300, // Kč měsíčně
    maxBase: 193556, // Kč měsíčně (2025)
    lastUpdated: '2025-01-01'
  },
  minimumWage: {
    hourly: 118.1, // Kč
    monthly: 20000, // Kč
    lastUpdated: '2025-01-01'
  },
  mealVouchers: {
    maxTaxFree: 200, // Kč denně
    employerContribution: 55, // %
    lastUpdated: '2025-01-01'
  },
  autoUpdate: {
    enabled: true,
    source: 'Ministerstvo financí',
    lastCheck: '2025-01-12T06:00:00'
  }
};

const insuranceCompanies = [
  { code: '111', name: 'VšZP ČR', apiStatus: 'connected' },
  { code: '201', name: 'Vojenská zdravotní pojišťovna', apiStatus: 'connected' },
  { code: '205', name: 'Česká průmyslová zdravotní pojišťovna', apiStatus: 'connected' },
  { code: '207', name: 'Oborová zdravotní pojišťovna', apiStatus: 'error' },
  { code: '209', name: 'Zaměstnanecká pojišťovna Škoda', apiStatus: 'not_configured' },
  { code: '211', name: 'Zdravotní pojišťovna ministerstva vnitra', apiStatus: 'connected' },
  { code: '213', name: 'RBP, zdravotní pojišťovna', apiStatus: 'connected' }
];

export default function TaxSettings() {
  const [formData, setFormData] = useState(taxSettings);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateTaxRates = async () => {
    setIsUpdating(true);
    // Simulace aktualizace daňových sazeb
    setTimeout(() => {
      setIsUpdating(false);
      console.log('Daňové sazby aktualizovány');
    }, 2000);
  };

  const handleSaveSettings = () => {
    console.log('Ukládám daňové nastavení', formData);
  };

  const handleExportRates = () => {
    console.log('Exportuji daňové sazby');
  };

  const handleImportRates = () => {
    console.log('Importuji daňové sazby');
  };

  const getApiStatus = (status: string) => {
    switch (status) {
      case 'connected':
        return { label: 'Připojeno', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'error':
        return { label: 'Chyba', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
      case 'not_configured':
        return { label: 'Není nastaveno', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
      default:
        return { label: 'Neznámý', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/settings">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět na nastavení
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Daně a odvody</h1>
          <p className="text-gray-600">Aktuální daňové sazby a nastavení sociálního a zdravotního pojištění</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportRates} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImportRates} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button 
            onClick={handleUpdateTaxRates}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Aktualizuje se...' : 'Aktualizovat sazby'}
          </Button>
        </div>
      </div>

      {/* Auto Update Status */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Automatické aktualizace
            </CardTitle>
            <Badge className={formData.autoUpdate.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {formData.autoUpdate.enabled ? 'Zapnuto' : 'Vypnuto'}
            </Badge>
          </div>
          <CardDescription>
            Automatické stahování aktuálních sazeb z {formData.autoUpdate.source}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Poslední kontrola: {new Date(formData.autoUpdate.lastCheck).toLocaleString('cs-CZ')}
              </p>
              <p className="text-sm text-gray-600">
                Platnost sazeb od: {new Date(formData.incomeTax.validFrom).toLocaleDateString('cs-CZ')}
              </p>
            </div>
            <button
              onClick={() => setFormData({
                ...formData,
                autoUpdate: { ...formData.autoUpdate, enabled: !formData.autoUpdate.enabled }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.autoUpdate.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.autoUpdate.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Tax */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Daň z příjmu
            </CardTitle>
            <CardDescription>
              Nastavení daňových sazeb a slev na dani
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daňová sazba (%)</label>
              <input 
                type="number"
                step="0.1"
                value={formData.incomeTax.rate}
                onChange={(e) => setFormData({
                  ...formData,
                  incomeTax: { ...formData.incomeTax, rate: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Základní sleva na poplatníka (Kč/měsíc)</label>
              <input 
                type="number"
                value={formData.incomeTax.basicDeduction}
                onChange={(e) => setFormData({
                  ...formData,
                  incomeTax: { ...formData.incomeTax, basicDeduction: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sleva na dítě (Kč/měsíc)</label>
              <input 
                type="number"
                value={formData.incomeTax.childDeduction}
                onChange={(e) => setFormData({
                  ...formData,
                  incomeTax: { ...formData.incomeTax, childDeduction: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sleva ZTP/P (Kč/měsíc)</label>
              <input 
                type="number"
                value={formData.incomeTax.disabilityDeduction}
                onChange={(e) => setFormData({
                  ...formData,
                  incomeTax: { ...formData.incomeTax, disabilityDeduction: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Insurance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Sociální pojištění
            </CardTitle>
            <CardDescription>
              Sazby sociálního pojištění pro rok 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zaměstnanec (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={formData.socialInsurance.employeeRate}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialInsurance: { ...formData.socialInsurance, employeeRate: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zaměstnavatel (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={formData.socialInsurance.employerRate}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialInsurance: { ...formData.socialInsurance, employerRate: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximální vyměřovací základ (Kč/rok)</label>
              <input 
                type="number"
                value={formData.socialInsurance.maxBase}
                onChange={(e) => setFormData({
                  ...formData,
                  socialInsurance: { ...formData.socialInsurance, maxBase: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Měsíčně: {(formData.socialInsurance.maxBase / 12).toLocaleString('cs-CZ')} Kč
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Health Insurance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Zdravotní pojištění
            </CardTitle>
            <CardDescription>
              Sazby zdravotního pojištění pro rok 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zaměstnanec (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={formData.healthInsurance.employeeRate}
                  onChange={(e) => setFormData({
                    ...formData,
                    healthInsurance: { ...formData.healthInsurance, employeeRate: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zaměstnavatel (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={formData.healthInsurance.employerRate}
                  onChange={(e) => setFormData({
                    ...formData,
                    healthInsurance: { ...formData.healthInsurance, employerRate: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. vyměřovací základ (Kč/měsíc)</label>
                <input 
                  type="number"
                  value={formData.healthInsurance.minBase}
                  onChange={(e) => setFormData({
                    ...formData,
                    healthInsurance: { ...formData.healthInsurance, minBase: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max. vyměřovací základ (Kč/měsíc)</label>
                <input 
                  type="number"
                  value={formData.healthInsurance.maxBase}
                  onChange={(e) => setFormData({
                    ...formData,
                    healthInsurance: { ...formData.healthInsurance, maxBase: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ostatní nastavení
            </CardTitle>
            <CardDescription>
              Minimální mzda, stravné a další parametry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. mzda hodinová (Kč)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={formData.minimumWage.hourly}
                  onChange={(e) => setFormData({
                    ...formData,
                    minimumWage: { ...formData.minimumWage, hourly: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. mzda měsíční (Kč)</label>
                <input 
                  type="number"
                  value={formData.minimumWage.monthly}
                  onChange={(e) => setFormData({
                    ...formData,
                    minimumWage: { ...formData.minimumWage, monthly: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max. stravné bez daně (Kč/den)</label>
                <input 
                  type="number"
                  value={formData.mealVouchers.maxTaxFree}
                  onChange={(e) => setFormData({
                    ...formData,
                    mealVouchers: { ...formData.mealVouchers, maxTaxFree: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Příspěvek zaměstnavatele (%)</label>
                <input 
                  type="number"
                  value={formData.mealVouchers.employerContribution}
                  onChange={(e) => setFormData({
                    ...formData,
                    mealVouchers: { ...formData.mealVouchers, employerContribution: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Insurance Companies */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Zdravotní pojišťovny
          </CardTitle>
          <CardDescription>
            Stav API připojení ke zdravotním pojišťovnám
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insuranceCompanies.map((company) => {
              const statusInfo = getApiStatus(company.apiStatus);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={company.code} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{company.code}</div>
                    <div className="text-xs text-gray-600">{company.name}</div>
                  </div>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Uložit nastavení
        </Button>
      </div>
    </div>
  );
}
