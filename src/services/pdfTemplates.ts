export type PdfFieldMapping = Record<string, string>; // fieldName -> variableName or static value marker

export type PdfTemplate = {
  id: string;
  name: string;
  fileName: string;
  fileBase64: string; // base64-encoded PDF
  fields: string[]; // discovered field names
  mapping: PdfFieldMapping; // field -> variableName
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'pdfTemplates';

function load(): PdfTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return [];
  } catch {
    return [];
  }
}

function saveAll(items: PdfTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const pdfTemplatesService = {
  getAll(): PdfTemplate[] {
    return load();
  },
  getById(id: string): PdfTemplate | undefined {
    return load().find(t => t.id === id);
  },
  create(t: Omit<PdfTemplate, 'id' | 'createdAt' | 'updatedAt'>): PdfTemplate {
    const now = new Date().toISOString().slice(0,10);
    const item: PdfTemplate = { ...t, id: Math.random().toString(36).slice(2), createdAt: now, updatedAt: now };
    const all = load();
    saveAll([item, ...all]);
    return item;
  },
  update(id: string, patch: Partial<PdfTemplate>): PdfTemplate | undefined {
    const all = load();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    const now = new Date().toISOString().slice(0,10);
    const merged = { ...all[idx], ...patch, updatedAt: now } as PdfTemplate;
    all[idx] = merged;
    saveAll(all);
    return merged;
  },
  remove(id: string) {
    const all = load();
    saveAll(all.filter(t => t.id !== id));
  }
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}
