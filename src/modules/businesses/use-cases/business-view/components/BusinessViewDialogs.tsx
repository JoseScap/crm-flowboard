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
            <DialogTitle>Add Employee</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First Name *</Label>
                <Input
                  id="first-name"
                  placeholder="John"
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
                <Label htmlFor="last-name">Last Name *</Label>
                <Input
                  id="last-name"
                  placeholder="Doe"
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
              <Label htmlFor="employee-email">Email *</Label>
              <Input
                id="employee-email"
                type="email"
                placeholder="employee@example.com"
                value={newEmployeeEmail}
                onChange={(e) => setNewEmployeeEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !addingEmployee) {
                    handleAddEmployee();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Enter the employee details to add them to the business
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseAddEmployeeDialog}
              disabled={addingEmployee}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEmployee}
              disabled={addingEmployee || !newEmployeeEmail.trim() || !newEmployeeFirstName.trim() || !newEmployeeLastName.trim()}
            >
              {addingEmployee ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Employee'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

