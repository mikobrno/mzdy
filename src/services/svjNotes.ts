export type SvjNote = {
  id: string
  svjId: string
  title: string
  body: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'svjNotes'

function loadAll(): SvjNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function saveAll(items: SvjNote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const svjNotesService = {
  list(svjId: string): SvjNote[] {
    return loadAll().filter(n => n.svjId === svjId)
  },
  create(data: { svjId: string; title: string; body: string; pinned?: boolean }): SvjNote {
    const now = new Date().toISOString()
    const item: SvjNote = {
      id: Math.random().toString(36).slice(2),
      svjId: data.svjId,
      title: data.title.trim(),
      body: data.body.trim(),
      pinned: !!data.pinned,
      createdAt: now,
      updatedAt: now,
    }
    const all = loadAll()
    saveAll([item, ...all])
    return item
  },
  update(id: string, patch: Partial<Omit<SvjNote, 'id' | 'svjId' | 'createdAt'>>): SvjNote | undefined {
    const all = loadAll()
    const idx = all.findIndex(n => n.id === id)
    if (idx === -1) return undefined
    const now = new Date().toISOString()
    const merged = { ...all[idx], ...patch, updatedAt: now } as SvjNote
    all[idx] = merged
    saveAll(all)
    return merged
  },
  remove(id: string) {
    const all = loadAll()
    saveAll(all.filter(n => n.id !== id))
  },
  togglePin(id: string): SvjNote | undefined {
    const all = loadAll()
    const idx = all.findIndex(n => n.id === id)
    if (idx === -1) return undefined
    const now = new Date().toISOString()
    all[idx] = { ...all[idx], pinned: !all[idx].pinned, updatedAt: now }
    saveAll(all)
    return all[idx]
  }
}
