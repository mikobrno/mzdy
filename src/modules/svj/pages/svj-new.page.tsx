import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/toast';
import { Building2, ArrowLeft, Save } from 'lucide-react';

export function SvjNewPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [name, setName] = useState('');
  const [ico, setIco] = useState('');
  const [address, setAddress] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [dataBoxId, setDataBoxId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        ico,
        address,
        bank_account: bankAccount,
        data_box_id: dataBoxId,
      };

      await apiService.createSVJ(payload);

      // Pěkné toast oznámení místo alert
      success('SVJ vytvořeno', 'Společenství vlastníků jednotek bylo úspěšně vytvořeno.');
      navigate('/svj');
    } catch (err: any) {
      showError('Chyba při vytváření SVJ', err?.message || 'Nepodařilo se vytvořit SVJ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header s breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/svj" className="hover:text-gray-700 transition-colors">SVJ</Link>
          <span>/</span>
          <span className="text-gray-900">Přidat nové SVJ</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Přidat nové SVJ</h1>
            <p className="text-gray-600 mt-1">Vytvořte nové společenství vlastníků jednotek</p>
          </div>
        </div>
      </div>

      {/* Formulář */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Název SVJ */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Název SVJ *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="např. Společenství vlastníků jednotek V Údolí 123"
                required
              />
            </div>

            {/* IČO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IČO *
              </label>
              <input
                type="text"
                value={ico}
                onChange={(e) => setIco(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12345678"
                required
              />
            </div>

            {/* Datová schránka */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datová schránka
              </label>
              <input
                type="text"
                value={dataBoxId}
                onChange={(e) => setDataBoxId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Datová schránka"
              />
            </div>

            {/* Adresa */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresa *
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Ulice, číslo, město, PSČ"
                required
              />
            </div>

            {/* Bankovní účet */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bankovní účet
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123456789/0100"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Chyba</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Akční tlačítka */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
            <Link
              to="/svj"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Zpět na seznam
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Ukládání...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Uložit SVJ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}