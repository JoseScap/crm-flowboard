import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginProvider, useLoginContext } from "./LoginContext";
import { useLayoutContext } from "@/components/LayoutContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const { isAuthenticated, loading: authLoading } = useLayoutContext();
  const navigate = useNavigate();
  const {
    loginFormData,
    loading,
    showPassword,
    handleChangeLoginFormData,
    handleLogin,
    handleGoogleLogin,
    setShowPassword,
  } = useLoginContext();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/user", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Iniciar Sesión
        </CardTitle>
        <CardDescription className="text-center">
          Ingresa tus credenciales para acceder a tu cuenta
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
              value={loginFormData.email}
              onChange={(e) =>
                handleChangeLoginFormData("email", e.target.value)
              }
              disabled={loading}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Button
                variant="link"
                className="px-0 font-normal h-auto text-xs"
                onClick={() => navigate("/password-recovery-request")}
                type="button"
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={loginFormData.password}
                onChange={(e) =>
                  handleChangeLoginFormData("password", e.target.value)
                }
                disabled={loading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O continúa con
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Google
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => navigate("/register")}
              type="button"
            >
              Regístrate
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
