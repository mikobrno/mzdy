import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/supabaseClient';

// Definujeme, jaký tvar budou mít data v našem kontextu
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

// Vytvoříme samotný kontext s výchozí hodnotou null
const AuthContext = createContext<AuthContextType | null>(null);

// Vytvoříme komponentu AuthProvider, která bude obalovat naši aplikaci
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Získáme aktuální sezení při prvním načtení
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Nasloucháme změnám stavu přihlášení (přihlášení, odhlášení)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Při odmontování komponenty se odhlásíme z naslouchání
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
  };

  // Poskytneme hodnoty všem potomkům
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Vytvoříme si vlastní hook pro snadnější přístup k datům z kontextu
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
