import { Loader2 } from 'lucide-react';

export function ApplicationsHomeLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading applications...</p>
      </div>
    </div>
  );
}

