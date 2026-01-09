import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import supabase from '@/modules/common/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const LoginGoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for errors in the URL
    const errorCode = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorCode) {
      toast.error(`Error de autenticación: ${errorDescription || errorCode}`);
      navigate('/login', { replace: true });
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        toast.success('Sesión iniciada correctamente con Google');
        navigate('/user', { replace: true });
      }
    });

    // Timeout as a fallback if nothing happens
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Tiempo de espera agotado o error en la autenticación');
        navigate('/login', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg font-medium">Completing login...</p>
      </div>
    </div>
  );
};

export default LoginGoogleCallback;
