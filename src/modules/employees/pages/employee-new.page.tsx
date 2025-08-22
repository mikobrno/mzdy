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
  const [phone, setPhone] = useState('');
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
          phone: phone,
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
    <div>
      <h1>Přidat nového zaměstnance</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Přiřadit k SVJ:
          <select value={svjId} onChange={(e) => setSvjId(e.target.value)} required>
            <option value="" disabled>Vyberte SVJ</option>
            {svjList.map(svj => <option key={svj.id} value={svj.id}>{svj.name}</option>)}
          </select>
        </label>
        <label>
          Jméno zaměstnance:
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Telefon:
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>
          Typ úvazku:
          <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} required>
            <option value="dpp">DPP</option>
            <option value="vybor">Člen výboru</option>
          </select>
        </label>
        <label>
          Částka na smlouvě (Kč):
          <input type="number" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} required />
        </label>
        <label>
          Zdravotní pojišťovna:
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            <option value="">Nepřiřazeno</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
          </select>
        </label>
        
        {error && <p className="text-red-500 text-sm">Chyba: {error}</p>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Ukládání...' : 'Uložit zaměstnance'}
        </button>
      </form>
      <Link to="/employees">&larr; Zpět na seznam zaměstnanců</Link>
    </div>
  );
}