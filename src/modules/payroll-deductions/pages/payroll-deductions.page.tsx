import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

// Typová definice pro mzdovou srážku
interface PayrollDeduction {
  id: string;
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
    <div>
      <h1>Přehled mzdových srážek</h1>
      <table border={1}>
        <thead>
          <tr>
            <th>Popis</th>
            <th>Typ</th>
            <th>Částka</th>
          </tr>
        </thead>
        <tbody>
          {deductions.map((deduction) => (
            <tr key={deduction.id}>
              <td>{deduction.description}</td>
              <td>{deduction.type}</td>
              <td>{deduction.amount.toLocaleString('cs-CZ')} Kč</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}