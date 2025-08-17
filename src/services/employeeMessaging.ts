export type EmployeeAttachment = {
  id: string
  name: string
  mime: string
  size: number
  dataBase64: string
}

export type EmployeeMessagePrefs = {
  employeeId: string
  defaultTemplateId?: string
  includeSlipByDefault?: boolean
  uploads: EmployeeAttachment[]
  updatedAt: string
}

const STORAGE_KEY = 'employeeMessagePrefs'

function loadAll(): EmployeeMessagePrefs[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function saveAll(items: EmployeeMessagePrefs[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const employeeMessagingService = {
  get(employeeId: string): EmployeeMessagePrefs {
    const all = loadAll()
    const found = all.find(x => x.employeeId === employeeId)
    if (found) return found
    const fresh: EmployeeMessagePrefs = { employeeId, uploads: [], includeSlipByDefault: true, updatedAt: new Date().toISOString() }
    saveAll([fresh, ...all])
    return fresh
  },
  setDefaultTemplate(employeeId: string, templateId?: string) {
    const all = loadAll()
    const idx = all.findIndex(x => x.employeeId === employeeId)
    const now = new Date().toISOString()
    if (idx >= 0) {
      all[idx] = { ...all[idx], defaultTemplateId: templateId, updatedAt: now }
    } else {
      all.unshift({ employeeId, uploads: [], includeSlipByDefault: true, defaultTemplateId: templateId, updatedAt: now })
    }
    saveAll(all)
  },
  setIncludeSlip(employeeId: string, include: boolean) {
    const all = loadAll()
    const idx = all.findIndex(x => x.employeeId === employeeId)
    const now = new Date().toISOString()
    if (idx >= 0) {
      all[idx] = { ...all[idx], includeSlipByDefault: include, updatedAt: now }
    } else {
      all.unshift({ employeeId, uploads: [], includeSlipByDefault: include, updatedAt: now })
    }
    saveAll(all)
  },
  addUpload(employeeId: string, file: { name: string; mime: string; size: number; dataBase64: string }): EmployeeAttachment {
    const all = loadAll()
    const idx = all.findIndex(x => x.employeeId === employeeId)
    const now = new Date().toISOString()
    const att: EmployeeAttachment = { id: Math.random().toString(36).slice(2), ...file }
    if (idx >= 0) {
      all[idx] = { ...all[idx], uploads: [att, ...all[idx].uploads], updatedAt: now }
    } else {
      all.unshift({ employeeId, uploads: [att], includeSlipByDefault: true, updatedAt: now })
    }
    saveAll(all)
    return att
  },
  removeUpload(employeeId: string, attachmentId: string) {
    const all = loadAll()
    const idx = all.findIndex(x => x.employeeId === employeeId)
    if (idx < 0) return
    all[idx] = { ...all[idx], uploads: all[idx].uploads.filter(u => u.id !== attachmentId), updatedAt: new Date().toISOString() }
    saveAll(all)
  }
}
