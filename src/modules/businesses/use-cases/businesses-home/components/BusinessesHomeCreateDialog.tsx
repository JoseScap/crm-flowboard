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
          <DialogTitle>New Business</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter business name"
              value={newBusinessFormData.name}
              onChange={(e) => handleChangeNewBusinessFormData('name', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter business description (optional)"
              value={newBusinessFormData.description || ''}
              onChange={(e) => handleChangeNewBusinessFormData('description', e.target.value || null)}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="business@example.com"
                value={newBusinessFormData.email || ''}
                onChange={(e) => handleChangeNewBusinessFormData('email', e.target.value || null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
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
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter business address (optional)"
              value={newBusinessFormData.address || ''}
              onChange={(e) => handleChangeNewBusinessFormData('address', e.target.value || null)}
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="ai-context">AI Context</Label>
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
              id="ai-context"
              placeholder="Enter context (optional)"
              value={newBusinessFormData.ai_context || ''}
              onChange={(e) => handleChangeNewBusinessFormData('ai_context', e.target.value || null)}
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancelCreateBusiness}>
            Cancel
          </Button>
          <Button onClick={handleSaveBusiness} disabled={!newBusinessFormData.name.trim()}>
            Create Business
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

