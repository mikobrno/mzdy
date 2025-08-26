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

export function load(): PdfTemplate[] {
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

export function saveAll(items: PdfTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

import { callRpc, callFunction } from '@/lib/rpc'
import { uploadToBucket, getSignedUrl, buildPdfPath } from '@/lib/storage'
// keep local helpers arrayBufferToBase64 and base64ToUint8Array in this file
// Note: we intentionally keep the public API of this module stable; internals now use Supabase RPCs and Storage

export const pdfTemplatesService = {
  async getAll(): Promise<PdfTemplate[]> {
    // Use RPC or direct table read via existing api layer (supabase-api) if available
    // Here we call an RPC 'list_pdf_templates' if present, otherwise fall back to reading from table via RPC.
    const rows = await callRpc<Record<string, unknown>[]>('list_pdf_templates').catch(async () => {
      // fallback to a simple RPC that returns all pdf_templates rows
      return await callRpc<Record<string, unknown>[]>('select_pdf_templates')
    })
    return (rows || []).map((r: unknown) => {
      const rec = r as unknown as Record<string, unknown>
      return {
        id: String(rec['id']),
        name: String(rec['name']),
        // db column is file_path; UI expects fileName for display — prefer file_name then file_path
        fileName: String(rec['file_name'] ?? rec['fileName'] ?? rec['file_path'] ?? ''),
        fileBase64: String(rec['file_base64'] ?? rec['fileBase64'] ?? ''),
        // db column is field_mappings (jsonb)
        fields: (rec['fields'] as unknown as string[]) ?? [],
        mapping: (rec['field_mappings'] ?? rec['mapping'] ?? {}) as PdfFieldMapping,
        createdAt: String(rec['created_at'] ?? rec['createdAt'] ?? ''),
        updatedAt: String(rec['updated_at'] ?? rec['updatedAt'] ?? ''),
      }
    })
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
    const r = await callRpc<Record<string, unknown>>('insert_pdf_template', payload).catch(async () => {
      return await callRpc<Record<string, unknown>>('create_pdf_template', payload)
    })
    const rec = r as unknown as Record<string, unknown>
    return {
      id: String(rec['id']),
      name: String(rec['name']),
  fileName: String(rec['file_name'] ?? rec['file_path'] ?? ''),
  fileBase64: String(rec['file_base64'] ?? ''),
  fields: (rec['fields'] as unknown as string[]) ?? [],
  mapping: (rec['field_mappings'] ?? rec['mapping'] ?? {}) as PdfFieldMapping,
  createdAt: String(rec['created_at']),
  updatedAt: String(rec['updated_at']),
    }
  },
  async update(id: string, patch: Partial<PdfTemplate>): Promise<PdfTemplate | undefined> {
    const payload: Record<string, unknown> = {}
    if (patch.name !== undefined) payload.name = patch.name
    if (patch.fileName !== undefined) payload.file_name = patch.fileName
    if (patch.fileBase64 !== undefined) payload.file_base64 = patch.fileBase64
    if (patch.fields !== undefined) payload.fields = patch.fields
    if (patch.mapping !== undefined) payload.mapping = patch.mapping
    const r = await callRpc<Record<string, unknown>>('update_pdf_template', { id, patch: payload }).catch(async () => {
      return await callRpc<Record<string, unknown>>('patch_pdf_template', { id, patch: payload })
    })
    if (!r) return undefined
    const rec = r as unknown as Record<string, unknown>
    return {
      id: String(rec['id']),
      name: String(rec['name']),
  fileName: String(rec['file_name'] ?? rec['file_path'] ?? ''),
  fileBase64: String(rec['file_base64'] ?? ''),
  fields: (rec['fields'] as unknown as string[]) ?? [],
  mapping: (rec['field_mappings'] ?? rec['mapping'] ?? {}) as PdfFieldMapping,
  createdAt: String(rec['created_at']),
  updatedAt: String(rec['updated_at']),
    }
  },
  async remove(id: string) {
    await callRpc('delete_pdf_template', { id }).catch(async () => await callRpc('remove_pdf_template', { id }))
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

// New helpers: generate via RPC or Edge Function and upload to Supabase Storage
export async function generatePdf(templateId: string, payload: Record<string, unknown>) {
  const data = await callRpc<{ base64: string }>('generate_pdf', { template_id: templateId, payload })
  const bytes = base64ToUint8Array(data.base64)
  return new Blob([bytes.buffer as unknown as ArrayBuffer], { type: 'application/pdf' })
}

export async function generatePdfViaFunction(templateId: string, payload: Record<string, unknown>) {
  const data = await callFunction<{ base64: string }>('generate_pdf', { templateId, payload })
  const bytes = base64ToUint8Array(data.base64)
  return new Blob([bytes.buffer as unknown as ArrayBuffer], { type: 'application/pdf' })
}

export async function generateAndStorePdf(
  templateId: string,
  payload: Record<string, unknown>,
  opts?: { svjId: string; makeSignedUrl?: boolean; useEdgeFn?: boolean; signedUrlTtl?: number }
) {
  const blob = opts?.useEdgeFn ? await generatePdfViaFunction(templateId, payload) : await generatePdf(templateId, payload)
  if (!opts?.svjId) throw new Error('svjId is required to store PDFs in a scoped path')
  const path = await buildPdfPath(opts.svjId, templateId)
  await uploadToBucket('pdf', path, blob, 'application/pdf')
  if (opts?.makeSignedUrl) {
    const ttl = Number.isFinite(opts.signedUrlTtl) ? (opts.signedUrlTtl as number) : 3600
    const url = await getSignedUrl('pdf', path, ttl)
    return { bucket: 'pdf', path, signedUrl: url }
  }
  return { bucket: 'pdf', path }
}
