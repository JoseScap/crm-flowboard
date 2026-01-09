import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePipelinesHomeContext } from '../PipelinesHomeContext';

export function PipelinesHomeHeader() {
  const { handleCreatePipeline } = usePipelinesHomeContext();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pipelines</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona y organiza tus flujos de ventas
          </p>
        </div>
        <Button onClick={handleCreatePipeline} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Pipeline
        </Button>
      </div>
    </div>
  );
}

