export type TemplateItem = {
  id: string
  name: string
  subject: string
  category: string
  isActive: boolean
  variables: string[]
  bodyPreview: string
  createdAt: string
  updatedAt: string
  usageCount: number
}

const STORAGE_KEY = 'emailTemplates';

const defaults: TemplateItem[] = [
  {
    id: '1',
    name: 'Nenulová spotřeba vody',
    subject: 'DŮLEŽITÉ | upozornění na možný únik vody',
    category: 'upozorneni',
    isActive: true,
    variables: ['{{nazev_svj}}', '{{osloveni_clenu}}', '{{podpis_spravce}}'],
    bodyPreview: 'Vážení členové {{nazev_svj}}, upozorňujeme vás na možný únik vody...',
    createdAt: '2025-07-25',
    updatedAt: '2025-08-08',
    usageCount: 3
  },
  {
    id: '2',
    name: 'Nový evidenční list',
    subject: '{{nazev_svj}} | evidenční list | jednotka č. {{cislo_bytu}}',
    category: 'oznameni',
    isActive: true,
    variables: ['{{nazev_svj}}', '{{osloveni_obecne}}', '{{osloveni_clenu}}', '{{podpis_spravce}}'],
    bodyPreview: 'Vážení vlastníci, zasíláme evidenční list jednotky č. {{cislo_bytu}}...',
    createdAt: '2025-07-25',
    updatedAt: '2025-08-10',
    usageCount: 4
  },
  {
    id: '3',
    name: 'Nový majitel bytu | data',
    subject: '{{nazev_svj}} | data pro zavedování nového člena',
    category: 'oznameni',
    isActive: true,
    variables: ['{{nazev_svj}}', '{{osloveni_obecne}}', '{{osloveni_clenu}}', '{{podpis_spravce}}'],
    bodyPreview: 'Vážení členové, zasíláme data pro zavedování nového člena...',
    createdAt: '2025-07-25',
    updatedAt: '2025-08-06',
    usageCount: 4
  }
];

function load(): TemplateItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.length > 0) return arr;
    return defaults;
  } catch {
    return defaults;
  }
}

function saveAll(items: TemplateItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const templatesService = {
  getAll(): TemplateItem[] {
    return load();
  },
  getById(id: string): TemplateItem | undefined {
    return load().find(t => t.id === id);
  },
  create(item: Omit<TemplateItem, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): TemplateItem {
    const now = new Date().toISOString().slice(0,10);
    const created: TemplateItem = { ...item, id: Math.random().toString(36).slice(2), createdAt: now, updatedAt: now, usageCount: 0 };
    const all = load();
    saveAll([created, ...all]);
    return created;
  },
  update(id: string, patch: Partial<TemplateItem>): TemplateItem | undefined {
    const all = load();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    const now = new Date().toISOString().slice(0,10);
    const merged = { ...all[idx], ...patch, updatedAt: now } as TemplateItem;
    all[idx] = merged;
    saveAll(all);
    return merged;
  },
  remove(id: string) {
    const all = load();
    saveAll(all.filter(t => t.id !== id));
  }
}
