import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBusinessViewContext } from '../BusinessViewContext';

export function BusinessViewDialogs() {
  const {
    isAddEmployeeDialogOpen,
    newEmployeeEmail,
    newEmployeeFirstName,
    newEmployeeLastName,
    addingEmployee,
    handleCloseAddEmployeeDialog,
    handleAddEmployee,
    setNewEmployeeEmail,
    setNewEmployeeFirstName,
    setNewEmployeeLastName,
  } = useBusinessViewContext();

  return (
    <>
      {/* Add Employee Dialog */}
      <Dialog open={isAddEmployeeDialogOpen} onOpenChange={handleCloseAddEmployeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Empleado</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">Nombre *</Label>
                <Input
                  id="first-name"
                  placeholder="Juan"
                  value={newEmployeeFirstName}
                  onChange={(e) => setNewEmployeeFirstName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !addingEmployee) {
                      handleAddEmployee();
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Apellido *</Label>
                <Input
                  id="last-name"
                  placeholder="Pérez"
                  value={newEmployeeLastName}
                  onChange={(e) => setNewEmployeeLastName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !addingEmployee) {
                      handleAddEmployee();
                    }
                  }}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employee-email">Correo Electrónico *</Label>
              <Input
                id="employee-email"
                type="email"
                placeholder="empleado@ejemplo.com"
                value={newEmployeeEmail}
                onChange={(e) => setNewEmployeeEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !addingEmployee) {
                    handleAddEmployee();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Ingrese los detalles del empleado para agregarlo al negocio
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseAddEmployeeDialog}
              disabled={addingEmployee}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddEmployee}
              disabled={addingEmployee || !newEmployeeEmail.trim() || !newEmployeeFirstName.trim() || !newEmployeeLastName.trim()}
            >
              {addingEmployee ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Agregando...
                </>
              ) : (
                'Agregar Empleado'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

