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

import { apiService } from '@/services/api';

export const pdfTemplatesService = {
  async getAll(): Promise<PdfTemplate[]> {
    const rows = await apiService.getPdfTemplates()
    return (rows || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      fileName: r.file_name || r.fileName || '',
      fileBase64: r.file_base64 || r.fileBase64 || '',
      fields: r.fields || [],
      mapping: r.mapping || {},
      createdAt: r.created_at || r.createdAt || '' ,
      updatedAt: r.updated_at || r.updatedAt || ''
    }))
  },
  async getById(id: string): Promise<PdfTemplate | undefined> {
    const all = await pdfTemplatesService.getAll()
    return all.find(t => t.id === id)
  },
  async create(t: Omit<PdfTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PdfTemplate> {
    const payload = {
      name: t.name,
      file_name: t.fileName,
      file_base64: t.fileBase64,
      fields: t.fields,
      mapping: t.mapping,
    }
    const r = await apiService.createPdfTemplate(payload)
    return {
      id: r.id,
      name: r.name,
      fileName: r.file_name,
      fileBase64: r.file_base64,
      fields: r.fields || [],
      mapping: r.mapping || {},
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  },
  async update(id: string, patch: Partial<PdfTemplate>): Promise<PdfTemplate | undefined> {
    const payload: any = {}
    if (patch.name !== undefined) payload.name = patch.name
    if ((patch as any).fileName !== undefined) payload.file_name = (patch as any).fileName
    if ((patch as any).fileBase64 !== undefined) payload.file_base64 = (patch as any).fileBase64
    if (patch.fields !== undefined) payload.fields = patch.fields
    if (patch.mapping !== undefined) payload.mapping = patch.mapping
    const r = await apiService.updatePdfTemplate(id, payload)
    if (!r) return undefined
    return {
      id: r.id,
      name: r.name,
      fileName: r.file_name,
      fileBase64: r.file_base64,
      fields: r.fields || [],
      mapping: r.mapping || {},
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  },
  async remove(id: string) {
    await apiService.deletePdfTemplate(id)
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
