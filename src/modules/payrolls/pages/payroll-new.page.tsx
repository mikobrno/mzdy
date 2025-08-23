import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '@/services/api';

interface Employee {
  id: string;
  full_name: string;
}

export function PayrollNewPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Stavy formuláře
  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [grossWage, setGrossWage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      const data = await apiService.getEmployees()
      if (data) setEmployees(data as Employee[])
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Zjednodušený výpočet čisté mzdy prozatím
      const netWage = parseFloat(grossWage) * 0.85; 

      const created = await apiService.createSalaryRecord({
        employee_id: employeeId,
        month,
        year,
        gross_wage: parseFloat(grossWage),
        net_wage: netWage,
        status: 'pending',
      })
      if (!created) throw new Error('Vytvoření mzdy selhalo')
      alert('Mzda byla úspěšně vytvořena!');
      navigate('/payrolls');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vytvořit novou mzdu</h1>
        <Link to="/payrolls" className="text-blue-500 hover:underline">&larr; Zpět na seznam</Link>
      </div>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="employee" className="block text-sm font-medium text-gray-700">Zaměstnanec</label>
          <select id="employee" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="" disabled>Vyberte zaměstnance</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
          </select>
        </div>
        {/* Další pole pro měsíc, rok, hrubou mzdu... */}
        <div>
            <label htmlFor="grossWage" className="block text-sm font-medium text-gray-700">Hrubá mzda (Kč)</label>
            <input type="number" id="grossWage" value={grossWage} onChange={(e) => setGrossWage(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>

        {error && <p className="text-red-500 text-sm">Chyba: {error}</p>}

        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Ukládání...' : 'Uložit mzdu'}
        </button>
      </form>
    </div>
  );
}
