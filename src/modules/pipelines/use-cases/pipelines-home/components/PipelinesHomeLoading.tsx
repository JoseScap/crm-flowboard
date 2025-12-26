import { Loader2 } from 'lucide-react';

export function PipelinesHomeLoading() {
  return (
    <div className="p-6 lg:p-8 h-full flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Loading pipelines...</span>
      </div>
    </div>
  );
}

