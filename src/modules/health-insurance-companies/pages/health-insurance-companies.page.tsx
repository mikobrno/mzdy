import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

// Typová definice pro zdravotní pojišťovnu
interface HealthInsuranceCompany {
  id: string;
  name: string;
  code: string;
}

export function HealthInsuranceCompaniesPage() {
  const [companies, setCompanies] = useState<HealthInsuranceCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('health_insurance_companies')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }
        setCompanies(data as HealthInsuranceCompany[]);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) return <p>Načítání pojišťoven...</p>;
  if (error) return <p>Chyba: {error}</p>;

  return (
    <div>
      <h1>Zdravotní pojišťovny</h1>
      <table border={1}>
        <thead>
          <tr>
            <th>Název pojišťovny</th>
            <th>Kód</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td>{company.name}</td>
              <td>{company.code}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}