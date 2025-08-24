import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';

export function PayrollEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [employeeName, setEmployeeName] = useState('');
  const [grossWage, setGrossWage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayroll = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('payrolls')
        .select(`gross_wage, employees (full_name)`)
        .eq('id', id)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setGrossWage(String(data.gross_wage));
        setEmployeeName((data.employees as any)?.full_name || 'Neznámý');
      }
      setLoading(false);
    };
    fetchPayroll();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const netWage = parseFloat(grossWage) * 0.85; // Zjednodušený výpočet
      const { error } = await supabase
        .from('payrolls')
        .update({
          gross_wage: parseFloat(grossWage),
          net_wage: netWage,
          status: 'draft', // Přidání validní hodnoty pro status
        })
        .eq('id', id);
      if (error) throw error;
      alert('Změny byly uloženy!');
      navigate(`/payrolls/${id}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !employeeName) return <p>Načítání dat...</p>;

  return (
    <div>
      <h1>Upravit mzdu pro: {employeeName}</h1>
      <Link to={`/payrolls/${id}`}>Zpět na detail</Link>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="grossWage">Hrubá mzda (Kč)</label>
          <input type="number" id="grossWage" value={grossWage} onChange={(e) => setGrossWage(e.target.value)} required />
        </div>
        {error && <p>Chyba: {error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Ukládání...' : 'Uložit změny'}
        </button>
      </form>
    </div>
  );
}
