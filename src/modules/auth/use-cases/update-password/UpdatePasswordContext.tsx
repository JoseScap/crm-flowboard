import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/modules/common/lib/supabase';
import { toast } from 'sonner';

interface UpdatePasswordContextType {
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setNewPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  handleUpdatePassword: () => Promise<void>;
  handleSubmit: (e: React.FormEvent) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
}

const UpdatePasswordContext = createContext<UpdatePasswordContextType | undefined>(undefined);

export function UpdatePasswordProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPassword) {
      timer = setTimeout(() => setShowPassword(false), 20000);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [showPassword]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showConfirmPassword) {
      timer = setTimeout(() => setShowConfirmPassword(false), 20000);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [showConfirmPassword]);

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error('Error al actualizar la contraseña');
        return;
      }

      toast.success('Contraseña actualizada correctamente');
      navigate('/login');
    } catch (error: any) {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdatePassword();
  };

  const value: UpdatePasswordContextType = {
    newPassword,
    confirmPassword,
    loading,
    showPassword,
    showConfirmPassword,
    setNewPassword,
    setConfirmPassword,
    handleUpdatePassword,
    handleSubmit,
    setShowPassword,
    setShowConfirmPassword,
  };

  return (
    <UpdatePasswordContext.Provider value={value}>
      {children}
    </UpdatePasswordContext.Provider>
  );
}

export function useUpdatePasswordContext() {
  const context = useContext(UpdatePasswordContext);
  if (!context) {
    throw new Error('useUpdatePasswordContext must be used within a UpdatePasswordProvider');
  }
  return context;
}
