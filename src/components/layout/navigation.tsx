import { NavLink } from 'react-router-dom';

export function Navigation() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
      <nav className="flex items-center gap-6 text-lg font-medium">
        <NavLink
          to="/svj"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          SVJ
        </NavLink>
        <NavLink
          to="/employees"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Zaměstnanci
        </NavLink>
      </nav>
    </header>
  );
}