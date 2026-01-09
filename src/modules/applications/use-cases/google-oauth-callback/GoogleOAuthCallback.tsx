// src/modules/applications/use-cases/google-oauth-callback/GoogleOAuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleGoogleCallback } from '@/lib/google-oauth';
import supabase from '@/modules/common/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const GoogleOAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          toast.error(`Error de OAuth: ${error}`);
          navigate('/user/businesses');
          return;
        }

        if (!code || !state) {
          toast.error('Falta el código de autorización o el estado');
          navigate('/user/businesses');
          return;
        }

        // Procesar el callback
        const oauthData = await handleGoogleCallback(code, state);

        // Obtener el usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Obtener el registro del empleado para obtener el business_id
        const { data: employee, error: employeeError } = await supabase
          .from('business_employees')
          .select('business_id, id')
          .eq('id', oauthData.businessEmployeeId)
          .single();

        if (employeeError || !employee) {
          throw new Error('Employee record not found');
        }

        // Calcular la fecha de expiración
        const expiresAt = oauthData.expiresIn
          ? new Date(Date.now() + oauthData.expiresIn * 1000).toISOString()
          : null;

        // Guardar o actualizar la conexión en Supabase
        const { error: upsertError } = await supabase
          .from('business_employee_oauth_connections')
          .upsert({
            user_id: user.id,
            business_id: employee.business_id,
            business_employee_id: employee.id,
            application_id: 'google-calendar',
            access_token: oauthData.accessToken,
            refresh_token: oauthData.refreshToken,
            token_expires_at: expiresAt,
            scope: oauthData.scope,
            provider_user_id: oauthData.providerUserId,
            provider_email: oauthData.providerEmail,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'business_employee_id,application_id'
          });

        if (upsertError) {
          throw upsertError;
        }

        toast.success('Google Calendar conectado con éxito!');
        navigate(`/user/businesses/${employee.business_id}/applications`);
      } catch (error: any) {
        toast.error('Error al procesar la autenticación OAuth');
        navigate('/user/businesses');
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Processing connection...</p>
      </div>
    </div>
  );
};

const GoogleOAuthCallbackPage = () => {
  return <GoogleOAuthCallback />;
};

export default GoogleOAuthCallbackPage;

