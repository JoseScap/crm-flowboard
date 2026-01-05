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
          <DialogTitle>Edit Business</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              placeholder="Enter business name"
              value={editBusinessFormData.name || editingBusiness.name}
              onChange={(e) => handleChangeEditBusinessFormData('name', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Enter business description (optional)"
              value={editBusinessFormData.description !== undefined ? (editBusinessFormData.description || '') : (editingBusiness.description || '')}
              onChange={(e) => handleChangeEditBusinessFormData('description', e.target.value || null)}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="business@example.com"
                value={editBusinessFormData.email !== undefined ? (editBusinessFormData.email || '') : (editingBusiness.email || '')}
                onChange={(e) => handleChangeEditBusinessFormData('email', e.target.value || null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
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
            <Label htmlFor="edit-address">Address</Label>
            <Textarea
              id="edit-address"
              placeholder="Enter business address (optional)"
              value={editBusinessFormData.address !== undefined ? (editBusinessFormData.address || '') : (editingBusiness.address || '')}
              onChange={(e) => handleChangeEditBusinessFormData('address', e.target.value || null)}
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="edit-ai-context">AI Context</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Este campo sirve para dar información a los agentes IA en caso de usarlo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              id="edit-ai-context"
              placeholder="Enter context (optional)"
              value={editBusinessFormData.ai_context !== undefined ? (editBusinessFormData.ai_context || '') : (editingBusiness.ai_context || '')}
              onChange={(e) => handleChangeEditBusinessFormData('ai_context', e.target.value || null)}
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCloseEditBusiness}>
            Cancel
          </Button>
          <Button onClick={handleUpdateBusiness} disabled={!editBusinessFormData.name?.trim() && !editingBusiness.name.trim()}>
            Update Business
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

