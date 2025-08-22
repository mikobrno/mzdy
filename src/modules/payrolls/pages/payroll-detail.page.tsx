import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';

// Typ pro detail mzdy, který zahrnuje i jméno zaměstnance
interface PayrollDetail {
  id: string;
  month: number;
  year: number;
  gross_wage: number;
  net_wage: number;
  status: string;
  employees: { // Jméno zaměstnance z propojené tabulky
    full_name: string;
  } | null;
}

export function PayrollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payroll, setPayroll] = useState<PayrollDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayrollDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('payrolls')
          .select(`
            *,
            employees ( full_name )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setPayroll(data as PayrollDetail);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayrollDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!payroll) return;
    const isConfirmed = window.confirm(`Opravdu chcete smazat mzdu pro ${payroll.employees?.full_name}?`);
    if (isConfirmed) {
      setLoading(true);
      try {
        const { error } = await supabase.from('payrolls').delete().eq('id', payroll.id);
        if (error) throw error;
        alert('Mzda byla smazána.');
        navigate('/payrolls');
      } catch (error: any) { setError(error.message); } finally { setLoading(false); }
    }
  };

  if (loading) return <p>Načítání detailu mzdy...</p>;
  if (error) return <p>Chyba: {error}</p>;
  if (!payroll) return <p>Mzda nebyla nalezena.</p>;

  return (
    <div>
      <h1>Detail mzdy</h1>
      <p>Zaměstnanec: {payroll.employees?.full_name || 'Neznámý'}</p>
      <p>Období: {payroll.month}/{payroll.year}</p>
      <p>Hrubá mzda: {payroll.gross_wage} Kč</p>
      <p>Čistá mzda: {payroll.net_wage} Kč</p>
      <p>Status: {payroll.status}</p>
      <br />
      <Link to={`/payrolls/${payroll.id}/edit`}>Upravit</Link>
      <button onClick={handleDelete} disabled={loading}>
        {loading ? 'Mazání...' : 'Smazat'}
      </button>
      <br />
      <Link to="/payrolls">Zpět na seznam</Link>
    </div>
  );
}
