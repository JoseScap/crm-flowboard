import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useLayoutContext } from './LayoutContext';
import { Loader2 } from 'lucide-react';

interface SimpleLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function SimpleLayout({ children, requireAuth = true }: SimpleLayoutProps) {
  const { isAuthenticated, loading } = useLayoutContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}

