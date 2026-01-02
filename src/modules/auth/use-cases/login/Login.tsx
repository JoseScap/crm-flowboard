import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginProvider, useLoginContext } from './LoginContext';
import { useLayoutContext } from '@/components/LayoutContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const { isAuthenticated, loading: authLoading } = useLayoutContext();
  const navigate = useNavigate();
  const {
    loginFormData,
    loading,
    handleChangeLoginFormData,
    handleLogin,
  } = useLoginContext();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/user', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={loginFormData.email}
                onChange={(e) => handleChangeLoginFormData('email', e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={loginFormData.password}
                onChange={(e) => handleChangeLoginFormData('password', e.target.value)}
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
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const LoginPage = () => {
  return (
    <LoginProvider>
      <Login />
    </LoginProvider>
  );
};

export default LoginPage;

