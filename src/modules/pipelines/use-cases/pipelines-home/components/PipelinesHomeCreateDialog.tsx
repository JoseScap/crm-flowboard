import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePipelinesHomeContext } from '../PipelinesHomeContext';

export function PipelinesHomeCreateDialog() {
  const {
    isCreatePipelineDialogOpen,
    newPipelineFormData,
    handleChangeNewPipelineFormData,
    handleCancelCreatePipeline,
    handleSavePipeline,
  } = usePipelinesHomeContext();

  return (
    <Dialog open={isCreatePipelineDialogOpen} onOpenChange={handleCancelCreatePipeline}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Pipeline</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter pipeline name"
              value={newPipelineFormData.name}
              onChange={(e) => handleChangeNewPipelineFormData('name', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter pipeline description (optional)"
              value={newPipelineFormData.description}
              onChange={(e) => handleChangeNewPipelineFormData('description', e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancelCreatePipeline}>
            Cancel
          </Button>
          <Button onClick={handleSavePipeline} disabled={!newPipelineFormData.name.trim()}>
            Create Pipeline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

