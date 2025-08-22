import React, { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Edit2, Trash2, Calendar, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

// Mock data pro dynamické proměnné
const mockVariables = [
  {
    id: '1',
    name: 'obdobi_vyuctovani',
    description: 'rok vyúčtování',
    value: '01.01.2025 - 31.12.2025',
    createdAt: '2025-07-29',
    updatedAt: '2025-08-06'
  },
  {
    id: '2', 
    name: 'rok_zuctovani',
    description: 'rok vyúčtování',
    value: '2025',
    createdAt: '2025-07-29',
    updatedAt: '2025-07-29'
  }
];

export default function DynamicVariables() {
  const { success, warning } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [variables, setVariables] = useState(() => mockVariables);
  const [modalMode, setModalMode] = useState<null | 'new' | 'edit'>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formValue, setFormValue] = useState('');

  const filteredVariables = useMemo(() => variables.filter(variable =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.description.toLowerCase().includes(searchTerm.toLowerCase())
  ), [variables, searchTerm]);

  const openNew = () => {
    setModalMode('new');
    setEditingId(null);
    setFormName('');
    setFormDesc('');
    setFormValue('');
  };

  const openEdit = (id: string) => {
    const v = variables.find(x => x.id === id);
    if (!v) return;
    setModalMode('edit');
    setEditingId(id);
    setFormName(v.name);
    setFormDesc(v.description);
    setFormValue(v.value);
  };

  const removeVar = (id: string) => {
    const v = variables.find(x => x.id === id);
    if (!v) return;
    if (!window.confirm(`Smazat proměnnou "${v.name}"?`)) return warning('Akce zrušena');
    setVariables(prev => prev.filter(x => x.id !== id));
    success('Proměnná smazána');
  };

  const saveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return warning('Zadejte název');
    if (modalMode === 'new') {
      const created = {
        id: Math.random().toString(36).slice(2),
        name: formName.trim(),
        description: formDesc.trim(),
        value: formValue,
        createdAt: new Date().toISOString().slice(0,10),
        updatedAt: new Date().toISOString().slice(0,10)
      };
      setVariables(prev => [created, ...prev]);
      success('Proměnná vytvořena');
    } else if (modalMode === 'edit' && editingId) {
      setVariables(prev => prev.map(v => v.id === editingId ? { ...v, name: formName.trim(), description: formDesc.trim(), value: formValue, updatedAt: new Date().toISOString().slice(0,10) } : v));
      success('Proměnná upravena');
    }
    setModalMode(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Správa dynamických proměnných</h1>
          <p className="text-gray-600">Spravujte globální proměnné pro e-mailové šablony</p>
        </div>
  <Button className="flex items-center gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Přidat proměnnou
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Hledat proměnné..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Variables List */}
      <div className="space-y-4">
        {filteredVariables.map((variable) => (
          <Card key={variable.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-lg">{variable.name}</CardTitle>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {`{{${variable.name}}}`}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    {variable.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(variable.id)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => removeVar(variable.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Aktuální hodnota:</h4>
                  <p className="text-lg font-mono text-gray-900">{variable.value}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Vytvořeno: {variable.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Upraveno: {variable.updatedAt}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVariables.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné proměnné nenalezeny</h3>
            <p className="text-gray-600 mb-4">
              Zkuste změnit vyhledávací kritéria nebo vytvořte novou proměnnou.
            </p>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" />
              Vytvořit první proměnnou
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="mt-8 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Settings className="h-5 w-5" />
            Nápověda k dynamickým proměnným
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <div className="space-y-2">
            <p><strong>Použití:</strong> Dynamické proměnné můžete vkládat do e-mailových šablon pomocí dvojitých složených závorek, např. <code className="bg-blue-200 px-1 rounded">&#123;&#123;obdobi_vyuctovani&#125;&#125;</code></p>
            <p><strong>Typy proměnných:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Statické:</strong> Globální hodnoty jako rok vyúčtování</li>
              <li><strong>Dynamické:</strong> Hodnoty specifické pro jednotlivá SVJ</li>
              <li><strong>Systémové:</strong> Automaticky generované hodnoty jako aktuální datum</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>{modalMode === 'new' ? 'Nová proměnná' : 'Upravit proměnnou'}</CardTitle>
              <CardDescription>
                Globální proměnné můžete používat v šablonách pomocí 
                <code className="bg-gray-100 px-1 py-0.5 rounded ml-1">&#123;&#123;nazev&#125;&#125;</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={saveForm}>
                <div>
                  <label className="block text-sm font-medium mb-1">Název proměnné</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="např. obdobi_vyuctovani" aria-label="Název proměnné" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Popis</label>
                  <input value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="krátký popis" aria-label="Popis proměnné" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hodnota</label>
                  <input value={formValue} onChange={e => setFormValue(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="hodnota" aria-label="Hodnota proměnné" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setModalMode(null)}>Zrušit</Button>
                  <Button type="submit">Uložit</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
