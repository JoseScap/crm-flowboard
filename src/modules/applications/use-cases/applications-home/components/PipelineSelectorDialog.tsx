import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tables } from '@/modules/types/supabase.schema';
import { FolderKanban } from 'lucide-react';

interface PipelineSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelines: Tables<'pipelines'>[];
  onSelectPipeline: (pipelineId: number) => void;
  loading?: boolean;
}

export function PipelineSelectorDialog({
  open,
  onOpenChange,
  pipelines,
  onSelectPipeline,
  loading = false,
}: PipelineSelectorDialogProps) {
  const handleSelect = (pipelineId: number) => {
    onSelectPipeline(pipelineId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Pipeline</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Select the pipeline where you want to connect this application:
          </p>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading pipelines...</p>
            </div>
          ) : pipelines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pipelines available</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {pipelines.map((pipeline) => (
                <button
                  key={pipeline.id}
                  onClick={() => handleSelect(pipeline.id)}
                  className="w-full text-left p-4 rounded-lg border border-border hover:bg-secondary hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {pipeline.name}
                      </h3>
                      {pipeline.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {pipeline.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

