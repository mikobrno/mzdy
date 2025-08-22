import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';

interface Payroll {
  id: string;
  month: number;
  year: number;
  gross_wage: number;
  net_wage: number;
  status: string;
}

export function PayrollsPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('payrolls')
          .select('*')
          .order('year', { ascending: false })
          .order('month', { ascending: false });
        if (error) throw error;
        setPayrolls(data as Payroll[]);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayrolls();
  }, []);

  if (loading) return <p>Načítání mezd...</p>;
  if (error) return <p>Chyba: {error}</p>;

  return (
    <div className="p-4">
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Měsíc/Rok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hrubá mzda</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Čistá mzda</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="relative px-6 py-3"><span className="sr-only">Detail</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payrolls.map((payroll) => (
              <tr key={payroll.id}>
                <td className="px-6 py-4 whitespace-nowrap">{payroll.month}/{payroll.year}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payroll.gross_wage.toLocaleString('cs-CZ')} Kč</td>
                <td className="px-6 py-4 whitespace-nowrap">{payroll.net_wage.toLocaleString('cs-CZ')} Kč</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    payroll.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payroll.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/payrolls/${payroll.id}`} className="text-indigo-600 hover:text-indigo-900">
                    Zobrazit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}