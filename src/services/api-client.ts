// Rozšířené API služby s real API integration a error handling

import { useToast } from '@/components/ui/toast'

// API konfigurace
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api'
const API_TIMEOUT = 10000 // 10 sekund

// API client s interceptory pro error handling
export class ApiClient {
  private baseURL: string
  private timeout: number
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseURL = API_BASE_URL
    this.timeout = API_TIMEOUT
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token')
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        await this.handleErrorResponse(response)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }

      return response.text() as unknown as T
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Požadavek vypršel', 'TIMEOUT', 408)
        }
      }
      
      throw new ApiError('Síťová chyba', 'NETWORK_ERROR', 0)
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = 'Neznámá chyba'
    let errorCode = 'UNKNOWN_ERROR'
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
      errorCode = errorData.code || errorCode
    } catch {
      // Fallback pokud response není JSON
      errorMessage = response.statusText || `HTTP ${response.status}`
    }

    // Specifické zpracování podle status kódu
    switch (response.status) {
      case 401:
        // Neautorizovaný přístup - odhlásit uživatele
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        window.location.href = '/login'
        throw new ApiError('Neautorizovaný přístup', 'UNAUTHORIZED', 401)
      
      case 403:
        throw new ApiError('Nemáte oprávnění k této akci', 'FORBIDDEN', 403)
      
      case 404:
        throw new ApiError('Požadovaný zdroj nebyl nalezen', 'NOT_FOUND', 404)
      
      case 422:
        throw new ApiError(errorMessage, 'VALIDATION_ERROR', 422)
      
      case 429:
        throw new ApiError('Příliš mnoho požadavků. Zkuste to později.', 'RATE_LIMIT', 429)
      
      case 500:
        throw new ApiError('Vnitřní chyba serveru', 'SERVER_ERROR', 500)
      
      default:
        throw new ApiError(errorMessage, errorCode, response.status)
    }
  }

  // HTTP metody
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Nahrávání souborů
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = localStorage.getItem('auth_token')
    
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Nepostavovat Content-Type pro FormData
      },
      body: formData,
    })
  }
}

// Custom API Error třída
export class ApiError extends Error {
  public code: string
  public status: number
  public details?: any

  constructor(message: string, code: string, status: number, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Hook pro API error handling s toast notifikacemi
export function useApiErrorHandler() {
  const { error: showError } = useToast()

  const handleApiError = (error: unknown, customMessage?: string) => {
    console.error('API Error:', error)

    if (error instanceof ApiError) {
      const message = customMessage || error.message
      
      switch (error.code) {
        case 'VALIDATION_ERROR':
          showError('Validační chyba', message)
          break
        case 'UNAUTHORIZED':
          showError('Neautorizovaný přístup', 'Přihlaste se prosím znovu')
          break
        case 'FORBIDDEN':
          showError('Přístup zamítnut', message)
          break
        case 'NOT_FOUND':
          showError('Zdroj nenalezen', message)
          break
        case 'TIMEOUT':
          showError('Časový limit', 'Požadavek trval příliš dlouho')
          break
        case 'NETWORK_ERROR':
          showError('Síťová chyba', 'Zkontrolujte internetové připojení')
          break
        default:
          showError('Chyba', message)
      }
    } else if (error instanceof Error) {
      showError('Neočekávaná chyba', error.message)
    } else {
      showError('Neznámá chyba', 'Došlo k neočekávané chybě')
    }
  }

  return { handleApiError }
}

// Retry logika pro API požadavky
export async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error as Error
      
      // Nevystavět retry pro určité typy chyb
      if (error instanceof ApiError) {
        if ([401, 403, 404, 422].includes(error.status)) {
          throw error
        }
      }

      if (attempt === maxRetries) {
        throw lastError
      }

      // Exponenciální backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }

  throw lastError!
}

// React Query error handler
export function reactQueryErrorHandler(error: unknown) {
  console.error('React Query Error:', error)
  
  // Můžete zde přidat globální error handling
  // například odeslání error reportů do logging servisu
}

// Fallback pro offline režim
export class OfflineService {
  private static CACHE_KEY = 'offline_cache'
  
  static saveToCache(key: string, data: any) {
    try {
      const cache = this.getCache()
      cache[key] = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.warn('Nelze uložit do offline cache:', error)
    }
  }

  static getFromCache(key: string, maxAge = 5 * 60 * 1000) { // 5 minut default
    try {
      const cache = this.getCache()
      const item = cache[key]
      
      if (!item) return null
      
      if (Date.now() - item.timestamp > maxAge) {
        delete cache[key]
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
        return null
      }
      
      return item.data
    } catch (error) {
      console.warn('Nelze načíst z offline cache:', error)
      return null
    }
  }

  private static getCache() {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY)
      return cache ? JSON.parse(cache) : {}
    } catch {
      return {}
    }
  }

  static clearCache() {
    localStorage.removeItem(this.CACHE_KEY)
  }
}

// Export všech služeb
export * from './svj-service'
