import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from '@/components/KanbanColumn';
import { DashboardHeader } from '@/components/DashboardHeader';
import supabase from '@/lib/supabase';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { STAGE_COLORS } from '@/constants/colors';
import { Tables } from '@/types/supabase.schema';

const PipelineView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState<Tables<'pipelines'>[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [currentPipeline, setCurrentPipeline] = useState<Tables<'pipelines'> | null>(null);
  const [pipelineStages, setPipelineStages] = useState<Tables<'pipeline_stages'>[]>([]);
  const [pipelineDeals, setPipelineDeals] = useState<Tables<'pipeline_stage_deals'>[]>([]);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [isDealDialogOpen, setIsDealDialogOpen] = useState(false);
  const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
  const [isArchiveDealDialogOpen, setIsArchiveDealDialogOpen] = useState(false);
  const [archivingDeal, setArchivingDeal] = useState<Tables<'pipeline_stage_deals'> | null>(null);
  const [editingStage, setEditingStage] = useState<Tables<'pipeline_stages'> | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [stageFormData, setStageFormData] = useState({
    name: '',
    color: STAGE_COLORS[0].hsl,
    is_revenue: false,
  });
  const [editStageFormData, setEditStageFormData] = useState({
    name: '',
    color: STAGE_COLORS[0].hsl,
    is_revenue: false,
    is_input: false,
  });
  const [dealFormData, setDealFormData] = useState({
    customer_name: '',
    email: '',
    phone_number: '',
    value: '',
    pipeline_stage_id: '',
  });

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the deal being moved
    const deal = pipelineDeals.find((d) => d.id === draggableId);
    if (!deal) return;

    // Update the deal's pipeline_stage_id in the database
    try {
      const { error } = await supabase
        .from('pipeline_stage_deals')
        .update({ pipeline_stage_id: destination.droppableId })
        .eq('id', draggableId);

      if (error) {
        console.error('Error updating deal stage:', error);
      } else {
        // Refetch deals to update UI
        await getData();
      }
    } catch (error) {
      console.error('Error updating deal stage:', error);
    }
  };

  const getDealsByStage = (stageId: string): Tables<'pipeline_stage_deals'>[] => {
    return pipelineDeals.filter((deal) => deal.pipeline_stage_id === stageId);
  };

  const getRevenueValue = (): { total: number; closed: number } => {
    const revenueStage = pipelineStages.find(stage => stage.is_revenue === true);
    
    // Get active deals in revenue stage
    const activeRevenueDeals = revenueStage 
      ? pipelineDeals.filter(deal => deal.pipeline_stage_id === revenueStage.id)
      : [];
    
    // Get closed deals (stage_id null and is_revenue true)
    const closedRevenueDeals = pipelineDeals.filter(
      deal => deal.pipeline_stage_id === null && deal.is_revenue === true
    );
    
    const activeTotal = activeRevenueDeals.reduce((sum, deal) => sum + deal.value, 0);
    const closedTotal = closedRevenueDeals.reduce((sum, deal) => sum + deal.value, 0);
    
    return {
      total: activeTotal + closedTotal,
      closed: closedTotal
    };
  };

  const getConversionRate = (): number => {
    // Get all closed deals (with and without revenue)
    const allClosedDeals = pipelineDeals.filter(
      deal => deal.pipeline_stage_id === null
    );
    
    // Get closed deals with revenue
    const closedDealsWithRevenue = allClosedDeals.filter(
      deal => deal.is_revenue === true
    );
    
    if (allClosedDeals.length === 0) return 0;
    
    return Math.round((closedDealsWithRevenue.length / allClosedDeals.length) * 100);
  };

  const getData = async () => {
    const { data: pipelines, error } = await supabase.from('pipelines').select('*');
    const { data: pipelineStages, error: pipelineStagesError } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('pipeline_id', id || '')
      .order('order', { ascending: true });
    
    // Fetch deals - both active (with stage_id) and closed (with is_revenue=true)
    let pipelineDeals: Tables<'pipeline_stage_deals'>[] | null = null;
    let pipelineDealsError = null;
    if (pipelineStages && pipelineStages.length > 0) {
      // Get active deals (with stage_id)
      const activeDealsResult = await supabase
        .from('pipeline_stage_deals')
        .select('*')
        .in('pipeline_stage_id', pipelineStages.map(stage => stage.id))
        .order('created_at', { ascending: true });
      
      // Get closed deals (stage_id null - both with and without revenue)
      const closedDealsResult = await supabase
        .from('pipeline_stage_deals')
        .select('*')
        .is('pipeline_stage_id', null)
        .order('created_at', { ascending: true });
      
      // Combine both results
      pipelineDeals = [
        ...(activeDealsResult.data || []),
        ...(closedDealsResult.data || [])
      ];
      pipelineDealsError = activeDealsResult.error || closedDealsResult.error;
    } else {
      // If no stages, still get closed deals
      const closedDealsResult = await supabase
        .from('pipeline_stage_deals')
        .select('*')
        .is('pipeline_stage_id', null)
        .order('created_at', { ascending: true });
      
      pipelineDeals = closedDealsResult.data || [];
      pipelineDealsError = closedDealsResult.error;
    }

    if (error) {
      console.error('Error fetching pipelines:', error);
    }
    
    if (pipelineStagesError) {
      console.error('Error fetching pipeline stages:', pipelineStagesError);
    }
    
    if (pipelineDealsError) {
      console.error('Error fetching pipeline deals:', pipelineDealsError);
    }
    
    if (pipelines) {
      setPipelines(pipelines);
      
      // Get pipeline ID from URL or use first available
      const pipelineIdFromUrl = id || (pipelines.length > 0 ? pipelines[0].id : '');
      
      if (pipelineIdFromUrl) {
        setSelectedPipelineId(pipelineIdFromUrl);
        
        // Find and set current pipeline data
        const pipeline = pipelines.find(p => p.id === pipelineIdFromUrl);
        if (pipeline) {
          setCurrentPipeline(pipeline);
        }
      }
    }
    
    if (pipelineStages) {
      setPipelineStages(pipelineStages);
    }
    
    if (pipelineDeals) {
      setPipelineDeals(pipelineDeals);
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    
    // Find and set current pipeline data
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (pipeline) {
      setCurrentPipeline(pipeline);
      // Update URL to reflect the selected pipeline
      navigate(`/pipeline/${pipelineId}`, { replace: true });
    }
  };

  const handleOpenStageDialog = () => {
    setStageFormData({
      name: '',
      color: STAGE_COLORS[0].hsl,
      is_revenue: false,
    });
    setIsStageDialogOpen(true);
  };

  const handleCloseStageDialog = () => {
    setIsStageDialogOpen(false);
    setStageFormData({
      name: '',
      color: STAGE_COLORS[0].hsl,
      is_revenue: false,
    });
  };

  const getExistingRevenueStage = (): Tables<'pipeline_stages'> | null => {
    return pipelineStages.find(stage => stage.is_revenue === true) || null;
  };

  const handleSaveStage = async () => {
    if (!stageFormData.name.trim() || !id) return;

    // Close modal immediately
    handleCloseStageDialog();

    // Calculate order: if there are 3 stages, new one will be 4
    const newOrder = pipelineStages.length + 1;

    try {
      // If marking as revenue and there's already a revenue stage, unmark it first
      if (stageFormData.is_revenue) {
        const existingRevenueStage = getExistingRevenueStage();
        
        if (existingRevenueStage) {
          // Update existing revenue stage to false and create new one in parallel
          const [result1, result2] = await Promise.all([
            supabase
              .from('pipeline_stages')
              .update({ is_revenue: false })
              .eq('id', existingRevenueStage.id),
            supabase
              .from('pipeline_stages')
              .insert([
                {
                  name: stageFormData.name.trim(),
                  color: stageFormData.color,
                  pipeline_id: id,
                  order: newOrder,
                  is_revenue: true,
                },
              ]),
          ]);

          if (result1.error || result2.error) {
            console.error('Error creating stage:', result1.error || result2.error);
          }
        } else {
          // No existing revenue stage, just create normally
          const { error } = await supabase
            .from('pipeline_stages')
            .insert([
              {
                name: stageFormData.name.trim(),
                color: stageFormData.color,
                pipeline_id: id,
                order: newOrder,
                is_revenue: true,
              },
            ]);

          if (error) {
            console.error('Error creating stage:', error);
          }
        }
      } else {
        // Not marking as revenue, create normally
        const { error } = await supabase
          .from('pipeline_stages')
          .insert([
            {
              name: stageFormData.name.trim(),
              color: stageFormData.color,
              pipeline_id: id,
              order: newOrder,
              is_revenue: false,
            },
          ]);

        if (error) {
          console.error('Error creating stage:', error);
        }
      }

      // Refetch pipeline stages
      await getData();
    } catch (error) {
      console.error('Error creating stage:', error);
      await getData();
    }
  };

  const handleOpenDealDialog = () => {
    if (pipelineStages.length === 0) {
      // Don't open if there are no stages
      return;
    }
    // Set default stage to first stage
    setDealFormData({
      customer_name: '',
      email: '',
      phone_number: '',
      value: '',
      pipeline_stage_id: pipelineStages[0].id,
    });
    setIsDealDialogOpen(true);
  };

  const handleCloseDealDialog = () => {
    setIsDealDialogOpen(false);
    setDealFormData({
      customer_name: '',
      email: '',
      phone_number: '',
      value: '',
      pipeline_stage_id: pipelineStages.length > 0 ? pipelineStages[0].id : '',
    });
  };

  const handleSaveDeal = async () => {
    if (!dealFormData.customer_name.trim() || !dealFormData.value || !dealFormData.pipeline_stage_id) return;

    // Close modal immediately
    handleCloseDealDialog();

    try {
      const { error } = await supabase
        .from('pipeline_stage_deals')
        .insert([
          {
            customer_name: dealFormData.customer_name.trim(),
            email: dealFormData.email.trim() || null,
            phone_number: dealFormData.phone_number.trim() || null,
            value: parseFloat(dealFormData.value) || 0,
            pipeline_stage_id: dealFormData.pipeline_stage_id,
          },
        ]);

      if (error) {
        console.error('Error creating deal:', error);
      }

      // Refetch deals
      await getData();
    } catch (error) {
      console.error('Error creating deal:', error);
      await getData();
    }
  };

  const handleOpenEditStageDialog = (stage: Tables<'pipeline_stages'>) => {
    setEditingStage(stage);
    setEditStageFormData({
      name: stage.name,
      color: stage.color,
      is_revenue: stage.is_revenue || false,
      is_input: stage.is_input || false,
    });
    setIsEditStageDialogOpen(true);
  };

  const handleCloseEditStageDialog = () => {
    setIsEditStageDialogOpen(false);
    setEditingStage(null);
    setEditStageFormData({
      name: '',
      color: STAGE_COLORS[0].hsl,
      is_revenue: false,
      is_input: false,
    });
  };

  const handleUpdateStage = async () => {
    if (!editStageFormData.name.trim() || !editingStage) return;

    // Close modal immediately
    handleCloseEditStageDialog();

    try {
      // If marking as revenue and there's already a revenue stage (and it's not the current one), unmark it first
      if (editStageFormData.is_revenue) {
        const existingRevenueStage = getExistingRevenueStage();
        
        if (existingRevenueStage && existingRevenueStage.id !== editingStage.id) {
          // Update existing revenue stage to false and current stage to true in parallel
          const [result1, result2] = await Promise.all([
            supabase
              .from('pipeline_stages')
              .update({ is_revenue: false })
              .eq('id', existingRevenueStage.id),
            supabase
              .from('pipeline_stages')
              .update({
                name: editStageFormData.name.trim(),
                color: editStageFormData.color,
                is_revenue: true,
                is_input: editStageFormData.is_input,
              })
              .eq('id', editingStage.id),
          ]);

          if (result1.error || result2.error) {
            console.error('Error updating stage:', result1.error || result2.error);
          }
        } else {
          // No existing revenue stage or it's the same stage, just update normally
          const { error } = await supabase
            .from('pipeline_stages')
            .update({
              name: editStageFormData.name.trim(),
              color: editStageFormData.color,
              is_revenue: true,
              is_input: editStageFormData.is_input,
            })
            .eq('id', editingStage.id);

          if (error) {
            console.error('Error updating stage:', error);
          }
        }
      } else {
        // Not marking as revenue, update normally
        const { error } = await supabase
          .from('pipeline_stages')
          .update({
            name: editStageFormData.name.trim(),
            color: editStageFormData.color,
            is_revenue: false,
            is_input: editStageFormData.is_input,
          })
          .eq('id', editingStage.id);

        if (error) {
          console.error('Error updating stage:', error);
        }
      }

      // Refetch pipeline stages
      await getData();
    } catch (error) {
      console.error('Error updating stage:', error);
      await getData();
    }
  };

  const handleOpenArchiveDealDialog = (deal: Tables<'pipeline_stage_deals'>) => {
    setArchivingDeal(deal);
    setIsArchiveDealDialogOpen(true);
  };

  const handleCloseArchiveDealDialog = () => {
    setIsArchiveDealDialogOpen(false);
    setArchivingDeal(null);
  };

  const handleArchiveDeal = async (withRevenue: boolean) => {
    if (!archivingDeal) return;

    // Close modal immediately
    handleCloseArchiveDealDialog();

    try {
      const { error } = await supabase
        .from('pipeline_stage_deals')
        .update({
          pipeline_stage_id: null,
          is_revenue: withRevenue,
          closed_at: new Date().toISOString(),
        })
        .eq('id', archivingDeal.id);

      if (error) {
        console.error('Error archiving deal:', error);
      }

      // Refetch deals
      await getData();
    } catch (error) {
      console.error('Error archiving deal:', error);
      await getData();
    }
  };

  const handleMoveStage = async (currentIndex: number, direction: 'left' | 'right') => {
    if (isReordering) return;
    
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    
    // Validate bounds
    if (newIndex < 0 || newIndex >= pipelineStages.length) return;

    setIsReordering(true);

    try {
      const currentStage = pipelineStages[currentIndex];
      const adjacentStage = pipelineStages[newIndex];

      // Swap orders: if current is at index 1 (order 2) and adjacent is at index 2 (order 3)
      // After swap: current should have order 3, adjacent should have order 2
      const currentOrder = currentStage.order;
      const adjacentOrder = adjacentStage.order;

      // Update both stages in parallel
      const [result1, result2] = await Promise.all([
        supabase
          .from('pipeline_stages')
          .update({ order: adjacentOrder })
          .eq('id', currentStage.id),
        supabase
          .from('pipeline_stages')
          .update({ order: currentOrder })
          .eq('id', adjacentStage.id),
      ]);

      if (result1.error || result2.error) {
        console.error('Error reordering stages:', result1.error || result2.error);
      }

      // Refetch pipeline stages
      await getData();
    } catch (error) {
      console.error('Error reordering stages:', error);
      await getData();
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 h-full">
      <DashboardHeader 
        deals={pipelineDeals.filter(deal => deal.pipeline_stage_id !== null)}
        pipelines={pipelines}
        selectedPipelineId={selectedPipelineId}
        onPipelineChange={handlePipelineChange}
        currentPipeline={currentPipeline}
        stagesCount={pipelineStages.length}
        onNewDealClick={handleOpenDealDialog}
        revenueValue={getRevenueValue()}
        conversionRate={getConversionRate()}
      />
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ height: 'calc(100vh - 340px)' }}>
          {pipelineStages.map((stage, index) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={getDealsByStage(stage.id)}
              index={index}
              totalStages={pipelineStages.length}
              onMoveLeft={() => handleMoveStage(index, 'left')}
              onMoveRight={() => handleMoveStage(index, 'right')}
              onEditClick={() => handleOpenEditStageDialog(stage)}
              onArchiveDeal={handleOpenArchiveDealDialog}
              isReordering={isReordering}
            />
          ))}
          {/* Empty column for creating new stage */}
          <div className="flex flex-col bg-secondary/30 rounded-xl min-w-[320px] max-w-[320px] h-full border-2 border-dashed border-border/50">
            <div className="flex-1 flex items-center justify-center p-4">
              <Button
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-2 border-border hover:bg-primary/10 hover:border-primary/50 transition-colors"
                onClick={handleOpenStageDialog}
                disabled={isReordering}
              >
                <Plus className="w-5 h-5" />
                {pipelineStages.length === 0 ? 'Create First Stage' : 'Create New Stage'}
              </Button>
            </div>
          </div>
        </div>
      </DragDropContext>

      <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
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
                value={stageFormData.name}
                onChange={(e) => setStageFormData({ ...stageFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stage-color">Color *</Label>
              <select
                id="stage-color"
                value={stageFormData.color}
                onChange={(e) => setStageFormData({ ...stageFormData, color: e.target.value })}
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
                checked={stageFormData.is_revenue}
                onCheckedChange={(checked) => setStageFormData({ ...stageFormData, is_revenue: checked === true })}
              />
              <Label
                htmlFor="stage-is-revenue"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Mark as Revenue Stage
              </Label>
            </div>
            {stageFormData.is_revenue && getExistingRevenueStage() && (
              <Alert className="border-amber-500/20 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-sm text-foreground">
                  There is already a revenue stage ({getExistingRevenueStage()?.name}). It will be replaced when you save.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseStageDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveStage} disabled={!stageFormData.name.trim() || isReordering}>
              Create Stage
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDealDialogOpen} onOpenChange={setIsDealDialogOpen}>
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
                value={dealFormData.customer_name}
                onChange={(e) => setDealFormData({ ...dealFormData, customer_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deal-email">Email</Label>
              <Input
                id="deal-email"
                type="email"
                placeholder="Enter email (optional)"
                value={dealFormData.email}
                onChange={(e) => setDealFormData({ ...dealFormData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deal-phone">Phone Number</Label>
              <Input
                id="deal-phone"
                type="tel"
                placeholder="Enter phone number (optional)"
                value={dealFormData.phone_number}
                onChange={(e) => setDealFormData({ ...dealFormData, phone_number: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deal-value">Value *</Label>
              <Input
                id="deal-value"
                type="number"
                placeholder="Enter deal value"
                value={dealFormData.value}
                onChange={(e) => setDealFormData({ ...dealFormData, value: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deal-stage">Stage *</Label>
              <Select
                value={dealFormData.pipeline_stage_id}
                onValueChange={(value) => setDealFormData({ ...dealFormData, pipeline_stage_id: value })}
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
            <Button variant="outline" onClick={handleCloseDealDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveDeal} 
              disabled={!dealFormData.customer_name.trim() || !dealFormData.value || !dealFormData.pipeline_stage_id || isReordering}
            >
              Create Deal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditStageDialogOpen} onOpenChange={setIsEditStageDialogOpen}>
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
                onChange={(e) => setEditStageFormData({ ...editStageFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stage-color">Color *</Label>
              <select
                id="edit-stage-color"
                value={editStageFormData.color}
                onChange={(e) => setEditStageFormData({ ...editStageFormData, color: e.target.value })}
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
                onCheckedChange={(checked) => setEditStageFormData({ ...editStageFormData, is_revenue: checked === true })}
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
                onCheckedChange={(checked) => setEditStageFormData({ ...editStageFormData, is_input: checked === true })}
              />
              <Label
                htmlFor="edit-stage-is-input"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Mark as Input Stage
              </Label>
            </div>
            {editStageFormData.is_revenue && (() => {
              const existingRevenue = getExistingRevenueStage();
              return existingRevenue && existingRevenue.id !== editingStage?.id;
            })() && (
              <Alert className="border-amber-500/20 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-sm text-foreground">
                  There is already a revenue stage ({getExistingRevenueStage()?.name}). It will be replaced when you save.
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

      <Dialog open={isArchiveDealDialogOpen} onOpenChange={setIsArchiveDealDialogOpen}>
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

    </div>
  );
};

export default PipelineView;
