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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STAGE_COLORS } from '@/constants/colors';
import { usePipelineViewContext } from '../PipelineViewContext';

export function PipelineViewDialogs() {
  const {
    // Create Stage Dialog
    pipelineStages,
    createStageFormData,
    revenueStage,
    isReordering,
    isCreateStageDialogOpen,
    handleCloseCreateStageDialog,
    handleSaveNewStage,
    handleChangeCreateStageFormData,
    
    // Create Lead Dialog
    createLeadFormData,
    businessEmployees,
    currentUserEmployee,
    isCreateLeadDialogOpen,
    handleCloseCreateLeadDialog,
    handleSaveNewLead,
    handleChangeCreateLeadFormData,
    
    // Edit Stage Dialog
    editStageFormData,
    editingStage,
    isEditStageDialogOpen,
    handleCloseEditStageDialog,
    handleUpdateStage,
    handleChangeEditStageFormData,
    
    // Archive Lead Dialog
    isArchiveLeadDialogOpen,
    handleCloseArchiveLeadDialog,
    handleArchiveLead,
  } = usePipelineViewContext();

  return (
    <>
      {/* Create Stage Dialog */}
      <Dialog open={isCreateStageDialogOpen} onOpenChange={(open) => !open && handleCloseCreateStageDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pipelineStages.length === 0 ? 'Crear Primera Etapa' : 'Crear Nueva Etapa'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stage-name">Nombre *</Label>
              <Input
                id="stage-name"
                placeholder="Ingrese el nombre de la etapa"
                value={createStageFormData.name}
                onChange={(e) => handleChangeCreateStageFormData('name', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stage-color">Color *</Label>
              <select
                id="stage-color"
                value={createStageFormData.color}
                onChange={(e) => handleChangeCreateStageFormData('color', e.target.value)}
                className="bg-card border border-border text-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {STAGE_COLORS.map((color) => (
                  <option key={color.hsl} value={color.hsl}>
                    {color.name === 'Blue' ? 'Azul' : 
                     color.name === 'Purple' ? 'Púrpura' : 
                     color.name === 'Amber' ? 'Ámbar' : 
                     color.name === 'Emerald' ? 'Esmeralda' : 
                     color.name === 'Rose' ? 'Rosa' : 
                     color.name === 'Slate' ? 'Pizarra' : color.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stage-is-revenue"
                checked={createStageFormData.is_revenue}
                onCheckedChange={(checked) => handleChangeCreateStageFormData('is_revenue', checked === true)}
              />
              <Label
                htmlFor="stage-is-revenue"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Marcar como Etapa de Ingresos
              </Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stage-default-assignee">Asignado por Defecto para Nuevos Leads</Label>
              <Select
                value={createStageFormData.default_business_employee_id?.toString() || 'unassigned'}
                onValueChange={(value) => handleChangeCreateStageFormData('default_business_employee_id', value === 'unassigned' ? null : Number(value))}
              >
                <SelectTrigger id="stage-default-assignee">
                  <SelectValue placeholder="Sin asignado por defecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sin asignado por defecto</SelectItem>
                  {businessEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name} ({employee.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {createStageFormData.is_revenue && revenueStage && (
              <Alert className="border-amber-500/20 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-sm text-foreground">
                  Ya existe una etapa de ingresos ({revenueStage?.name}). Será reemplazada al guardar.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="stage-webhook-url">URL del Webhook</Label>
              <Input
                id="stage-webhook-url"
                type="url"
                placeholder="Ingrese la URL del webhook (opcional)"
                value={createStageFormData.webhook_url || ''}
                onChange={(e) => handleChangeCreateStageFormData('webhook_url', e.target.value || null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stage-description">Descripción</Label>
              <Textarea
                id="stage-description"
                placeholder="Ingrese una descripción (opcional)"
                value={createStageFormData.description || ''}
                onChange={(e) => handleChangeCreateStageFormData('description', e.target.value || null)}
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseCreateStageDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNewStage} disabled={!createStageFormData.name.trim() || isReordering}>
              Crear Etapa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Lead Dialog */}
      <Dialog open={isCreateLeadDialogOpen} onOpenChange={(open) => !open && handleCloseCreateLeadDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lead-customer-name">Nombre del Cliente *</Label>
              <Input
                id="lead-customer-name"
                placeholder="Ingrese el nombre del cliente"
                value={createLeadFormData.customer_name}
                onChange={(e) => handleChangeCreateLeadFormData('customer_name', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lead-email">Correo Electrónico</Label>
              <Input
                id="lead-email"
                type="email"
                placeholder="Ingrese el correo (opcional)"
                value={createLeadFormData.email}
                onChange={(e) => handleChangeCreateLeadFormData('email', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lead-phone">Número de Teléfono</Label>
              <Input
                id="lead-phone"
                type="tel"
                placeholder="Ingrese el número de teléfono (opcional)"
                value={createLeadFormData.phone_number}
                onChange={(e) => handleChangeCreateLeadFormData('phone_number', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lead-value">Valor *</Label>
              <Input
                id="lead-value"
                type="number"
                placeholder="Ingrese el valor del lead"
                value={createLeadFormData.value}
                onChange={(e) => handleChangeCreateLeadFormData('value', Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lead-stage">Etapa *</Label>
              <Select
                value={createLeadFormData.pipeline_stage_id.toString()}
                onValueChange={(value) => {
                  const stageId = Number(value);
                  const stage = pipelineStages.find(s => s.id === stageId);
                  handleChangeCreateLeadFormData('pipeline_stage_id', stageId);
                  if (stage?.default_business_employee_id) {
                    handleChangeCreateLeadFormData('business_employee_id', stage.default_business_employee_id);
                  }
                }}
              >
                <SelectTrigger id="lead-stage">
                  <SelectValue placeholder="Seleccione una etapa" />
                </SelectTrigger>
                <SelectContent>
                  {pipelineStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: stage.color }}
                        />
                        <span>{stage.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lead-assignee">Asignado a *</Label>
              <Select
                value={createLeadFormData.business_employee_id?.toString() || ''}
                onValueChange={(value) => handleChangeCreateLeadFormData('business_employee_id', Number(value))}
              >
                <SelectTrigger id="lead-assignee">
                  <SelectValue placeholder="Seleccione un asignado" />
                </SelectTrigger>
                <SelectContent>
                  {businessEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name} ({employee.email}) {employee.id === currentUserEmployee?.id ? '(Yo)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseCreateLeadDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveNewLead} 
              disabled={!createLeadFormData.customer_name.trim() || createLeadFormData.value === undefined || createLeadFormData.value === null || !createLeadFormData.pipeline_stage_id || !createLeadFormData.business_employee_id || isReordering}
            >
              Crear Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Stage Dialog */}
      <Dialog open={isEditStageDialogOpen} onOpenChange={(open) => !open && handleCloseEditStageDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Etapa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-stage-name">Nombre *</Label>
              <Input
                id="edit-stage-name"
                placeholder="Ingrese el nombre de la etapa"
                value={editStageFormData.name}
                onChange={(e) => handleChangeEditStageFormData('name', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stage-color">Color *</Label>
              <select
                id="edit-stage-color"
                value={editStageFormData.color}
                onChange={(e) => handleChangeEditStageFormData('color', e.target.value)}
                className="bg-card border border-border text-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {STAGE_COLORS.map((color) => (
                  <option key={color.hsl} value={color.hsl}>
                    {color.name === 'Blue' ? 'Azul' : 
                     color.name === 'Purple' ? 'Púrpura' : 
                     color.name === 'Amber' ? 'Ámbar' : 
                     color.name === 'Emerald' ? 'Esmeralda' : 
                     color.name === 'Rose' ? 'Rosa' : 
                     color.name === 'Slate' ? 'Pizarra' : color.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-stage-is-revenue"
                checked={editStageFormData.is_revenue}
                onCheckedChange={(checked) => handleChangeEditStageFormData('is_revenue', checked === true)}
              />
              <Label
                htmlFor="edit-stage-is-revenue"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Marcar como Etapa de Ingresos
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-stage-is-input"
                checked={editStageFormData.is_input}
                onCheckedChange={(checked) => handleChangeEditStageFormData('is_input', checked === true)}
              />
              <Label
                htmlFor="edit-stage-is-input"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Marcar como Etapa de Entrada
              </Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stage-default-assignee">Asignado por Defecto para Nuevos Leads</Label>
              <Select
                value={editStageFormData.default_business_employee_id?.toString() || 'unassigned'}
                onValueChange={(value) => handleChangeEditStageFormData('default_business_employee_id', value === 'unassigned' ? null : Number(value))}
              >
                <SelectTrigger id="edit-stage-default-assignee">
                  <SelectValue placeholder="Sin asignado por defecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sin asignado por defecto</SelectItem>
                  {businessEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name} ({employee.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editStageFormData.is_revenue && revenueStage && revenueStage.id !== editingStage?.id && (
              <Alert className="border-amber-500/20 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-sm text-foreground">
                  Ya existe una etapa de ingresos ({revenueStage?.name}). Será reemplazada al guardar.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-stage-webhook-url">URL del Webhook</Label>
              <Input
                id="edit-stage-webhook-url"
                type="url"
                placeholder="Ingrese la URL del webhook (opcional)"
                value={editStageFormData.webhook_url || ''}
                onChange={(e) => handleChangeEditStageFormData('webhook_url', e.target.value || null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stage-description">Descripción</Label>
              <Textarea
                id="edit-stage-description"
                placeholder="Ingrese una descripción (opcional)"
                value={editStageFormData.description || ''}
                onChange={(e) => handleChangeEditStageFormData('description', e.target.value || null)}
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseEditStageDialog}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStage} disabled={!editStageFormData.name.trim() || isReordering}>
              Actualizar Etapa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Lead Dialog */}
      <Dialog open={isArchiveLeadDialogOpen} onOpenChange={(open) => !open && handleCloseArchiveLeadDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archivar Lead</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground mb-4">
              ¿Cómo desea cerrar este lead?
            </p>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleArchiveLead(true)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Cerrar con Ingresos</span>
                  <span className="text-sm text-muted-foreground">Este lead será marcado como ingreso ganado</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleArchiveLead(false)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Cerrar sin Ingresos</span>
                  <span className="text-sm text-muted-foreground">Este lead será archivado sin ingresos</span>
                </div>
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseArchiveLeadDialog}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
