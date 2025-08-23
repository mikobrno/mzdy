import React from 'react';
import { Navigation } from './navigation';
import { useAuth } from '@/hooks/use-auth';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Navigation />

      <div className="flex flex-1 flex-col">
        {/* Horní panel s informacemi o uživateli */}
        <header className="flex items-center justify-between bg-white p-4 shadow-md">
          <div>
            <span className="text-sm text-gray-600">Přihlášen jako:</span>
            <span className="ml-2 font-medium text-gray-800">{user?.email || 'Neznámý uživatel'}</span>
          </div>
          <button
            onClick={logout}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Odhlásit se
          </button>
        </header>

        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8 md:pl-6">
          {children}
        </main>
      </div>
    </div>
  )
}