import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/modules/common/lib/supabase';
import { toast } from 'sonner';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginContextType {
  // Form state
  loginFormData: LoginFormData;
  
  // Loading state
  loading: boolean;
  
  // Handlers
  handleChangeLoginFormData: <T extends keyof LoginFormData>(field: T, value: LoginFormData[T]) => void;
  handleLogin: () => Promise<void>;
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


  const handleChangeLoginFormData = <T extends keyof LoginFormData>(field: T, value: LoginFormData[T]) => {
    setLoginFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!loginFormData.email.trim() || !loginFormData.password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginFormData.email.trim(),
        password: loginFormData.password,
      });

      if (error) {
        console.error('Error logging in:', error);
        toast.error(error.message || 'Error logging in');
        return;
      }

      if (data.user) {
        toast.success('Login successful');
        navigate('/user');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const value: LoginContextType = {
    loginFormData,
    loading,
    handleChangeLoginFormData,
    handleLogin,
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

