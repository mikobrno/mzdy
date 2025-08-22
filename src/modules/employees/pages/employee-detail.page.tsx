import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';

// Typová definice zůstává stejná
interface Employee {
  id: string;
  full_name: string;
  address: string;
  email: string;
  phone_number: string;
  employment_type: string;
  salary_amount: number;
  bank_account: string;
  is_active: boolean;
}

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Přidáme pro přesměrování
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeDetail = async () => {
      // ... (tato část zůstává beze změny)
      if (!id) {
        setLoading(false);
        setError('Chybí ID zaměstnance v adrese.');
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setEmployee(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeDetail();
  }, [id]);

  // Nová funkce pro smazání
  const handleDelete = async () => {
    if (!employee) return;

    const isConfirmed = window.confirm(
      `Opravdu chcete smazat zaměstnance "${employee.full_name}"?`
    );
    if (isConfirmed) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', employee.id);

        if (error) throw error;

        alert('Zaměstnanec byl úspěšně smazán.');
        navigate('/employees'); // Přesměrování na seznam
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <p>Načítání detailu zaměstnance...</p>;
  if (error) return <p>Chyba: {error}</p>;
  if (!employee) return <p>Zaměstnanec nebyl nalezen.</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{employee.full_name}</h1>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
              employee.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {employee.is_active ? 'Aktivní' : 'Neaktivní'}
          </span>
        </div>
        <Link to="/employees" className="text-blue-500 hover:underline">
          &larr; Zpět na seznam zaměstnanců
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-600">Email</h3>
            <p className="text-lg">{employee.email || 'Není uvedeno'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Telefon</h3>
            <p className="text-lg">{employee.phone_number || 'Není uvedeno'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Adresa</h3>
            <p className="text-lg">{employee.address || 'Není uvedeno'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Typ úvazku</h3>
            <p className="text-lg capitalize">{employee.employment_type}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Částka na smlouvě</h3>
            <p className="text-lg">
              {employee.salary_amount.toLocaleString('cs-CZ')} Kč
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Bankovní účet</h3>
            <p className="text-lg">{employee.bank_account || 'Není uvedeno'}</p>
          </div>
        </div>

        {/* Sekce s akcemi - editace a mazání */}
        <div className="mt-8 pt-6 border-t flex gap-4">
          <Link
            to={`/employees/${employee.id}/edit`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Upravit
          </Link>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Mazání...' : 'Smazat'}
          </button>
        </div>
      </div>
    </div>
  );
}