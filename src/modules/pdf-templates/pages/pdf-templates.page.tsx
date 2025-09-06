import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUp, FileText, Edit2, Trash2, Wrench, Plus } from 'lucide-react';
import { pdfTemplatesService, PdfTemplate, arrayBufferToBase64 } from '@/services/pdfTemplates';
import { useToast } from '@/components/ui/toast';

export function PdfTemplatesPage() {
  const { success, warning } = useToast();
  const [items, setItems] = useState<PdfTemplate[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await pdfTemplatesService.getAll();
      if (mounted) setItems(all);
    })();
    return () => { mounted = false };
  }, []);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PdfTemplate | null>(null);
  const [editMappingFor, setEditMappingFor] = useState<PdfTemplate | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(i => `${i.name} ${i.fileName}`.toLowerCase().includes(q));
  }, [items, search]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      return warning('Nahrajte prosím PDF soubor');
    }
    const ab = await f.arrayBuffer();
    const base64 = arrayBufferToBase64(ab);
    // Placeholder: bez skutečné extrakce polí; pole vyplní admin
    const created = await pdfTemplatesService.create({
      name: f.name.replace(/\.pdf$/i, ''),
      fileName: f.name,
      fileBase64: base64,
      fields: [],
      mapping: {}
    });
    setItems(prev => [created, ...prev]);
    success('PDF šablona nahrána');
    e.target.value = '';
  };

  const remove = async (id: string) => {
    const t = items.find(x => x.id === id);
    if (!t) return;
    if (!window.confirm(`Smazat šablonu "${t.name}"?`)) return warning('Akce zrušena');
    await pdfTemplatesService.remove(id);
    setItems(prev => prev.filter(x => x.id !== id));
    success('Šablona smazána');
  };

  const saveMapping = async (id: string, mapping: Record<string,string>) => {
    const updated = await pdfTemplatesService.update(id, { mapping });
    if (updated) setItems(prev => prev.map(x => x.id === id ? updated : x));
    setEditMappingFor(null);
    success('Mapování uloženo');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PDF šablony</h1>
          <p className="text-gray-600">Nahrávejte PDF formuláře a mapujte jejich pole na proměnné</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInput} type="file" accept="application/pdf" className="hidden" onChange={onUpload} aria-label="Nahrát PDF" title="Nahrát PDF" />
          <Button className="flex items-center gap-2" onClick={() => fileInput.current?.click()}>
            <FileUp className="h-4 w-4" />
            Nahrát PDF
          </Button>
          <Button className="flex items-center gap-2" onClick={() => { setNewName(''); setNewFile(null); setShowNewModal(true); }}>
            <Plus className="h-4 w-4" />
            Nová šablona
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <input
          className="w-full max-w-md px-3 py-2 border rounded-lg"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Hledat PDF šablonu…"
          aria-label="Hledat PDF šablonu"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((t) => (
          <Card key={t.id} className="hover:shadow-sm transition">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">{t.name}</CardTitle>
                    {t.fields.length > 0 && (
                      <Badge variant="secondary">{t.fields.length} polí</Badge>
                    )}
                  </div>
                  <CardDescription>{t.fileName}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditMappingFor(t)} title="Mapovat pole">
                    <Wrench className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelected(t)} title="Zobrazit detail">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600" onClick={() => remove(t.id)} title="Smazat">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-600">Žádné šablony</CardContent>
          </Card>
        )}
      </div>

      {/* Detail modal (název) */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Upravit PDF šablonu</CardTitle>
              <CardDescription>{selected.fileName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Název</label>
                  <input value={selected.name} onChange={e => setSelected({ ...selected, name: e.target.value })} className="w-full px-3 py-2 border rounded" aria-label="Název pdf šablony" placeholder="Název" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelected(null)}>Zrušit</Button>
                  <Button onClick={async () => {
                    const upd = await pdfTemplatesService.update(selected.id, { name: selected.name });
                    if (upd) setItems(prev => prev.map(x => x.id === upd.id ? upd : x));
                    setSelected(null);
                    success('Uloženo');
                  }}>Uložit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mapping modal */}
      {editMappingFor && (
        <MappingModal
          item={editMappingFor}
          onClose={() => setEditMappingFor(null)}
          onSave={saveMapping}
        />
      )}

      {/* New Template modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Nová PDF šablona</CardTitle>
              <CardDescription>Zadejte název a volitelně nahrajte PDF soubor.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Název</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Název šablony" aria-label="Název pdf šablony" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PDF soubor (volitelné)</label>
                  <input type="file" accept="application/pdf" onChange={e => setNewFile(e.target.files?.[0] || null)} aria-label="Vybrat PDF" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewModal(false)}>Zrušit</Button>
                  <Button onClick={async () => {
                    if (!newName.trim()) return alert('Zadejte název');
                    let fileBase64 = '';
                    let fileName = '';
                    if (newFile) {
                      const ab = await newFile.arrayBuffer();
                      fileBase64 = arrayBufferToBase64(ab);
                      fileName = newFile.name;
                    }
                    const created = await pdfTemplatesService.create({
                      name: newName.trim(),
                      fileName,
                      fileBase64,
                      fields: [],
                      mapping: {}
                    });
                    setItems(prev => [created, ...prev]);
                    setShowNewModal(false);
                  }}>Vytvořit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MappingModal({ item, onClose, onSave }: { item: PdfTemplate, onClose: () => void, onSave: (id: string, mapping: Record<string,string>) => void }) {
  const [local, setLocal] = useState<Record<string,string>>(() => ({ ...item.mapping }));
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldVar, setNewFieldVar] = useState('');

  const addField = () => {
    const name = newFieldName.trim();
    if (!name) return;
    setLocal(prev => ({ ...prev, [name]: newFieldVar.trim() }));
    setNewFieldName('');
    setNewFieldVar('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Mapování polí</CardTitle>
          <CardDescription>Určete, jak naplnit jednotlivá pole PDF pomocí proměnných.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(local).map(([field, variable]) => (
                <div key={field} className="flex gap-2 items-center">
                  <input value={field} onChange={e => {
                    const v = e.target.value; const entries = Object.entries(local).filter(([k]) => k !== field); const next = Object.fromEntries([...entries, [v, variable]] as [string, string][]); setLocal(next);
                  }} className="w-full px-2 py-1 border rounded" placeholder="Název pole" />
                  <input value={variable} onChange={e => setLocal(prev => ({ ...prev, [field]: e.target.value }))} className="w-full px-2 py-1 border rounded" placeholder="Proměnná (např. {{rok}}) nebo konstanta" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newFieldName} onChange={e => setNewFieldName(e.target.value)} className="w-full px-2 py-1 border rounded" placeholder="Název pole" />
              <input value={newFieldVar} onChange={e => setNewFieldVar(e.target.value)} className="w-full px-2 py-1 border rounded" placeholder="Proměnná/konstanta" />
              <Button onClick={addField}>Přidat</Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Zrušit</Button>
              <Button onClick={() => onSave(item.id, local)}>Uložit</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}