// context/AuthContext.ts
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabseClient';

interface AuthContextType {
  session: any; // You can define a more specific type based on your needs
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null); // Define a specific type for session if you have one

  useEffect(() => {
    const { data: { session } } = supabase.auth.getSession();
    setSession(session);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
