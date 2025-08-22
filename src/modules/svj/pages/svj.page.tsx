import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient'; // Používáme alias @, který je nastaven v tsconfig.json

// Definice typu pro objekt SVJ pro bezpečnost v TypeScriptu
interface Svj {
  id: string;
  name: string;
  ico: string;
  street: string;
  city: string;
  zip_code: string;
}

export function SvjPage() {
  const [svjData, setSvjData] = useState<Svj[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSvj = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('svj')
          .select('*');

        if (error) {
          throw error;
        }

        setSvjData(data as Svj[]);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSvj();
  }, []);

  if (loading) return <p>Načítání...</p>;
  if (error) return <p>Chyba: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Seznam SVJ</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {svjData.map((svj) => (
          <div key={svj.id} className="border p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{svj.name}</h2>
            <p>IČO: {svj.ico}</p>
            <p>Ulice: {svj.street}</p>
            <p>Město: {svj.city}</p>
            <p>PSČ: {svj.zip_code}</p>
            <Link to={`/svj/${svj.id}`} className="text-blue-500 hover:underline mt-2 inline-block">
              Zobrazit detail
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}