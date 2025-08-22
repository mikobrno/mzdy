import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

// Typová definice pro PDF šablonu
interface PdfTemplate {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

export function PdfTemplatesPage() {
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('pdf_templates')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        setTemplates(data as PdfTemplate[]);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) return <p>Načítání PDF šablon...</p>;
  if (error) return <p>Chyba: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Správa PDF šablon</h1>
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Název šablony</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Typ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vytvořeno</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => (
              <tr key={template.id}>
                <td className="px-6 py-4 whitespace-nowrap">{template.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{template.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(template.created_at).toLocaleDateString('cs-CZ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}