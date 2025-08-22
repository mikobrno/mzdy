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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Zdravotní pojišťovny</h1>
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Název pojišťovny</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kód</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap">{company.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{company.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}