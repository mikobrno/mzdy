import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '@/services/api';

interface Svj { id: string; name: string; }
interface HealthInsuranceCompany { id: string; name: string; code: string; }

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [svjList, setSvjList] = useState<Svj[]>([]);
  const [companies, setCompanies] = useState<HealthInsuranceCompany[]>([]);
  const [svjId, setSvjId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [employmentType, setEmploymentType] = useState('dpp');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [svjData, companiesData, employeeData] = await Promise.all([
          apiService.getSVJList(),
          apiService.getHealthInsuranceCompanies(),
          apiService.getEmployee(id as string),
        ]);
        setSvjList(svjData || []);
        setCompanies(companiesData || []);
        if (employeeData) {
          setSvjId(employeeData.svj_id);
          setFullName(employeeData.full_name);
          setEmail(employeeData.email);
          setEmploymentType(employeeData.employment_type);
          setSalaryAmount(String(employeeData.salary_amount));
          setCompanyId(employeeData.health_insurance_company_id);
        }
      } catch (err: any) {
        setError(err.message || 'Chyba při načítání dat.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiService.updateEmployee(id as string, {
        svj_id: svjId,
        full_name: fullName,
        email: email,
        employment_type: employmentType,
        salary_amount: parseFloat(salaryAmount),
        health_insurance_company_id: companyId || null,
      });
      alert('Změny u zaměstnance byly úspěšně uloženy!');
      navigate(`/employees/${id}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Upravit zaměstnance</h1>
        <Link to={`/employees/${id}`} className="text-blue-500 hover:underline">Zpět na detail</Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="svj" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Přiřadit k SVJ</label>
            <select id="svj" value={svjId} onChange={(e) => setSvjId(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600">
              <option value="" disabled>Vyberte SVJ</option>
              {svjList.map(svj => <option key={svj.id} value={svj.id}>{svj.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Celé jméno</label>
            <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Typ úvazku</label>
            <select id="employmentType" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600">
              <option value="dpp">DPP</option>
              <option value="vybor">Člen výboru</option>
            </select>
          </div>
          <div>
            <label htmlFor="salaryAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Částka na smlouvě (Kč)</label>
            <input type="number" id="salaryAmount" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zdravotní pojišťovna</label>
            <select id="company" value={companyId || ''} onChange={(e) => setCompanyId(e.target.value || null)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600">
              <option value="">Nepřiřazeno</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>

          {error && <p className="text-red-500">Chyba: {error}</p>}

          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            {loading ? 'Ukládání...' : 'Uložit změny'}
          </button>
        </form>
      </div>
    </div>
  );
}