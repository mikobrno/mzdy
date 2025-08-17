import { apiClient, ApiError, OfflineService } from './api-client'
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
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.search) queryParams.append('search', params.search)
      if (params.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())

      const response = await apiClient.get<{
        data: SVJ[]
        total: number
        page: number
        limit: number
      }>(`/svj?${queryParams.toString()}`)

      // Cache pro offline režim
      OfflineService.saveToCache(`${this.CACHE_KEY}_list`, response)

      return response
    } catch (error) {
      // Fallback na cached data
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
      const response = await apiClient.get<SVJ>(`/svj/${id}`)
      
      // Cache pro offline režim
      OfflineService.saveToCache(`${this.CACHE_KEY}_${id}`, response)
      
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
      const response = await apiClient.post<SVJ>('/svj', data)
      
      // Invalidace cache
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
      const response = await apiClient.put<SVJ>(`/svj/${id}`, data)
      
      // Invalidace cache
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
      await apiClient.patch(`/svj/${id}/deactivate`)
      
      // Invalidace cache
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
    try {
      await apiClient.patch(`/svj/${id}/activate`)
      
      // Invalidace cache
      this.invalidateCache(id)
      this.invalidateListCache()
    } catch (error) {
      throw error
    }
  }

  // Statistiky SVJ
  static async getSVJStatistics(): Promise<SVJStatistics> {
    try {
      const response = await apiClient.get<SVJStatistics>('/svj/statistics')
      
      // Cache na kratší dobu
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
    try {
      const response = await fetch(`${apiClient}/svj/${id}/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        throw new ApiError('Chyba při exportu dat', 'EXPORT_ERROR', response.status)
      }

      return await response.blob()
    } catch (error) {
      throw error
    }
  }

  // Nahrání loga SVJ
  static async uploadSVJLogo(id: string, file: File): Promise<{ logoUrl: string }> {
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await apiClient.upload<{ logoUrl: string }>(`/svj/${id}/logo`, formData)
      
      // Invalidace cache
      this.invalidateCache(id)
      
      return response
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
      const response = await apiClient.get<{ data: SVJ | null }>(`/svj/find-by-ico/${ico}`)
      return response.data
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
      const queryParams = new URLSearchParams({ name })
      if (excludeId) queryParams.append('excludeId', excludeId)
      
      const response = await apiClient.get<{ available: boolean }>(`/svj/check-name?${queryParams.toString()}`)
      return response.available
    } catch (error) {
      // V případě chyby předpokládáme, že název není dostupný
      return false
    }
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

// Mock implementace pro development
export class MockSVJService {
  static async getSVJList(params: SVJListParams = {}) {
    // Simulace delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockData: SVJ[] = [
      {
        id: '1',
        name: 'SVJ Zahradní město',
        ico: '12345678',
        address: 'Zahradní 123, Praha 6',
        bankAccount: '1234567890/0100',
        dataBoxId: 'abc123',
        contactPerson: 'Jan Novák',
        contactEmail: 'jan.novak@email.com',
        quickDescription: 'Moderní bytový dům s 45 jednotkami',
        reportDeliveryMethod: 'manager',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2024-03-10')
      },
      // ... další mock data
    ]

    return {
      data: mockData.slice(0, params.limit || 10),
      total: mockData.length,
      page: params.page || 1,
      limit: params.limit || 10
    }
  }

  // ... další mock metody
}
