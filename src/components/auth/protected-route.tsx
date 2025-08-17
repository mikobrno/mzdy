import { useAuth } from '@/hooks/use-auth'
import { Navigate, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermissions?: string[]
  requiredRoles?: string[]
  fallback?: ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [],
  fallback 
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission, isInRole } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Uložení aktuální URL pro přesměrování po přihlášení
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Kontrola oprávnění
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    )
    
    if (!hasAllPermissions) {
      return fallback || <AccessDenied />
    }
  }

  // Kontrola rolí
  if (requiredRoles.length > 0) {
    const hasRequiredRole = isInRole(requiredRoles)
    
    if (!hasRequiredRole) {
      return fallback || <AccessDenied />
    }
  }

  return <>{children}</>
}

function AccessDenied() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Přístup zamítnut
        </h2>
        <p className="text-gray-600 mb-4">
          Nemáte dostatečná oprávnění pro zobrazení této stránky.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Zpět
        </button>
      </div>
    </div>
  )
}
