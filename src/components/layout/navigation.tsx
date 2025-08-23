import { NavLink } from 'react-router-dom';
import React from 'react';

// Primary nav: keep the top list short (like original UI)
const primary = [
  { to: '/', label: 'Dashboard' },
  { to: '/svj', label: 'SVJ' },
  { to: '/employees', label: 'Zaměstnanci' },
  { to: '/payrolls', label: 'Výplaty' },
  { to: '/pdf-templates', label: 'PDF šablony' },
  { to: '/settings', label: 'Nastavení' }
]

export function Navigation() {
  return (
    <aside className="z-30 hidden md:flex md:w-56 md:flex-col md:gap-3 md:py-4 md:px-3 bg-background border-r">
      <div className="flex items-center px-2 pb-3">
        <h1 className="text-base font-semibold">Mzdový portál</h1>
      </div>

      <nav className="flex flex-col gap-1 px-1">
        {primary.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-2 pt-4">
        <div className="text-xs text-muted-foreground">Verze UI</div>
        <div className="text-sm font-medium">Supabase-only</div>
      </div>
    </aside>
  );
}