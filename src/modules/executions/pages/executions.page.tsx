import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

// Typová definice pro exekuci
interface Execution {
  id: string;
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
    <div>
      <h1>Přehled exekucí</h1>
      <table border={1}>
        <thead>
          <tr>
            <th>Důvod</th>
            <th>Částka</th>
            <th>Datum zahájení</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {executions.map((execution) => (
            <tr key={execution.id}>
              <td>{execution.reason}</td>
              <td>{execution.amount.toLocaleString('cs-CZ')} Kč</td>
              <td>
                {new Date(execution.start_date).toLocaleDateString('cs-CZ')}
              </td>
              <td>{execution.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}