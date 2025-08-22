import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';

// Typy pro data, která budeme načítat do výběrů
interface Svj {
  id: string;
  name: string;
}
interface HealthInsuranceCompany {
  id: string;
  name: string;
  code: string;
}

export function EmployeeNewPage() {
  const navigate = useNavigate();
  
  // Stavy pro data z databáze (pro <select>)
  const [svjList, setSvjList] = useState<Svj[]>([]);
  const [companies, setCompanies] = useState<HealthInsuranceCompany[]>([]);

  // Stavy pro formulářová pole
  const [svjId, setSvjId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [employmentType, setEmploymentType] = useState('dpp');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [companyId, setCompanyId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Načtení dat pro výběry (SVJ a pojišťovny) při prvním renderu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: svjData, error: svjError } = await supabase.from('svj').select('id, name');
      const { data: companiesData, error: companiesError } = await supabase.from('health_insurance_companies').select('id, name, code');

      if (svjError || companiesError) {
        setError(svjError?.message || companiesError?.message || "Chyba při načítání dat.");
      } else {
        setSvjList(svjData);
        setCompanies(companiesData);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from('employees').insert([
        {
          svj_id: svjId,
          full_name: fullName,
          email: email,
          employment_type: employmentType,
          salary_amount: parseFloat(salaryAmount),
          health_insurance_company_id: companyId || null, // Pojišťovna může být nepovinná
        },
      ]);

      if (error) throw error;

      alert('Zaměstnanec byl úspěšně vytvořen!');
      navigate('/employees');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Přidat nového zaměstnance</h1>
        <Link to="/employees" className="text-blue-500 hover:underline">&larr; Zpět na seznam</Link>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="svj" className="block text-sm font-medium text-gray-700">Přiřadit k SVJ</label>
          <select id="svj" value={svjId} onChange={(e) => setSvjId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="" disabled>Vyberte SVJ</option>
            {svjList.map(svj => <option key={svj.id} value={svj.id}>{svj.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Celé jméno</label>
          <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">Typ úvazku</label>
          <select id="employmentType" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="dpp">DPP</option>
            <option value="vybor">Člen výboru</option>
          </select>
        </div>
        <div>
          <label htmlFor="salaryAmount" className="block text-sm font-medium text-gray-700">Částka na smlouvě (Kč)</label>
          <input type="number" id="salaryAmount" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">Zdravotní pojišťovna</label>
          <select id="company" value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Nepřiřazeno</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
          </select>
        </div>
        
        {error && <p className="text-red-500 text-sm">Chyba: {error}</p>}
        
        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Ukládání...' : 'Uložit zaměstnance'}
        </button>
      </form>
    </div>
  );
}