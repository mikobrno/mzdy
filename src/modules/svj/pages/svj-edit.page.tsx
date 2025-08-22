import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';

export function SvjEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [ico, setIco] = useState('');
  const [address, setAddress] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [dataBoxId, setDataBoxId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSvj = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('svj')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setName(data.name);
        setIco(data.ico);
        setAddress(data.address || '');
        setBankAccount(data.bank_account || '');
        setDataBoxId(data.data_box_id || '');
      }
      setLoading(false);
    };
    fetchSvj();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('svj')
        .update({
          name: name,
          ico: ico,
          address: address,
          bank_account: bankAccount,
          data_box_id: dataBoxId,
        })
        .eq('id', id);

      if (error) throw error;

      alert('Změny byly úspěšně uloženy!');
      navigate(`/svj/${id}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !name) return <p>Načítání dat...</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Upravit SVJ</h1>
        <Link to={`/svj/${id}`} className="text-blue-500 hover:underline">&larr; Zpět na detail</Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Název SVJ</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="ico" className="block text-sm font-medium text-gray-700">IČO</label>
          <input type="text" id="ico" value={ico} onChange={(e) => setIco(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresa</label>
          <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700">Bankovní účet</label>
          <input type="text" id="bankAccount" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="dataBoxId" className="block text-sm font-medium text-gray-700">Datová schránka</label>
          <input type="text" id="dataBoxId" value={dataBoxId} onChange={(e) => setDataBoxId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>

        {error && <p className="text-red-500 text-sm">Chyba: {error}</p>}

        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Ukládání...' : 'Uložit změny'}
        </button>
      </form>
    </div>
  );
}
