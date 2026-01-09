import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/modules/common/lib/supabase';
import { toast } from 'sonner';

const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI_FOR_LOGIN

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginContextType {
  // Form state
  loginFormData: LoginFormData;
  
  // Loading state
  loading: boolean;
  
  // UI state
  showPassword: boolean;
  
  // Handlers
  handleChangeLoginFormData: <T extends keyof LoginFormData>(field: T, value: LoginFormData[T]) => void;
  handleLogin: () => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  setShowPassword: (show: boolean) => void;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

const defaultLoginFormData: LoginFormData = {
  email: '',
  password: '',
};

export function LoginProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [loginFormData, setLoginFormData] = useState<LoginFormData>(defaultLoginFormData);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPassword) {
      timer = setTimeout(() => {
        setShowPassword(false);
      }, 20000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showPassword]);


  const handleChangeLoginFormData = <T extends keyof LoginFormData>(field: T, value: LoginFormData[T]) => {
    setLoginFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!loginFormData.email.trim() || !loginFormData.password.trim()) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginFormData.email.trim(),
        password: loginFormData.password,
      });

      if (error) {
        toast.error('Error al iniciar sesión');
        return;
      }

      if (data.user) {
        toast.success('Inicio de sesión exitoso');
        navigate('/user');
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: GOOGLE_REDIRECT_URI,
        },
      });

      if (error) {
        toast.error('Error al iniciar sesión con Google');
        return;
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado al conectar con Google');
    } finally {
      setLoading(false);
    }
  };

  const value: LoginContextType = {
    loginFormData,
    loading,
    showPassword,
    handleChangeLoginFormData,
    handleLogin,
    handleGoogleLogin,
    setShowPassword,
  };

  return (
    <LoginContext.Provider value={value}>
      {children}
    </LoginContext.Provider>
  );
}

export function useLoginContext() {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLoginContext must be used within a LoginProvider');
  }
  return context;
}

