import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/toast';
import { Plus, Edit2, Trash2, Download } from 'lucide-react';
import type { HealthInsuranceCompany as ApiHealthInsuranceCompany } from '@/services/supabase-api';

type HealthInsuranceCompany = ApiHealthInsuranceCompany & { xml_export_format?: string }

interface ExportResult {
  insuranceName: string;
  insuranceCode: string;
  totalBase: number;
  totalInsurance: number;
  xmlFile?: string;
  pdfFile?: string;
}

const exportTypes = [
  { value: "vzp", label: "Formát VZP (PVPOJ)" },
  { value: "zpmv", label: "Formát ZPMV" },
  { value: "ozp", label: "Formát OZP" },
];

export default function HealthInsuranceAdmin() {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<HealthInsuranceCompany>>({});
  const [exportResults, setExportResults] = useState<ExportResult[]>([]);
  const [period, setPeriod] = useState("");
  const [svjId, setSvjId] = useState<string>("");

  // Fetch data from Supabase
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['health-insurance-companies'],
    queryFn: apiService.getHealthInsuranceCompanies
  });

  const { data: svjList = [] } = useQuery({
    queryKey: ['svj-list'],
    queryFn: apiService.getSVJList
  });

  // Mutations (using mock endpoints for now)
  const createCompanyMutation = useMutation({
    mutationFn: async (data: Partial<HealthInsuranceCompany>) => {
      return await apiService.createHealthInsuranceCompany(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-insurance-companies'] });
      success('Pojišťovna byla vytvořena');
      setShowForm(false);
      setForm({});
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: HealthInsuranceCompany) => {
      return await apiService.updateHealthInsuranceCompany(data.id, data as Partial<HealthInsuranceCompany>)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-insurance-companies'] });
      success('Pojišťovna byla aktualizována');
      setShowForm(false);
      setForm({});
    }
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
  await apiService.deleteHealthInsuranceCompany(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-insurance-companies'] });
      success('Pojišťovna byla smazána');
    }
  });

  const handleEdit = (c: HealthInsuranceCompany) => {
    setForm(c);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Opravdu chcete smazat tuto pojišťovnu?')) {
      deleteCompanyMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) {
      updateCompanyMutation.mutate(form as HealthInsuranceCompany);
    } else {
      createCompanyMutation.mutate(form);
    }
  };

  const handleExportGenerate = async () => {
    if (!svjId || !period) {
      error('Vyberte SVJ a období');
      return;
    }
    
    try {
  const results = await apiService.exportHealthInsuranceData(svjId, period)
  setExportResults(results)
  success('Export byl vygenerován')
    } catch (err) {
      error('Chyba při generování exportu');
    }
  };

  // downloadFile utility removed (unused)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zdravotní pojišťovny</h1>
          <p className="text-gray-600">Správa zdravotních pojišťoven a exportů</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Přidat pojišťovnu
        </Button>
      </div>

      {/* Companies List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Seznam pojišťoven</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Načítání...</div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Zatím nejsou přidány žádné pojišťovny</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Přidat první pojišťovnu
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Název</th>
                    <th className="text-left py-3 px-4">Kód</th>
                    <th className="text-left py-3 px-4">Export formát</th>
                    <th className="text-right py-3 px-4">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{company.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{company.code}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge>{company.xml_export_format.toUpperCase()}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(company)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => handleDelete(company.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generování exportů</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SVJ
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={svjId}
                onChange={(e) => setSvjId(e.target.value)}
                title="Výběr SVJ"
              >
                <option value="">Vyberte SVJ</option>
                {svjList.map((svj) => (
                  <option key={svj.id} value={svj.id}>
                    {svj.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Období
              </label>
              <input
                type="month"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                aria-label="Období"
                title="Období"
              />
            </div>
          </div>
          
          <Button onClick={handleExportGenerate} disabled={!svjId || !period}>
            <Download className="h-4 w-4 mr-2" />
            Generovat exporty
          </Button>

          {/* Export Results */}
          {exportResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Výsledky exportu</h3>
              <div className="space-y-4">
                {exportResults.map((result, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{result.insuranceName}</h4>
                          <p className="text-sm text-gray-600">
                            Kód: {result.insuranceCode} | 
                            Základ: {result.totalBase.toLocaleString()} Kč | 
                            Pojištění: {result.totalInsurance.toLocaleString()} Kč
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {result.xmlFile && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              XML
                            </Button>
                          )}
                          {result.pdfFile && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {form.id ? 'Upravit pojišťovnu' : 'Přidat pojišťovnu'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Název
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Název"
                    title="Název pojišťovny"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kód
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.code || ""}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                    placeholder="Kód"
                    title="Kód pojišťovny"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export formát
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.xml_export_format || ""}
                    onChange={(e) => setForm({ ...form, xml_export_format: e.target.value })}
                    required
                    title="Export formát"
                    aria-label="Export formát"
                  >
                    <option value="">Vyberte formát</option>
                    {exportTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      setForm({});
                    }}
                  >
                    Zrušit
                  </Button>
                  <Button type="submit">
                    {form.id ? 'Uložit' : 'Přidat'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
