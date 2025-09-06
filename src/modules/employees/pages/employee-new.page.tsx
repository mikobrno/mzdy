import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

interface Svj { id: string; name: string }
interface HealthInsuranceCompany { id: string; name: string; code: string }

export function EmployeeNewPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [svjList, setSvjList] = useState<Svj[]>([]);
  const [companies, setCompanies] = useState<HealthInsuranceCompany[]>([]);

  const [form, setForm] = useState({
    svj_id: '',
    full_name: '',
    email: '',
    phone: '',
    employment_type: 'dpp',
    salary_amount: '',
    health_insurance_company_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [svjData, companiesData] = await Promise.all([
          apiService.getSVJList(),
          apiService.getHealthInsuranceCompanies(),
        ]);
        setSvjList(svjData || []);
        setCompanies(companiesData || []);
      } catch (err: any) {
        setError(err.message || 'Chyba při načítání dat.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChange = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.svj_id) return setError('Vyberte SVJ');
    if (!form.full_name) return setError('Zadejte jméno zaměstnance');
    if (!form.email) return setError('Zadejte e-mail');

    setLoading(true);
    try {
      await apiService.createEmployee({
        svj_id: form.svj_id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        employment_type: form.employment_type,
        salary_amount: parseFloat(form.salary_amount || '0'),
        health_insurance_company_id: form.health_insurance_company_id || null
      })
      success('Zaměstnanec vytvořen');
      navigate('/employees');
    } catch (err: any) {
      setError(err.message || String(err));
      toastError('Chyba při vytváření', String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Přidat nového zaměstnance</h1>
        <Link to="/employees" className="text-sm text-gray-600 hover:underline">&larr; Zpět na seznam</Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nový zaměstnanec</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">Přiřadit k SVJ</span>
              <select data-test="employee-svj-select" className="border rounded px-3 py-2" value={form.svj_id} onChange={e => handleChange('svj_id', e.target.value)} required>
                <option value="">Vyberte SVJ</option>
                {svjList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">Jméno</span>
              <input data-test="employee-fullName-input" className="border rounded px-3 py-2" value={form.full_name} onChange={e => handleChange('full_name', e.target.value)} required />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">E-mail</span>
              <input data-test="employee-email-input" type="email" className="border rounded px-3 py-2" value={form.email} onChange={e => handleChange('email', e.target.value)} required />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">Telefon</span>
              <input className="border rounded px-3 py-2" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">Typ úvazku</span>
              <select className="border rounded px-3 py-2" value={form.employment_type} onChange={e => handleChange('employment_type', e.target.value)}>
                <option value="dpp">DPP</option>
                <option value="vybor">Člen výboru</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">Částka na smlouvě (Kč)</span>
              <input type="number" className="border rounded px-3 py-2" value={form.salary_amount} onChange={e => handleChange('salary_amount', e.target.value)} />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">Zdravotní pojišťovna</span>
              <select className="border rounded px-3 py-2" value={form.health_insurance_company_id} onChange={e => handleChange('health_insurance_company_id', e.target.value)}>
                <option value="">Nepřiřazeno</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
            </label>

            {error && <div className="col-span-full text-red-600">Chyba: {error}</div>}

            <div className="col-span-full flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate('/employees')}>Zrušit</Button>
              <Button data-test="employee-save-button" type="submit" disabled={loading}>{loading ? 'Ukládání...' : 'Uložit zaměstnance'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}