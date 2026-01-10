import { ReactNode } from 'react';
import { useLayoutContext } from './LayoutContext';
import { Loader2 } from 'lucide-react';

interface NoAuthLayoutProps {
  children: ReactNode;
}

export function NoAuthLayout({ children }: NoAuthLayoutProps) {
  const { loading } = useLayoutContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <header className="w-full border-b border-border bg-card">
        <div className="max-w-7xl mx-auto h-16 flex items-center px-6 lg:px-8">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground">SynergIA</h1>
          </div>
        </div>
      </header>
      <main className="w-full flex-1 flex flex-col items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
