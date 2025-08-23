import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';

// Typ pro detail mzdy, který zahrnuje i jméno zaměstnance
interface PayrollDetail {
  id: string;
  month: number;
  year: number;
  gross_wage: number;
  net_wage: number;
  status: string;
  employee_name?: string;
}

export function PayrollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payroll, setPayroll] = useState<PayrollDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchPayroll = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const p = await apiService.getPayrollById(id);
        if (!mounted) return;
        setPayroll(p as PayrollDetail);
      } catch (err: any) {
        setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPayroll();
    return () => { mounted = false };
  }, [id]);

  const handleDelete = async () => {
    if (!payroll) return;
    const confirmed = window.confirm(`Opravdu chcete smazat mzdu pro ${payroll.employee_name || 'zaměstnance'}?`);
    if (!confirmed) return;
    setLoading(true);
    try {
      await apiService.deletePayroll(payroll.id);
      alert('Mzda byla smazána.');
      navigate('/payrolls');
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Načítání detailu mzdy...</p>;
  if (error) return <p>Chyba: {error}</p>;
  if (!payroll) return <p>Mzda nebyla nalezena.</p>;

  return (
    <div>
      <h1>Detail mzdy</h1>
      <div>
        <p>Zaměstnanec: {payroll.employee_name || 'Neznámý'}</p>
        <p>Období: {payroll.month}/{payroll.year}</p>
        <p>Hrubá mzda: {Number(payroll.gross_wage).toLocaleString('cs-CZ')} Kč</p>
        <p>Čistá mzda: {Number(payroll.net_wage).toLocaleString('cs-CZ')} Kč</p>
        <p>Status: {payroll.status}</p>
      </div>
      <br />
      <Link to={`/payrolls/${payroll.id}/edit`}>Upravit</Link>
      <button onClick={handleDelete} disabled={loading} className="ml-4">
        {loading ? 'Mazání...' : 'Smazat'}
      </button>
      <br />
      <Link to="/payrolls">Zpět na seznam</Link>
    </div>
  );
}
