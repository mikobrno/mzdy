import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';

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
      setLoading(true);
      const [svjRes, companiesRes, employeeRes] = await Promise.all([
        supabase.from('svj').select('id, name'),
        supabase.from('health_insurance_companies').select('id, name, code'),
        supabase.from('employees').select('*').eq('id', id).single()
      ]);
      if (svjRes.error || companiesRes.error || employeeRes.error) {
        setError(svjRes.error?.message || companiesRes.error?.message || employeeRes.error?.message || "Chyba při načítání dat.");
      } else {
        setSvjList(svjRes.data);
        setCompanies(companiesRes.data);
        const employeeData = employeeRes.data;
        if (employeeData) {
          setSvjId(employeeData.svj_id);
          setFullName(employeeData.full_name);
          setEmail(employeeData.email);
          setEmploymentType(employeeData.employment_type);
          setSalaryAmount(String(employeeData.salary_amount));
          setCompanyId(employeeData.health_insurance_company_id);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('employees')
        .update({
          svj_id: svjId,
          full_name: fullName,
          email: email,
          employment_type: employmentType,
          salary_amount: parseFloat(salaryAmount),
          health_insurance_company_id: companyId || null,
        })
        .eq('id', id);
      if (error) throw error;
      alert('Změny u zaměstnance byly úspěšně uloženy!');
      navigate(`/employees/${id}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upravit zaměstnance</h1>
      <Link to={`/employees/${id}`}>Zpět na detail</Link>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="svj">Přiřadit k SVJ</label>
          <select id="svj" value={svjId} onChange={(e) => setSvjId(e.target.value)} required>
            <option value="" disabled>Vyberte SVJ</option>
            {svjList.map(svj => <option key={svj.id} value={svj.id}>{svj.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="fullName">Celé jméno</label>
          <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="employmentType">Typ úvazku</label>
          <select id="employmentType" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} required>
            <option value="dpp">DPP</option>
            <option value="vybor">Člen výboru</option>
          </select>
        </div>
        <div>
          <label htmlFor="salaryAmount">Částka na smlouvě (Kč)</label>
          <input type="number" id="salaryAmount" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="company">Zdravotní pojišťovna</label>
          <select id="company" value={companyId || ''} onChange={(e) => setCompanyId(e.target.value || null)}>
            <option value="">Nepřiřazeno</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
          </select>
        </div>
        
        {error && <p>Chyba: {error}</p>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Ukládání...' : 'Uložit změny'}
        </button>
      </form>
    </div>
  );
}