import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SVJService, type SVJListParams, type SVJCreateData, type SVJUpdateData } from '@/services/svj-service'
import { useApiErrorHandler } from '@/services/api-client'
import { useToast } from '@/components/ui/toast'

// Hook pro seznam SVJ
export function useSVJList(params: SVJListParams = {}) {
  return useQuery({
    queryKey: ['svj', 'list', params],
    queryFn: () => SVJService.getSVJList(params),
    staleTime: 1000 * 60 * 5 // 5 minut
  })
}

// Hook pro detail SVJ
export function useSVJDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['svj', 'detail', id],
    queryFn: () => SVJService.getSVJDetail(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2 // 2 minuty
  })
}

// Hook pro vytvoření SVJ
export function useCreateSVJ() {
  const queryClient = useQueryClient()
  const { handleApiError } = useApiErrorHandler()
  const { success } = useToast()

  return useMutation({
    mutationFn: (data: SVJCreateData) => SVJService.createSVJ(data),
    onSuccess: (newSVJ) => {
      // Invalidace cache
      queryClient.invalidateQueries({ queryKey: ['svj', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['svj', 'statistics'] })
      
      success('SVJ vytvořeno', `SVJ "${newSVJ.name}" bylo úspěšně vytvořeno`)
    },
    onError: (error) => {
      handleApiError(error, 'Chyba při vytváření SVJ')
    }
  })
}

// Hook pro aktualizaci SVJ
export function useUpdateSVJ() {
  const queryClient = useQueryClient()
  const { handleApiError } = useApiErrorHandler()
  const { success } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SVJUpdateData }) => 
      SVJService.updateSVJ(id, data),
    onSuccess: (updatedSVJ) => {
      // Optimistic update
      queryClient.setQueryData(['svj', 'detail', updatedSVJ.id], updatedSVJ)
      
      // Invalidace cache
      queryClient.invalidateQueries({ queryKey: ['svj', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['svj', 'statistics'] })
      
      success('SVJ aktualizováno', 'Změny byly úspěšně uloženy')
    },
    onError: (error) => {
      handleApiError(error, 'Chyba při aktualizaci SVJ')
    }
  })
}

// Hook pro deaktivaci/aktivaci SVJ
export function useSVJStatusMutation() {
  const queryClient = useQueryClient()
  const { handleApiError } = useApiErrorHandler()
  const { success } = useToast()

  const deactivate = useMutation({
    mutationFn: (id: string) => SVJService.deactivateSVJ(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['svj', 'detail', id] })
      queryClient.invalidateQueries({ queryKey: ['svj', 'list'] })
      
      success('SVJ deaktivováno', 'SVJ bylo úspěšně deaktivováno')
    },
    onError: (error) => {
      handleApiError(error, 'Chyba při deaktivaci SVJ')
    }
  })

  const activate = useMutation({
    mutationFn: (id: string) => SVJService.activateSVJ(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['svj', 'detail', id] })
      queryClient.invalidateQueries({ queryKey: ['svj', 'list'] })
      
      success('SVJ aktivováno', 'SVJ bylo úspěšně aktivováno')
    },
    onError: (error) => {
      handleApiError(error, 'Chyba při aktivaci SVJ')
    }
  })

  return { deactivate, activate }
}

// Hook pro statistiky SVJ
export function useSVJStatistics() {
  return useQuery({
    queryKey: ['svj', 'statistics'],
    queryFn: () => SVJService.getSVJStatistics(),
    staleTime: 1000 * 60 * 2, // 2 minuty
    refetchInterval: 1000 * 60 * 5 // Refresh každých 5 minut
  })
}

// Hook pro pokročilé vyhledávání SVJ
export function useSVJSearch() {
  const [searchParams, setSearchParams] = useState<SVJListParams>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    isActive: undefined
  })

  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce pro vyhledávání
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchParams.search || '')
    }, 500)

    return () => clearTimeout(timer)
  }, [searchParams.search])

  const queryParams = {
    ...searchParams,
    search: debouncedSearch
  }

  const query = useSVJList(queryParams)

  const updateSearch = useCallback((newParams: Partial<SVJListParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams,
      page: newParams.search !== undefined ? 1 : prev.page // Reset page při vyhledávání
    }))
  }, [])

  const resetSearch = useCallback(() => {
    setSearchParams({
      page: 1,
      limit: 10,
      search: '',
      sortBy: 'name',
      sortOrder: 'asc',
      isActive: undefined
    })
  }, [])

  return {
    ...query,
    searchParams,
    updateSearch,
    resetSearch,
    isSearching: !!debouncedSearch
  }
}

// Hook pro nahrávání souborů s progress tracking
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { handleApiError } = useApiErrorHandler()
  const { success } = useToast()

  const uploadSVJLogo = useCallback(async (svjId: string, file: File) => {
    setIsUploading(true)
    setProgress(0)

    try {
      // Simulace progress (v reálné aplikaci by to sledovalo skutečný progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const result = await SVJService.uploadSVJLogo(svjId, file)
      
      clearInterval(progressInterval)
      setProgress(100)
      
      success('Logo nahráno', 'Logo SVJ bylo úspěšně nahráno')
      
      setTimeout(() => {
        setProgress(0)
        setIsUploading(false)
      }, 1000)

      return result
    } catch (error) {
      setIsUploading(false)
      setProgress(0)
      handleApiError(error, 'Chyba při nahrávání loga')
      throw error
    }
  }, [handleApiError, success])

  return {
    uploadSVJLogo,
    isUploading,
    progress
  }
}

// Hook pro export dat
export function useDataExport() {
  const [isExporting, setIsExporting] = useState(false)
  const { handleApiError } = useApiErrorHandler()
  const { success } = useToast()

  const exportSVJData = useCallback(async (
    svjId: string, 
    format: 'xlsx' | 'csv' | 'pdf' = 'xlsx'
  ) => {
    setIsExporting(true)

    try {
      const blob = await SVJService.exportSVJData(svjId, format)
      
      // Stažení souboru
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `svj-data-${svjId}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      success('Export dokončen', `Data byla exportována do formátu ${format.toUpperCase()}`)
    } catch (error) {
      handleApiError(error, 'Chyba při exportu dat')
    } finally {
      setIsExporting(false)
    }
  }, [handleApiError, success])

  return {
    exportSVJData,
    isExporting
  }
}

// Hook pro validaci názvů SVJ
export function useSVJNameValidation() {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  const checkNameAvailability = useCallback(async (name: string, excludeId?: string) => {
    if (!name.trim()) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)

    try {
      const available = await SVJService.checkSVJNameAvailability(name, excludeId)
      setIsAvailable(available)
    } catch (error) {
      console.error('Chyba při kontrole dostupnosti názvu:', error)
      setIsAvailable(null)
    } finally {
      setIsChecking(false)
    }
  }, [])

  const resetValidation = useCallback(() => {
    setIsAvailable(null)
    setIsChecking(false)
  }, [])

  return {
    checkNameAvailability,
    resetValidation,
    isChecking,
    isAvailable
  }
}
