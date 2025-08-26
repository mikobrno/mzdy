import { ApiError, OfflineService } from './api-client'
import { selectAll, insertOne, updateById } from '@/lib/db'
import { callRpc, callFunction } from '@/lib/rpc'
import type { SVJ } from '@/types'

export interface SVJListParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'name' | 'createdAt' | 'employeeCount'
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
}

export interface SVJCreateData {
  name: string
  ico: string
  address: string
  bankAccount?: string
  dataBoxId?: string
  contactPerson: string
  contactEmail: string
  quickDescription?: string
  reportDeliveryMethod: 'manager' | 'client'
}

export interface SVJUpdateData extends Partial<SVJCreateData> {
  isActive?: boolean
}

export interface SVJStatistics {
  totalSVJ: number
  activeSVJ: number
  totalEmployees: number
  totalMonthlyPayroll: number
  recentActivity: {
    id: string
    type: 'created' | 'updated' | 'payroll_processed'
    svjName: string
    timestamp: Date
    description: string
  }[]
}

export class SVJService {
  private static readonly CACHE_KEY = 'svj_cache'

  // Získání seznamu SVJ
  static async getSVJList(params: SVJListParams = {}): Promise<{
    data: SVJ[]
    total: number
    page: number
    limit: number
  }> {
    // We'll read all SVJs and apply client-side filtering / pagination to avoid direct fetch.
    try {
      let all = await selectAll<SVJ>('svj')

      // filter by isActive
      if (params.isActive !== undefined) {
        all = all.filter(s => {
          const rec = s as unknown as Record<string, unknown>
          return Boolean(rec['is_active']) === Boolean(params.isActive)
        })
      }

      // search by name
      if (params.search) {
        const q = params.search.toLowerCase()
        all = all.filter(s => String((s as unknown as Record<string, unknown>)['name'] ?? '').toLowerCase().includes(q))
      }

      // sort
      if (params.sortBy) {
        const key = params.sortBy
        all = all.sort((a, b) => {
          const va = (a as unknown as Record<string, unknown>)[key as string]
          const vb = (b as unknown as Record<string, unknown>)[key as string]
          if (va == null && vb == null) return 0
          if (va == null) return params.sortOrder === 'asc' ? -1 : 1
          if (vb == null) return params.sortOrder === 'asc' ? 1 : -1
          if (va < vb) return params.sortOrder === 'asc' ? -1 : 1
          if (va > vb) return params.sortOrder === 'asc' ? 1 : -1
          return 0
        })
      }

  const total = all.length
  const page = params.page ?? 1
  const limit = (params.limit ?? total) || 10
      const start = (page - 1) * limit
      const data = all.slice(start, start + limit)

      const response = { data, total, page, limit }
      OfflineService.saveToCache(`${this.CACHE_KEY}_list`, response)
      return response
    } catch (error) {
      const cachedData = OfflineService.getFromCache(`${this.CACHE_KEY}_list`)
      if (cachedData) {
        console.warn('Používám cached SVJ data')
        return cachedData
      }
      throw error
    }
  }

  // Získání detailu SVJ
  static async getSVJDetail(id: string): Promise<SVJ> {
    try {
  const arr = await selectAll<SVJ>('svj', { id: id as unknown as string | number | boolean | null })
  const response = arr[0]
  // Cache pro offline režim
  OfflineService.saveToCache(`${this.CACHE_KEY}_${id}`, response)
  if (!response) throw new Error('Not found')
  return response
    } catch (error) {
      // Fallback na cached data
      const cachedData = OfflineService.getFromCache(`${this.CACHE_KEY}_${id}`)
      if (cachedData) {
        console.warn(`Používám cached data pro SVJ ${id}`)
        return cachedData
      }

      throw error
    }
  }

  // Vytvoření nového SVJ
  static async createSVJ(data: SVJCreateData): Promise<SVJ> {
    try {
  const response = await insertOne<SVJ>('svj', data as unknown as Partial<SVJ>)
  this.invalidateListCache()
  return response
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        // Specifické zpracování validačních chyb
        throw new ApiError(
          'Chyba při vytváření SVJ. Zkontrolujte zadané údaje.',
          'SVJ_CREATE_VALIDATION',
          422,
          error.details
        )
      }
      throw error
    }
  }

  // Aktualizace SVJ
  static async updateSVJ(id: string, data: SVJUpdateData): Promise<SVJ> {
    try {
  const response = await updateById<SVJ>('svj', id, data as Partial<SVJ>)
  this.invalidateCache(id)
  this.invalidateListCache()
  return response
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        throw new ApiError(
          'Chyba při aktualizaci SVJ. Zkontrolujte zadané údaje.',
          'SVJ_UPDATE_VALIDATION',
          422,
          error.details
        )
      }
      throw error
    }
  }

  // Deaktivace SVJ
  static async deactivateSVJ(id: string): Promise<void> {
    try {
  // Toggle flag in DB
  await updateById('svj', id, { is_active: false } as unknown as Record<string, unknown>)
  this.invalidateCache(id)
  this.invalidateListCache()
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        throw new ApiError(
          'SVJ nelze deaktivovat. Nejprve ukončete všechny aktivní smlouvy zaměstnanců.',
          'SVJ_DEACTIVATE_CONFLICT',
          409
        )
      }
      throw error
    }
  }

  // Aktivace SVJ
  static async activateSVJ(id: string): Promise<void> {
  await updateById('svj', id, { is_active: true } as unknown as Record<string, unknown>)
  this.invalidateCache(id)
  this.invalidateListCache()
  }

  // Statistiky SVJ
  static async getSVJStatistics(): Promise<SVJStatistics> {
    try {
  // Prefer server RPC if available
  const response = await callRpc<SVJStatistics>('get_svj_statistics')
  OfflineService.saveToCache(`${this.CACHE_KEY}_statistics`, response)
  return response
    } catch (error) {
      // Fallback na cached data
      const cachedData = OfflineService.getFromCache(`${this.CACHE_KEY}_statistics`, 2 * 60 * 1000) // 2 minuty
      if (cachedData) {
        console.warn('Používám cached statistiky SVJ')
        return cachedData
      }

      throw error
    }
  }

  // Export dat SVJ
  static async exportSVJData(id: string, format: 'xlsx' | 'csv' | 'pdf' = 'xlsx'): Promise<Blob> {
  // Prefer calling an RPC or edge function for exports
  const text = await callRpc<string>('export_svj_data', { svj_id: id, format })
  const mime = format === 'pdf' ? 'application/pdf' : format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  return new Blob([text as unknown as string], { type: mime })
  }

  // Nahrání loga SVJ
  static async uploadSVJLogo(id: string, file: File): Promise<{ logoUrl: string }> {
    try {
  // Convert file to base64 and call an edge function / RPC that handles storage
  const fileBase64 = await this.fileToBase64(file)
  const resp = await callFunction<{ logoUrl: string }>('upload_svj_logo', { id, fileBase64, fileName: file.name, mimeType: file.type })
  this.invalidateCache(id)
  return resp
    } catch (error) {
      if (error instanceof ApiError && error.status === 413) {
        throw new ApiError('Soubor je příliš velký. Maximální velikost je 2MB.', 'FILE_TOO_LARGE', 413)
      }
      if (error instanceof ApiError && error.status === 415) {
        throw new ApiError('Nepodporovaný typ souboru. Podporované formáty: JPG, PNG, SVG.', 'UNSUPPORTED_FILE_TYPE', 415)
      }
      throw error
    }
  }

  // Vyhledání SVJ podle IČO
  static async findSVJByICO(ico: string): Promise<SVJ | null> {
    try {
  const arr = await selectAll<SVJ>('svj', { ico: ico as unknown as string | number | boolean | null })
  return arr[0] ?? null
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null
      }
      throw error
    }
  }

  // Ověření dostupnosti názvu SVJ
  static async checkSVJNameAvailability(name: string, excludeId?: string): Promise<boolean> {
    try {
      const arr = await selectAll<SVJ>('svj')
  const found = arr.find(s => String((s as unknown as Record<string, unknown>)['name'] ?? '') === name && String((s as unknown as Record<string, unknown>)['id']) !== excludeId)
  return found == null
    } catch (error) {
      // V případě chyby předpokládáme, že název není dostupný
      return false
    }
  }

  // helper: convert File to base64
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Privátní metody pro cache management
  private static invalidateCache(id: string) {
    OfflineService.saveToCache(`${this.CACHE_KEY}_${id}`, null)
  }

  private static invalidateListCache() {
    OfflineService.saveToCache(`${this.CACHE_KEY}_list`, null)
    OfflineService.saveToCache(`${this.CACHE_KEY}_statistics`, null)
  }
}
