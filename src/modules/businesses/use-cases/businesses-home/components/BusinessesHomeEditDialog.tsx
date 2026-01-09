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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useBusinessesHomeContext } from '../BusinessesHomeContext';

export function BusinessesHomeEditDialog() {
  const {
    isEditBusinessDialogOpen,
    editBusinessFormData,
    editingBusiness,
    handleChangeEditBusinessFormData,
    handleCloseEditBusiness,
    handleUpdateBusiness,
  } = useBusinessesHomeContext();

  if (!editingBusiness) return null;

  return (
    <Dialog open={isEditBusinessDialogOpen} onOpenChange={(open) => !open && handleCloseEditBusiness()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Negocio</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Nombre *</Label>
            <Input
              id="edit-name"
              placeholder="Ingrese el nombre del negocio"
              value={editBusinessFormData.name || editingBusiness.name}
              onChange={(e) => handleChangeEditBusinessFormData('name', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              placeholder="Ingrese la descripción del negocio (opcional)"
              value={editBusinessFormData.description !== undefined ? (editBusinessFormData.description || '') : (editingBusiness.description || '')}
              onChange={(e) => handleChangeEditBusinessFormData('description', e.target.value || null)}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Correo Electrónico</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="negocio@ejemplo.com"
                value={editBusinessFormData.email !== undefined ? (editBusinessFormData.email || '') : (editingBusiness.email || '')}
                onChange={(e) => handleChangeEditBusinessFormData('email', e.target.value || null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="+1234567890"
                value={editBusinessFormData.phone !== undefined ? (editBusinessFormData.phone || '') : (editingBusiness.phone || '')}
                onChange={(e) => handleChangeEditBusinessFormData('phone', e.target.value || null)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-address">Dirección</Label>
            <Textarea
              id="edit-address"
              placeholder="Ingrese la dirección del negocio (opcional)"
              value={editBusinessFormData.address !== undefined ? (editBusinessFormData.address || '') : (editingBusiness.address || '')}
              onChange={(e) => handleChangeEditBusinessFormData('address', e.target.value || null)}
              rows={2}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCloseEditBusiness}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateBusiness} disabled={!editBusinessFormData.name?.trim() && !editingBusiness.name.trim()}>
            Actualizar Negocio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

