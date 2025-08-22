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
    <div>
      <h1>Správa PDF šablon</h1>
      <table border={1}>
        <thead>
          <tr>
            <th>Název šablony</th>
            <th>Typ</th>
            <th>Vytvořeno</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template.id}>
              <td>{template.name}</td>
              <td>{template.type}</td>
              <td>
                {new Date(template.created_at).toLocaleDateString('cs-CZ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}