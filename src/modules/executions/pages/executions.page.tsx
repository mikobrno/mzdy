import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

// Typová definice pro exekuci
interface Execution {
  id: string;
  employee_id: string;
  amount: number;
  reason: string;
  status: 'active' | 'paid' | 'paused';
  start_date: string;
}

export function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('executions')
          .select('*')
          .order('start_date', { ascending: false });

        if (error) {
          throw error;
        }

        setExecutions(data as Execution[]);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutions();
  }, []);

  if (loading) return <p>Načítání exekucí...</p>;
  if (error) return <p>Chyba: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Přehled exekucí</h1>
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Důvod</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Částka</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum zahájení</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {executions.map((execution) => (
              <tr key={execution.id}>
                <td className="px-6 py-4 whitespace-nowrap">{execution.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap">{execution.amount.toLocaleString('cs-CZ')} Kč</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(execution.start_date).toLocaleDateString('cs-CZ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    execution.status === 'active' ? 'bg-red-100 text-red-800' :
                    execution.status === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {execution.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}