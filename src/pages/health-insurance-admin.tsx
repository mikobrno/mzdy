import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import type { FrontendSvj } from '@/services/supabase-api';
import type { HealthInsuranceCompany as ApiHealthInsuranceCompany } from '@/services/supabase-api';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/toast';

type HealthInsuranceCompany = ApiHealthInsuranceCompany & { xml_export_format?: string; pdfTemplateId?: string | number | null }

interface ExportResult {
  insuranceName: string;
  insuranceCode: string;
  totalBase: number;
  totalInsurance: number;
  xmlFile?: string;
  pdfFile?: string;
}

const exportTypes = [
  { value: "VZP", label: "Formát VZP (PVPOJ)" },
  { value: "ZPMV", label: "Formát ZPMV" },
  { value: "OZP", label: "Formát OZP" },
  { value: "VoZP", label: "Formát VoZP" },
];

export default function HealthInsuranceAdmin() {
  const { success } = useToast();
  const queryClient = useQueryClient();
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<HealthInsuranceCompany>>({});
  const [exportResults, setExportResults] = useState<ExportResult[]>([]);
  const [period, setPeriod] = useState("");
  const [svjId, setSvjId] = useState<string>("");

  // Fetch data from Supabase
  const { data: companies = [] } = useQuery({
    queryKey: ['health-insurance-companies'],
    queryFn: apiService.getHealthInsuranceCompanies
  });

  const { data: svjList = [] } = useQuery({
    queryKey: ['svj-list'],
    queryFn: apiService.getSVJList
  });

  // Mutations
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

  const handleExport = () => {
    if (!svjId || !period) return;
  apiService.exportHealthInsuranceData(svjId, period).then(setExportResults)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Úvodní karta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-between p-6 min-h-[180px]">
          <div>
            <h2 className="text-lg font-bold mb-2">Zdravotní pojišťovny</h2>
            <p className="text-gray-600 mb-4">Spravujte seznam zdravotních pojišťoven, jejich exportní formáty a napojení na PDF šablony. Přidejte pojišťovnu, upravte její nastavení nebo ji odeberte.</p>
          </div>
          <div>
            <Button onClick={() => { setShowForm(true); setForm({}); }}>Přidat pojišťovnu</Button>
          </div>
        </Card>
        <Card className="flex flex-col justify-between p-6 min-h-[180px]">
          <div>
            <h2 className="text-lg font-bold mb-2">Exporty pro pojišťovny</h2>
            <p className="text-gray-600 mb-4">Vygenerujte měsíční XML a PDF přehledy pro všechny pojišťovny, u kterých jsou zaměstnanci vaší firmy pojištěni.</p>
          </div>
          <div className="flex gap-2">
            <select
              className="border p-2 rounded"
              value={svjId}
              onChange={(e) => setSvjId(e.target.value)}
              title="Vyberte firmu"
            >
              <option value="">Vyberte firmu</option>
              {svjList.map((s: FrontendSvj) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input
              className="border p-2 rounded"
              placeholder="Období (např. 08/2025)"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
            <Button onClick={handleExport}>Generovat exporty</Button>
          </div>
        </Card>
      </div>

      {/* Tabulka pojišťoven */}
      <Card>
        <h3 className="text-md font-semibold mb-4">Seznam zdravotních pojišťoven</h3>
        {companies.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-4">Zatím nejsou evidovány žádné pojišťovny.</p>
            <Button onClick={() => { setShowForm(true); setForm({}); }}>Přidat pojišťovnu</Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Název</th>
                <th>Kód</th>
                <th>Typ XML exportu</th>
                <th>PDF šablona</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td><Badge>{c.code}</Badge></td>
                  <td>{exportTypes.find((e) => e.value === c.xmlExportType)?.label || c.xmlExportType}</td>
                  <td>{c.pdfTemplateId ?? <span className="text-gray-400">není</span>}</td>
                  <td>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>Upravit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)} className="ml-2">Smazat</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Formulář pro přidání/upravení pojišťovny */}
      {showForm && (
        <Card className="p-4 max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold">{form.id ? "Upravit pojišťovnu" : "Přidat pojišťovnu"}</h3>
            <input
              className="w-full border p-2 rounded"
              placeholder="Název pojišťovny"
              value={form.name || ""}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Kód pojišťovny"
              value={form.code || ""}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
            />
            <select
              className="w-full border p-2 rounded"
              value={form.xmlExportType || ""}
              onChange={(e) => setForm((f) => ({ ...f, xmlExportType: e.target.value }))}
              required
              title="Typ XML exportu"
            >
              <option value="">Vyberte typ exportu</option>
              {exportTypes.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
            <input
              className="w-full border p-2 rounded"
              placeholder="ID PDF šablony (volitelné)"
              type="number"
              value={form.pdfTemplateId || ""}
              onChange={(e) => setForm((f) => ({ ...f, pdfTemplateId: e.target.value ? Number(e.target.value) : undefined }))}
            />
            <div className="flex gap-2">
              <Button type="submit">Uložit</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Zrušit</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Výsledky exportů */}
      {exportResults.length > 0 && (
        <Card className="p-4">
          <h3 className="text-md font-semibold mb-4">Výsledky exportu</h3>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Pojišťovna</th>
                <th>Kód</th>
                <th>Vyměřovací základ</th>
                <th>Pojistné</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {exportResults.map((r, i) => (
                <tr key={i}>
                  <td>{r.insuranceName}</td>
                  <td><Badge>{r.insuranceCode}</Badge></td>
                    <td>{r.totalBase.toLocaleString()} Kč</td>
                    <td>{r.totalInsurance.toLocaleString()} Kč</td>
                  <td>
                    <Button size="sm" variant="outline" onClick={() => downloadFile(r.xmlFile, `export_${r.insuranceCode}.xml`)}>Stáhnout XML</Button>
                    {r.pdfFile && (
                      <Button size="sm" variant="outline" className="ml-2" onClick={() => downloadFile(r.pdfFile, `export_${r.insuranceCode}.pdf`)}>Stáhnout PDF</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function downloadFile(data: string | undefined, filename: string) {
  if (!data) return;
  const blob = new Blob([data], { type: filename.endsWith(".xml") ? "application/xml" : "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
