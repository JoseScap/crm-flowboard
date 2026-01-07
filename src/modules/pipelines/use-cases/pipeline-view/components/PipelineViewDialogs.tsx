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
            <div className="grid gap-2">
              <Label htmlFor="stage-default-assignee">Default Assignee for New Leads</Label>
              <Select
                value={createStageFormData.default_business_employee_id?.toString() || 'unassigned'}
                onValueChange={(value) => handleChangeCreateStageFormData('default_business_employee_id', value === 'unassigned' ? null : Number(value))}
              >
                <SelectTrigger id="stage-default-assignee">
                  <SelectValue placeholder="No default assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">No default assignee</SelectItem>
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
                  There is already a revenue stage ({revenueStage?.name}). It will be replaced when you save.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="stage-webhook-url">Webhook URL</Label>
              <Input
                id="stage-webhook-url"
                type="url"
                placeholder="Enter webhook URL (optional)"
                value={createStageFormData.webhook_url || ''}
                onChange={(e) => handleChangeCreateStageFormData('webhook_url', e.target.value || null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stage-description">Description</Label>
              <Textarea
                id="stage-description"
                placeholder="Enter description (optional)"
                value={createStageFormData.description || ''}
                onChange={(e) => handleChangeCreateStageFormData('description', e.target.value || null)}
                rows={4}
              />
            </div>
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

      {/* Create Lead Dialog */}
      <Dialog open={isCreateLeadDialogOpen} onOpenChange={(open) => !open && handleCloseCreateLeadDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lead-customer-name">Customer Name *</Label>
              <Input
                id="lead-customer-name"
                placeholder="Enter customer name"
                value={createLeadFormData.customer_name}
                onChange={(e) => handleChangeCreateLeadFormData('customer_name', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                type="email"
                placeholder="Enter email (optional)"
                value={createLeadFormData.email}
                onChange={(e) => handleChangeCreateLeadFormData('email', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lead-phone">Phone Number</Label>
              <Input
                id="lead-phone"
                type="tel"
                placeholder="Enter phone number (optional)"
                value={createLeadFormData.phone_number}
                onChange={(e) => handleChangeCreateLeadFormData('phone_number', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lead-value">Value *</Label>
              <Input
                id="lead-value"
                type="number"
                placeholder="Enter lead value"
                value={createLeadFormData.value}
                onChange={(e) => handleChangeCreateLeadFormData('value', Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lead-stage">Stage *</Label>
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
                  <SelectValue placeholder="Select a stage" />
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
              <Label htmlFor="lead-assignee">Assigned to *</Label>
              <Select
                value={createLeadFormData.business_employee_id?.toString() || ''}
                onValueChange={(value) => handleChangeCreateLeadFormData('business_employee_id', Number(value))}
              >
                <SelectTrigger id="lead-assignee">
                  <SelectValue placeholder="Select an assignee" />
                </SelectTrigger>
                <SelectContent>
                  {businessEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name} ({employee.email}) {employee.id === currentUserEmployee?.id ? '(Me)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseCreateLeadDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNewLead} 
              disabled={!createLeadFormData.customer_name.trim() || createLeadFormData.value === undefined || createLeadFormData.value === null || !createLeadFormData.pipeline_stage_id || !createLeadFormData.business_employee_id || isReordering}
            >
              Create Lead
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
            <div className="grid gap-2">
              <Label htmlFor="edit-stage-default-assignee">Default Assignee for New Leads</Label>
              <Select
                value={editStageFormData.default_business_employee_id?.toString() || 'unassigned'}
                onValueChange={(value) => handleChangeEditStageFormData('default_business_employee_id', value === 'unassigned' ? null : Number(value))}
              >
                <SelectTrigger id="edit-stage-default-assignee">
                  <SelectValue placeholder="No default assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">No default assignee</SelectItem>
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
                  There is already a revenue stage ({revenueStage?.name}). It will be replaced when you save.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-stage-webhook-url">Webhook URL</Label>
              <Input
                id="edit-stage-webhook-url"
                type="url"
                placeholder="Enter webhook URL (optional)"
                value={editStageFormData.webhook_url || ''}
                onChange={(e) => handleChangeEditStageFormData('webhook_url', e.target.value || null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stage-description">Description</Label>
              <Textarea
                id="edit-stage-description"
                placeholder="Enter description (optional)"
                value={editStageFormData.description || ''}
                onChange={(e) => handleChangeEditStageFormData('description', e.target.value || null)}
                rows={4}
              />
            </div>
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

      {/* Archive Lead Dialog */}
      <Dialog open={isArchiveLeadDialogOpen} onOpenChange={(open) => !open && handleCloseArchiveLeadDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Lead</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground mb-4">
              How do you want to close this lead?
            </p>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleArchiveLead(true)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Close with Revenue</span>
                  <span className="text-sm text-muted-foreground">This lead will be marked as revenue</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleArchiveLead(false)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Close without Revenue</span>
                  <span className="text-sm text-muted-foreground">This lead will be archived without revenue</span>
                </div>
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseArchiveLeadDialog}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
