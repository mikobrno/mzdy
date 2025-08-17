import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pdfTemplatesService, base64ToUint8Array } from '@/services/pdfTemplates';
import { useToast } from '@/components/ui/toast';

export default function PdfGeneratorPage() {
  const { warning } = useToast();
  const templates = useMemo(() => pdfTemplatesService.getAll(), []);
  const [selectedId, setSelectedId] = useState('');
  const [variablesText, setVariablesText] = useState('{"rok":"2025","firma":"SVJ Dřevařská"}');

  const generate = async () => {
    const t = templates.find(x => x.id === selectedId);
    if (!t) return warning('Vyberte šablonu');
    let vars: Record<string,string> = {};
    try { vars = JSON.parse(variablesText); } catch { return warning('Neplatný JSON s proměnnými'); }

    // Základní substituce: mapping[field] -> pokud vypadá jako {{key}}, použij hodnotu z vars, jinak ber jako konstantu
    const filled: Record<string,string> = {};
    Object.entries(t.mapping).forEach(([field, template]) => {
      const m = template.match(/^\s*\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}\s*$/);
      if (m) {
        filled[field] = vars[m[1]] ?? '';
      } else {
        filled[field] = template;
      }
    });

    // Zatím nevyplňujeme do skutečného PDF (vyžadovalo by to pdf-lib/AcroForm). Pro demo stáhneme původní PDF a přiložíme JSON s daty.
  const bytes = base64ToUint8Array(t.fileBase64);
  const ab = bytes.subarray(0).buffer as ArrayBuffer;
  const blob = new Blob([new Uint8Array(ab)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t.name}-original.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    const jsonBlob = new Blob([JSON.stringify({ mapping: t.mapping, filled }, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const a2 = document.createElement('a');
    a2.href = jsonUrl;
    a2.download = `${t.name}-data.json`;
    a2.click();
    URL.revokeObjectURL(jsonUrl);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Generátor PDF</CardTitle>
          <CardDescription>Vyberte PDF šablonu, vložte proměnné (JSON) a vygenerujte výstup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Šablona</label>
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full px-3 py-2 border rounded" aria-label="Výběr PDF šablony">
                <option value="">— Vyberte šablonu —</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Proměnné (JSON)</label>
              <textarea value={variablesText} onChange={e => setVariablesText(e.target.value)} className="w-full h-40 px-3 py-2 border rounded font-mono text-sm" aria-label="Proměnné JSON" />
            </div>
            <div className="flex justify-end">
              <Button onClick={generate}>Vygenerovat</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
