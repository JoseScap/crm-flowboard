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

export function BusinessesHomeCreateDialog() {
  const {
    isCreateBusinessDialogOpen,
    newBusinessFormData,
    handleChangeNewBusinessFormData,
    handleCancelCreateBusiness,
    handleSaveBusiness,
  } = useBusinessesHomeContext();

  return (
    <Dialog open={isCreateBusinessDialogOpen} onOpenChange={handleCancelCreateBusiness}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Negocio</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del Negocio *</Label>
            <Input
              id="name"
              placeholder="Ingrese el nombre del negocio"
              value={newBusinessFormData.name}
              onChange={(e) => handleChangeNewBusinessFormData('name', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="owner_first_name">Nombre del Dueño *</Label>
              <Input
                id="owner_first_name"
                placeholder="Nombre"
                value={newBusinessFormData.owner_first_name}
                onChange={(e) => handleChangeNewBusinessFormData('owner_first_name', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="owner_last_name">Apellido del Dueño *</Label>
              <Input
                id="owner_last_name"
                placeholder="Apellido"
                value={newBusinessFormData.owner_last_name}
                onChange={(e) => handleChangeNewBusinessFormData('owner_last_name', e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Ingrese la descripción del negocio (opcional)"
              value={newBusinessFormData.description || ''}
              onChange={(e) => handleChangeNewBusinessFormData('description', e.target.value || null)}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="negocio@ejemplo.com"
                value={newBusinessFormData.email || ''}
                onChange={(e) => handleChangeNewBusinessFormData('email', e.target.value || null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={newBusinessFormData.phone || ''}
                onChange={(e) => handleChangeNewBusinessFormData('phone', e.target.value || null)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              placeholder="Ingrese la dirección del negocio (opcional)"
              value={newBusinessFormData.address || ''}
              onChange={(e) => handleChangeNewBusinessFormData('address', e.target.value || null)}
              rows={2}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancelCreateBusiness}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveBusiness} 
            disabled={!newBusinessFormData.name.trim() || !newBusinessFormData.owner_first_name.trim() || !newBusinessFormData.owner_last_name.trim()}
          >
            Crear Negocio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

