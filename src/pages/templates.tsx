import React, { useMemo, useState, useMemo as useReactMemo, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, Plus, Edit2, Trash2, Eye, Copy, Settings, Mail, Send } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/toast';
import { templatesService, type TemplateItem } from '@/services/templates';

// Data přes service (localStorage-backed)

const categoryLabels: Record<string, string> = {
  all: 'All',
  upozorneni: 'Upozornění',
  oznameni: 'Oznámení',
  pripominky: 'Připomínky',
  kontrola: 'Kontrola',
  vyuctovani: 'Vyúčtování',
  prijem_svj: 'Příjem SVJ',
}

const availableVariables = [
  { category: 'Statické', variables: ['{{nazev_svj}}', '{{rok_zuctovani}}', '{{obdobi_vyuctovani}}'] },
  { category: 'Dynamické', variables: ['{{osloveni_clenu}}', '{{osloveni_obecne}}', '{{cislo_bytu}}'] },
  { category: 'Systémové', variables: ['{{podpis_spravce}}', '{{aktualni_datum}}', '{{aktualni_mesic}}'] }
];

export default function Templates() {
  const navigate = useNavigate();
  const { success, warning } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  useEffect(() => {
    setTemplates(templatesService.getAll());
  }, []);
  const selectedCategory = searchParams.get('cat') || 'all';
  const selectedTemplateId = searchParams.get('templateId');
  const mode = searchParams.get('mode');
  const [searchTerm, setSearchTerm] = useState('');
  const [showVariables, setShowVariables] = useState(false);
  // Form state for edit/new modal
  const [formName, setFormName] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const selectedTemplate = useReactMemo(() => templates.find(x => x.id === selectedTemplateId) || null, [templates, selectedTemplateId]);

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length };
    templates.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return Object.entries({ all: counts.all, ...Object.fromEntries(Object.entries(counts).filter(([k]) => k !== 'all')) })
      .map(([key, count]) => ({ key, label: categoryLabels[key] || key, count }));
  }, [templates]);

  const setCategory = (cat: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('cat', cat);
    next.delete('templateId');
    next.delete('mode');
    setSearchParams(next);
  };

  const openPreview = (id: string) => {
    navigate(`/templates/${id}/edit?preview=1`)
  };

  const openEdit = (id: string) => {
    navigate(`/templates/${id}/edit`)
  };

  const openNew = () => {
    navigate('/templates/new')
  };

  // modal removed

  const duplicateTemplate = (id: string) => {
    const t = templates.find(x => x.id === id);
    if (!t) return;
    const created = templatesService.create({
      name: `Kopie – ${t.name}`,
      subject: t.subject,
      category: t.category,
      isActive: t.isActive,
      variables: t.variables,
      bodyPreview: t.bodyPreview,
    });
    setTemplates(prev => [created, ...prev]);
    success('Šablona zkopírována');
  };

  const deleteTemplate = (id: string) => {
    const t = templates.find(x => x.id === id);
    if (!t) return;
    if (!window.confirm(`Smazat šablonu "${t.name}"?`)) {
      return warning('Akce zrušena');
    }
  templatesService.remove(id);
  setTemplates(prev => prev.filter(x => x.id !== id));
    success('Šablona smazána');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-mailové šablony</h1>
          <p className="text-gray-600">Správa šablon pro hromadnou korespondenci</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowVariables(!showVariables)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Proměnné
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/dynamic-variables')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Správa proměnných
          </Button>
          <Button className="flex items-center gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Přidat šablonu
          </Button>
        </div>
      </div>

      {/* Variables Panel */}
      {showVariables && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Dostupné proměnné
            </CardTitle>
            <CardDescription>
              Klikněte na proměnnou pro vložení
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableVariables.map((group) => (
                <div key={group.category}>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">{group.category} proměnné:</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.variables.map((variable) => (
                      <Badge 
                        key={variable}
                        variant="secondary"
                        className="cursor-pointer hover:bg-blue-100 font-mono text-xs"
                        onClick={() => navigator.clipboard.writeText(variable)}
                      >
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> Klikněte na libovolnou proměnnou pro automatické vložení do editoru šablony. 
                Proměnné můžete vkládat jak do <strong>předmětu</strong>, tak do <strong>těla e-mailu</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
    {categories.map((category) => (
          <Button
            key={category.key}
            variant={selectedCategory === category.key ? "default" : "outline"}
            size="sm"
      onClick={() => setCategory(category.key)}
            className="whitespace-nowrap"
          >
            {category.label} ({category.count})
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Hledat šablony..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge 
                      variant={template.category === 'upozorneni' ? 'destructive' : 
                              template.category === 'oznameni' ? 'default' : 'secondary'}
                    >
                      {template.category}
                    </Badge>
                    {template.isActive && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Aktivní
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-base font-medium mb-2">
                    Předmět: {template.subject}
                  </CardDescription>
                  <p className="text-sm text-gray-600 mb-3">
                    Vytvořeno: {template.createdAt} | Upraveno: {template.updatedAt}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" aria-label="Náhled šablony" onClick={() => openPreview(template.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" aria-label="Upravit šablonu" onClick={() => openEdit(template.id)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" aria-label="Zkopírovat šablonu" onClick={() => duplicateTemplate(template.id)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" aria-label="Odeslat e‑mailem" onClick={() => navigate(`/email-compose?templateId=${template.id}`)}>
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" aria-label="Smazat šablonu" onClick={() => deleteTemplate(template.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Proměnné šablony:</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="font-mono text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 font-mono">
                    {template.bodyPreview}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
          <Card className="text-center py-12">
          <CardContent>
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné šablony nenalezeny</h3>
            <p className="text-gray-600 mb-4">
              Zkuste změnit vyhledávací kritéria nebo vytvořte novou šablonu.
            </p>
              <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" />
              Vytvořit první šablonu
            </Button>
          </CardContent>
        </Card>
      )}

  {/* Modal removed: dedicated editor routes are used now */}
    </div>
  );
}
