import { useNavigate } from 'react-router-dom';
import { PasswordRecoveryRequestProvider, usePasswordRecoveryRequestContext } from './PasswordRecoveryRequestContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

const PasswordRecoveryRequest = () => {
  const navigate = useNavigate();
  const {
    email,
    loading,
    setEmail,
    handleSubmit,
  } = usePasswordRecoveryRequestContext();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/login')}
              className="-ml-2 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
          </div>
          <CardDescription>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando correo...
                </>
              ) : (
                'Enviar enlace de restablecimiento'
              )}
            </Button>
            <div className="text-center">
              <Button
                variant="link"
                className="text-sm"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Volver al inicio de sesión
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const PasswordRecoveryRequestPage = () => {
  return (
    <PasswordRecoveryRequestProvider>
      <PasswordRecoveryRequest />
    </PasswordRecoveryRequestProvider>
  );
};

export default PasswordRecoveryRequestPage;
