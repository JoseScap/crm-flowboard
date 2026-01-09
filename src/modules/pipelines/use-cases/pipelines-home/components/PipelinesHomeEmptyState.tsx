import { FolderKanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePipelinesHomeContext } from '../PipelinesHomeContext';

export function PipelinesHomeEmptyState() {
  const { pipelines, handleCreatePipeline } = usePipelinesHomeContext();

  if (pipelines.length > 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] text-center">
      <FolderKanban className="w-16 h-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold text-foreground mb-2">Aún no hay pipelines</h2>
      <p className="text-muted-foreground mb-6">
        Crea tu primer pipeline para comenzar a gestionar tu proceso de ventas
      </p>
      <Button onClick={handleCreatePipeline} className="flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Crear Pipeline
      </Button>
    </div>
  );
}

