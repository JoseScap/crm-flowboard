import { createContext, useContext, useState, ReactNode } from 'react';
import supabase from '@/modules/common/lib/supabase';
import { toast } from 'sonner';

interface PasswordRecoveryRequestContextType {
  email: string;
  loading: boolean;
  setEmail: (email: string) => void;
  handleSendResetEmail: () => Promise<void>;
  handleSubmit: (e: React.FormEvent) => void;
}

const PasswordRecoveryRequestContext = createContext<PasswordRecoveryRequestContextType | undefined>(undefined);

export function PasswordRecoveryRequestProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      toast.error('Por favor, ingresa tu correo electrónico');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        console.error('Error sending reset email:', error);
        toast.error('Error al enviar el correo de restablecimiento');
        return;
      }

      toast.success('Correo de restablecimiento enviado. Por favor, revisa tu bandeja de entrada.');
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendResetEmail();
  };

  const value: PasswordRecoveryRequestContextType = {
    email,
    loading,
    setEmail,
    handleSendResetEmail,
    handleSubmit,
  };

  return (
    <PasswordRecoveryRequestContext.Provider value={value}>
      {children}
    </PasswordRecoveryRequestContext.Provider>
  );
}

export function usePasswordRecoveryRequestContext() {
  const context = useContext(PasswordRecoveryRequestContext);
  if (!context) {
    throw new Error('usePasswordRecoveryRequestContext must be used within a PasswordRecoveryRequestProvider');
  }
  return context;
}
