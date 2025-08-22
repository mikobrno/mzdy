import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';

// Typová definice zůstává stejná
interface Svj {
  id: string;
  name: string;
  ico: string;
  address: string;
  bank_account: string;
  data_box_id: string;
  created_at: string;
}

export function SvjDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [svj, setSvj] = useState<Svj | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSvjDetail = async () => {
      if (!id) {
        setLoading(false);
        setError('Chybí ID v adrese.');
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('svj')
          .select('*')
          .eq('id', id) // Podmínka: vyber jen řádek, kde se 'id' rovná našemu ID z URL
          .single(); // Očekáváme jen jeden výsledek

        if (error) {
          throw error;
        }

        setSvj(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSvjDetail();
  }, [id]); // useEffect se spustí znovu, pokud se změní 'id' v URL

  if (loading) return <p>Načítání detailu SVJ...</p>;
  if (error) return <p>Chyba: {error}</p>;
  if (!svj) return <p>SVJ nebylo nalezeno.</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{svj.name}</h1>
        <Link to="/svj" className="text-blue-500 hover:underline">
          &larr; Zpět na seznam
        </Link>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-600">IČO</h3>
            <p className="text-lg">{svj.ico}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Adresa</h3>
            <p className="text-lg">{svj.address}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Bankovní účet</h3>
            <p className="text-lg">{svj.bank_account || 'Není uvedeno'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Datová schránka</h3>
            <p className="text-lg">{svj.data_box_id || 'Není uvedeno'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}