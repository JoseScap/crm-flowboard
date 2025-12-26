import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    
    // Create Deal Dialog
    createDealFormData,
    isCreateDealDialogOpen,
    handleCloseCreateDealDialog,
    handleSaveNewDeal,
    handleChangeCreateDealFormData,
    
    // Edit Stage Dialog
    editStageFormData,
    editingStage,
    isEditStageDialogOpen,
    handleCloseEditStageDialog,
    handleUpdateStage,
    handleChangeEditStageFormData,
    
    // Archive Deal Dialog
    isArchiveDealDialogOpen,
    handleCloseArchiveDealDialog,
    handleArchiveDeal,
  } = usePipelineViewContext();

  return (
    <>
      {/* Create Stage Dialog */}
      <Dialog open={isCreateStageDialogOpen} onOpenChange={(open) => !open && handleCloseCreateStageDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pipelineStages.length === 0 ? 'Create First Stage' : 'Create New Stage'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stage-name">Name *</Label>
              <Input
                id="stage-name"
                placeholder="Enter stage name"
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
                    {color.name}
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
                Mark as Revenue Stage
              </Label>
            </div>
            {createStageFormData.is_revenue && revenueStage && (
              <Alert className="border-amber-500/20 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-sm text-foreground">
                  There is already a revenue stage ({revenueStage?.name}). It will be replaced when you save.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseCreateStageDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewStage} disabled={!createStageFormData.name.trim() || isReordering}>
              Create Stage
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Deal Dialog */}
      <Dialog open={isCreateDealDialogOpen} onOpenChange={(open) => !open && handleCloseCreateDealDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Deal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deal-customer-name">Customer Name *</Label>
              <Input
                id="deal-customer-name"
                placeholder="Enter customer name"
                value={createDealFormData.customer_name}
                onChange={(e) => handleChangeCreateDealFormData('customer_name', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deal-email">Email</Label>
              <Input
                id="deal-email"
                type="email"
                placeholder="Enter email (optional)"
                value={createDealFormData.email}
                onChange={(e) => handleChangeCreateDealFormData('email', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deal-phone">Phone Number</Label>
              <Input
                id="deal-phone"
                type="tel"
                placeholder="Enter phone number (optional)"
                value={createDealFormData.phone_number}
                onChange={(e) => handleChangeCreateDealFormData('phone_number', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deal-value">Value *</Label>
              <Input
                id="deal-value"
                type="number"
                placeholder="Enter deal value"
                value={createDealFormData.value}
                onChange={(e) => handleChangeCreateDealFormData('value', Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deal-stage">Stage *</Label>
              <Select
                value={createDealFormData.pipeline_stage_id}
                onValueChange={(value) => handleChangeCreateDealFormData('pipeline_stage_id', value)}
              >
                <SelectTrigger id="deal-stage">
                  <SelectValue placeholder="Select a stage" />
                </SelectTrigger>
                <SelectContent>
                  {pipelineStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
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
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseCreateDealDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNewDeal} 
              disabled={!createDealFormData.customer_name.trim() || !createDealFormData.value || !createDealFormData.pipeline_stage_id || isReordering}
            >
              Create Deal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Stage Dialog */}
      <Dialog open={isEditStageDialogOpen} onOpenChange={(open) => !open && handleCloseEditStageDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stage</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-stage-name">Name *</Label>
              <Input
                id="edit-stage-name"
                placeholder="Enter stage name"
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
                    {color.name}
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
                Mark as Revenue Stage
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
                Mark as Input Stage
              </Label>
            </div>
            {editStageFormData.is_revenue && revenueStage && revenueStage.id !== editingStage?.id && (
              <Alert className="border-amber-500/20 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-sm text-foreground">
                  There is already a revenue stage ({revenueStage?.name}). It will be replaced when you save.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseEditStageDialog}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStage} disabled={!editStageFormData.name.trim() || isReordering}>
              Update Stage
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Deal Dialog */}
      <Dialog open={isArchiveDealDialogOpen} onOpenChange={(open) => !open && handleCloseArchiveDealDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Deal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground mb-4">
              How do you want to close this deal?
            </p>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleArchiveDeal(true)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Close with Revenue</span>
                  <span className="text-sm text-muted-foreground">This deal will be marked as revenue</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleArchiveDeal(false)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Close without Revenue</span>
                  <span className="text-sm text-muted-foreground">This deal will be archived without revenue</span>
                </div>
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseArchiveDealDialog}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
