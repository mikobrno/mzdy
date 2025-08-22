import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

// Typová definice pro mzdovou srážku
interface PayrollDeduction {
  id: string;
  payroll_id: string;
  type: string;
  amount: number;
  description: string;
}

export function PayrollDeductionsPage() {
  const [deductions, setDeductions] = useState<PayrollDeduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeductions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('payroll_deductions')
          .select('*')
          .order('amount', { ascending: false });

        if (error) {
          throw error;
        }

        setDeductions(data as PayrollDeduction[]);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeductions();
  }, []);

  if (loading) return <p>Načítání mzdových srážek...</p>;
  if (error) return <p>Chyba: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Přehled mzdových srážek</h1>
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Popis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Typ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Částka</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deductions.map((deduction) => (
              <tr key={deduction.id}>
                <td className="px-6 py-4 whitespace-nowrap">{deduction.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{deduction.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{deduction.amount.toLocaleString('cs-CZ')} Kč</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}