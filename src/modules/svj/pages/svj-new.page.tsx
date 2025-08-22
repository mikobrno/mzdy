import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';

export function SvjNewPage() {
  const navigate = useNavigate(); // Pro přesměrování po úspěšném vytvoření
  const [name, setName] = useState('');
  const [ico, setIco] = useState('');
  const [address, setAddress] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [dataBoxId, setDataBoxId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Zabráníme znovunačtení stránky
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('svj')
        .insert([
          { 
            name: name, 
            ico: ico, 
            address: address, 
            bank_account: bankAccount, 
            data_box_id: dataBoxId 
          }
        ]);

      if (error) {
        throw error;
      }

      alert('SVJ bylo úspěšně vytvořeno!');
      navigate('/svj'); // Přesměrujeme uživatele zpět na seznam
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Přidat nové SVJ</h1>
        <Link to="/svj" className="text-blue-500 hover:underline">
          &larr; Zpět na seznam
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Název SVJ</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="ico" className="block text-sm font-medium text-gray-700">IČO</label>
          <input
            type="text"
            id="ico"
            value={ico}
            onChange={(e) => setIco(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresa</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700">Bankovní účet</label>
          <input
            type="text"
            id="bankAccount"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="dataBoxId" className="block text-sm font-medium text-gray-700">Datová schránka</label>
          <input
            type="text"
            id="dataBoxId"
            value={dataBoxId}
            onChange={(e) => setDataBoxId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm">Chyba: {error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Ukládání...' : 'Uložit SVJ'}
        </button>
      </form>
    </div>
  );
}