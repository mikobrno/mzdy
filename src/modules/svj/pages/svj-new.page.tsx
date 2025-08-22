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
    <div>
      <h1>Přidat nové SVJ</h1>
      <Link to="/svj">&larr; Zpět na seznam</Link>
      
      <form onSubmit={handleSubmit}>
        <label>
          Název SVJ:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          IČO:
          <input
            type="text"
            value={ico}
            onChange={(e) => setIco(e.target.value)}
            required
          />
        </label>
        <label>
          Adresa:
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
        <label>
          Bankovní účet:
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
          />
        </label>
        <label>
          Datová schránka:
          <input
            type="text"
            value={dataBoxId}
            onChange={(e) => setDataBoxId(e.target.value)}
          />
        </label>
        
        {error && <p>Chyba: {error}</p>}
        
        <button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Ukládání...' : 'Uložit SVJ'}
        </button>
      </form>
    </div>
  );
}