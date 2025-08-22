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
    <div>
      <h1>Upravit SVJ</h1>
      <Link to={`/svj/${id}`}>&larr; Zpět na detail</Link>

      <form onSubmit={handleSubmit}>
        <label>
          Název SVJ:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          IČO:
          <input type="text" value={ico} onChange={(e) => setIco(e.target.value)} required />
        </label>
        <label>
          Adresa:
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label>
          Bankovní účet:
          <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
        </label>
        <label>
          Datová schránka:
          <input type="text" value={dataBoxId} onChange={(e) => setDataBoxId(e.target.value)} />
        </label>

        {error && <p>Chyba: {error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Ukládání...' : 'Uložit změny'}
        </button>
      </form>
    </div>
  );
}
