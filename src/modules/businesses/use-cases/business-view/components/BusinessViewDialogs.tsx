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
    addingEmployee,
    handleCloseAddEmployeeDialog,
    handleAddEmployee,
    setNewEmployeeEmail,
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
                Enter the email address of the user to add as an employee
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
              disabled={addingEmployee || !newEmployeeEmail.trim()}
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

