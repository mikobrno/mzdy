import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient'; // Používáme alias @, který je nastaven v tsconfig.json
import { Building2, MapPin, FileText, Plus, Users, Settings } from 'lucide-react';

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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Načítání SVJ...</span>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Chyba při načítání</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header sekce */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              Seznam SVJ
            </h1>
            <p className="text-gray-600 mt-2">Přehled všech společenství vlastníků jednotek</p>
          </div>
          <Link 
            to="/svj-new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Přidat nové SVJ
          </Link>
        </div>
      </div>

      {/* SVJ karty */}
      {svjData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žádná SVJ</h3>
          <p className="text-gray-500 mb-4">Zatím nebyla vytvořena žádná společenství vlastníků jednotek.</p>
          <Link 
            to="/svj-new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Vytvořit první SVJ
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {svjData.map((svj) => (
            <div key={svj.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Karta header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{svj.name}</h3>
                    </div>
                  </div>
                </div>

                {/* Informace */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">IČO:</span>
                    <span>{svj.ico}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div>{svj.street}</div>
                      <div>{svj.city}, {svj.zip_code}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Karta footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Zaměstnanci</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>Mzdy</span>
                    </div>
                  </div>
                  <Link 
                    to={`/svj/${svj.id}`} 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Zobrazit detail</span>
                    <Settings className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}