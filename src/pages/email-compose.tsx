import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Upload } from 'lucide-react';
import { templatesService } from '@/services/templates';
import { useSearchParams } from 'react-router-dom';

function renderTemplate(text: string, vars: Record<string,string>) {
  return text.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export default function EmailComposePage() {
  const [params] = useSearchParams();
  const templateId = params.get('templateId') || '';
  const initial = templatesService.getById(templateId);
  const [subject, setSubject] = useState(() => {
    const s = params.get('subject')
    if (s) return decodeURIComponent(s)
    return initial?.subject || ''
  });
  const [body, setBody] = useState(() => {
    const b = params.get('body')
    if (b) return decodeURIComponent(b)
    return initial?.bodyPreview || ''
  });
  const [varsText, setVarsText] = useState(() => {
    const v = params.get('vars')
    if (!v) return '{}'
    try {
      const decoded = decodeURIComponent(v)
      JSON.parse(decoded)
      return decoded
    } catch {
      return '{}'
    }
  });
  const [previewMode, setPreviewMode] = useState<'placeholders'|'rendered'>('placeholders');
  const includeSlip = params.get('includeSlip') === '1'
  const uploadsParam = params.get('uploads')
  const specialParam = params.get('special') || ''
  const [uploads] = useState<{ name: string; mime: string; size: number; dataBase64: string }[]>(() => {
    if (!uploadsParam) return []
    try {
      const decoded = decodeURIComponent(uploadsParam)
      const arr = JSON.parse(decoded)
      return Array.isArray(arr) ? arr : []
    } catch { return [] }
  })

  const vars = useMemo(() => {
    try { return JSON.parse(varsText); } catch { return {}; }
  }, [varsText]);

  const renderedSubject = previewMode === 'rendered' ? renderTemplate(subject, vars) : subject;
  const renderedBody = previewMode === 'rendered' ? renderTemplate(body, vars) : body;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Náhled a odeslání e‑mailu</CardTitle>
          <CardDescription>Načtěte šablonu, zadejte proměnné a přepínejte mezi náhledem placeholderů a výsledkem.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Předmět</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Předmět" />
              </div>
              <div className="flex items-end justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewMode(previewMode === 'rendered' ? 'placeholders' : 'rendered')}>
                  {previewMode === 'rendered' ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />} 
                  {previewMode === 'rendered' ? 'Zobrazit proměnné' : 'Zobrazit náhled'}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tělo e‑mailu</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full h-64 px-3 py-2 border rounded font-mono text-sm" placeholder="Text e‑mailu s proměnnými jako {{nazev}}" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Proměnné (JSON)</label>
                <textarea value={varsText} onChange={e => setVarsText(e.target.value)} className="w-full h-64 px-3 py-2 border rounded font-mono text-sm" placeholder='{"nazev_svj":"Dřevařská SVJ"}' />
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm text-gray-500 mb-2">Náhled</div>
              <div className="font-medium mb-2">{renderedSubject}</div>
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">{renderedBody}</pre>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm text-gray-500 mb-2">Přílohy k odeslání</div>
              {includeSlip ? (
                <div className="text-sm mb-2">• Výplatní páska (PDF) – bude vygenerována</div>
              ) : (
                <div className="text-sm mb-2 text-gray-500">Výplatní páska nebude přiložena</div>
              )}
              {specialParam && (
                <div className="text-sm mb-2">
                  {specialParam.split(',').map(key => {
                    if (key === 'settlement') return <div key={key}>• Vyúčtování mezd (PDF)</div>
                    if (key === 'dpp_xml') return <div key={key}>• Výkaz příjmů DPP (XML)</div>
                    if (key === 'dpp_pdf') return <div key={key}>• Výkaz příjmů DPP (PDF)</div>
                    return null
                  })}
                </div>
              )}
              {uploads.length > 0 ? (
                <ul className="text-sm list-disc pl-5">
                  {uploads.map((u, i) => (
                    <li key={i}>{u.name} ({u.mime}, {(u.size/1024).toFixed(1)} kB)</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-500">Žádné další přílohy</div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline"><Upload className="h-4 w-4 mr-2" /> Uložit návrh</Button>
              <Button>Odeslat e‑mailem</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
