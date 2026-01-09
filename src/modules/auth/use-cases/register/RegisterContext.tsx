import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/modules/common/lib/supabase';
import { toast } from 'sonner';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterContextType {
  formData: RegisterFormData;
  loading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  handleChange: (field: keyof RegisterFormData, value: string) => void;
  handleRegister: () => Promise<void>;
  handleSubmit: (e: React.FormEvent) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

const defaultFormData: RegisterFormData = {
  email: '',
  password: '',
  confirmPassword: '',
};

export function RegisterProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>(defaultFormData);
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

  const handleChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        toast.error(error.message || 'Error al registrar usuario');
        return;
      }

      if (data.user) {
        toast.success('Registro exitoso. Por favor verifica tu correo electrónico.');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister();
  };

  const value: RegisterContextType = {
    formData,
    loading,
    showPassword,
    showConfirmPassword,
    handleChange,
    handleRegister,
    handleSubmit,
    setShowPassword,
    setShowConfirmPassword,
  };

  return (
    <RegisterContext.Provider value={value}>
      {children}
    </RegisterContext.Provider>
  );
}

export function useRegisterContext() {
  const context = useContext(RegisterContext);
  if (!context) {
    throw new Error('useRegisterContext must be used within a RegisterProvider');
  }
  return context;
}
