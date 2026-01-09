import { Loader2 } from 'lucide-react';

export function BusinessViewLoading() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-background">
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Cargando...</span>
      </div>
    </div>
  );
}

