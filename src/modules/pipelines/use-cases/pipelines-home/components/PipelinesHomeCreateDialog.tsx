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
          <DialogTitle>Nuevo Pipeline</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Ingrese el nombre del pipeline"
              value={newPipelineFormData.name}
              onChange={(e) => handleChangeNewPipelineFormData('name', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Ingrese la descripción del pipeline (opcional)"
              value={newPipelineFormData.description}
              onChange={(e) => handleChangeNewPipelineFormData('description', e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancelCreatePipeline}>
            Cancelar
          </Button>
          <Button onClick={handleSavePipeline} disabled={!newPipelineFormData.name.trim()}>
            Crear Pipeline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

