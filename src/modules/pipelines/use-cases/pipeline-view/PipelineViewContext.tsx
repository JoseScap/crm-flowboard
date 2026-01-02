import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DropResult } from '@hello-pangea/dnd';
import supabase from '@/modules/common/lib/supabase';
import { STAGE_COLORS } from '@/constants/colors';
import { Tables, TablesInsert, TablesUpdate } from '@/modules/types/supabase.schema';

interface PipelineViewContextType {
  // Pipeline states
  pipelines: Tables<'pipelines'>[];
  selectedPipelineId: string;
  currentPipeline: Tables<'pipelines'> | null;
  pipelineStages: Tables<'pipeline_stages'>[];
  pipelineDeals: Tables<'pipeline_stage_deals'>[];
  revenueStage: Tables<'pipeline_stages'> | null;

  // Dialog states
  isCreateStageDialogOpen: boolean;
  isCreateDealDialogOpen: boolean;
  isEditStageDialogOpen: boolean;
  isArchiveDealDialogOpen: boolean;

  // Form states
  createStageFormData: TablesInsert<'pipeline_stages'>;
  editStageFormData: TablesUpdate<'pipeline_stages'>;
  createDealFormData: TablesInsert<'pipeline_stage_deals'>;

  // Other states
  archivingDeal: TablesUpdate<'pipeline_stage_deals'> | null;
  editingStage: TablesUpdate<'pipeline_stages'> | null;
  isReordering: boolean;

  // Handlers
  handleChangePipelineView: (pipelineId: string) => void;
  handleDragEnd: (result: DropResult) => Promise<void>;
  handleOpenCreateStageDialog: () => void;
  handleCloseCreateStageDialog: () => void;
  handleSaveNewStage: () => Promise<void>;
  handleOpenCreateDealDialog: (pipelineStageId: string) => void;
  handleCloseCreateDealDialog: () => void;
  handleSaveNewDeal: () => Promise<void>;
  handleOpenEditStageDialog: (stage: Tables<'pipeline_stages'>) => void;
  handleCloseEditStageDialog: () => void;
  handleUpdateStage: () => Promise<void>;
  handleOpenArchiveDealDialog: (deal: Tables<'pipeline_stage_deals'>) => void;
  handleCloseArchiveDealDialog: () => void;
  handleArchiveDeal: (withRevenue: boolean) => Promise<void>;
  handleMoveStage: (currentIndex: number, direction: 'left' | 'right') => Promise<void>;
  handleChangeCreateStageFormData: <T extends keyof TablesInsert<'pipeline_stages'>>(field: T, value: TablesInsert<'pipeline_stages'>[T]) => void;
  handleChangeEditStageFormData: <T extends keyof TablesUpdate<'pipeline_stages'>>(field: T, value: TablesUpdate<'pipeline_stages'>[T]) => void;
  handleChangeCreateDealFormData: <T extends keyof TablesInsert<'pipeline_stage_deals'>>(field: T, value: TablesInsert<'pipeline_stage_deals'>[T]) => void;

  // Utility functions
  getDealsByStage: (stageId: string) => Tables<'pipeline_stage_deals'>[];
  getRevenueValue: () => { total: number; closed: number };
  getConversionRate: () => number;
}

const PipelineViewContext = createContext<PipelineViewContextType | undefined>(undefined);

const defaultStageFormData: TablesInsert<'pipeline_stages'> = {
  name: '',
  color: STAGE_COLORS[0].hsl,
  is_revenue: false,
  order: 0,
  is_input: false,
  pipeline_id: 0,
  business_id: 0,
}

const defaultEditStageFormData: TablesUpdate<'pipeline_stages'> = {
  name: '',
  color: STAGE_COLORS[0].hsl,
  is_revenue: false,
  is_input: false,
}

const defaultCreateDealFormData: TablesInsert<'pipeline_stage_deals'> = {
  customer_name: '',
  email: '',
  phone_number: '',
  value: 0,
  pipeline_stage_id: 0,
  business_id: 0,
}

export function PipelineViewProvider({ children }: { children: ReactNode }) {
  const { id: businessId, pipelineId } = useParams<{ id: string; pipelineId: string }>();
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState<Tables<'pipelines'>[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [currentPipeline, setCurrentPipeline] = useState<Tables<'pipelines'> | null>(null);
  const [pipelineStages, setPipelineStages] = useState<Tables<'pipeline_stages'>[]>([]);
  const [pipelineDeals, setPipelineDeals] = useState<Tables<'pipeline_stage_deals'>[]>([]);
  const [isCreateStageDialogOpen, setIsCreateStageDialogOpen] = useState(false);
  const [isCreateDealDialogOpen, setIsCreateDealDialogOpen] = useState(false);
  const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
  const [isArchiveDealDialogOpen, setIsArchiveDealDialogOpen] = useState(false);
  const [archivingDeal, setArchivingDeal] = useState<Tables<'pipeline_stage_deals'> | null>(null);
  const [editingStage, setEditingStage] = useState<Tables<'pipeline_stages'> | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [createStageFormData, setCreateStageFormData] = useState<TablesInsert<'pipeline_stages'>>(defaultStageFormData);
  const [editStageFormData, setEditStageFormData] = useState<TablesUpdate<'pipeline_stages'>>(defaultEditStageFormData);
  const [createDealFormData, setCreateDealFormData] = useState<TablesInsert<'pipeline_stage_deals'>>(defaultCreateDealFormData);

  const getData = useCallback(async () => {
    if (!businessId || !pipelineId) return;
    
    const { data: pipelines, error } = await supabase
      .from('pipelines')
      .select('*')
      .eq('business_id', parseInt(businessId, 10));
    const { data: pipelineStages, error: pipelineStagesError } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('pipeline_id', parseInt(pipelineId, 10))
      .eq('business_id', parseInt(businessId, 10))
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
        .eq('business_id', parseInt(businessId, 10))
        .order('created_at', { ascending: true });
      
      // Get closed deals (stage_id null - both with and without revenue)
      const closedDealsResult = await supabase
        .from('pipeline_stage_deals')
        .select('*')
        .is('pipeline_stage_id', null)
        .eq('business_id', parseInt(businessId, 10))
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
        .eq('business_id', parseInt(businessId, 10))
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
      const pipelineIdFromUrl = pipelineId || (pipelines.length > 0 ? pipelines[0].id.toString() : '');
      
      if (pipelineIdFromUrl) {
        setSelectedPipelineId(pipelineIdFromUrl);
        
        // Find and set current pipeline data
        const pipeline = pipelines.find(p => p.id.toString() === pipelineIdFromUrl);
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
  }, [businessId, pipelineId]);

  useEffect(() => {
    getData();
  }, [getData]);

  // Set up realtime subscription for pipeline_stage_deals
  useEffect(() => {
    if (!businessId || !pipelineId || isNaN(parseInt(businessId, 10))) {
      return;
    }

    const channel = supabase
      .channel(`pipeline_stage_deals-changes-${businessId}-${pipelineId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'pipeline_stage_deals',
          filter: `business_id=eq.${businessId}`,
        },
        () => {
          // Refresh deals data when there are changes
          getData();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [getData, businessId, pipelineId]);

  const revenueStage = useMemo(() => {
    return pipelineStages.find(stage => stage.is_revenue === true) || null;
  }, [pipelineStages]);
  
  const handleChangePipelineView = (newPipelineId: string) => {
    setSelectedPipelineId(newPipelineId);
    
    // Find and set current pipeline data
    const pipeline = pipelines.find(p => p.id.toString() === newPipelineId);
    if (pipeline) {
    }

    setCurrentPipeline(pipeline);
    navigate(`/user/businesses/${businessId}/pipeline/${newPipelineId}`, { replace: true });
  };

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
    const deal = pipelineDeals.find((d) => d.id.toString() === draggableId);
    if (!deal) return;

    // Update the deal's pipeline_stage_id in the database
    try {
      const { error } = await supabase
        .from('pipeline_stage_deals')
        .update({ pipeline_stage_id: parseInt(destination.droppableId, 10) })
        .eq('id', parseInt(draggableId, 10))
        .eq('business_id', parseInt(businessId, 10));

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
    const stageIdNum = parseInt(stageId, 10);
    return pipelineDeals.filter((deal) => deal.pipeline_stage_id === stageIdNum);
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

  const getExistingRevenueStage = (): Tables<'pipeline_stages'> | null => {
    return pipelineStages.find(stage => stage.is_revenue === true) || null;
  };

  const handleOpenCreateStageDialog = () => {
    setCreateStageFormData(defaultStageFormData);
    setIsCreateStageDialogOpen(true);
  };

  const handleCloseCreateStageDialog = () => {
    setIsCreateStageDialogOpen(false);
    setCreateStageFormData(defaultStageFormData);
  };

  const handleSaveNewStage = async () => {
    if (!createStageFormData.name.trim() || !pipelineId) return;

    // Close modal immediately
    handleCloseCreateStageDialog();

    // Calculate order: if there are 3 stages, new one will be 4
    const newOrder = pipelineStages.length + 1;

    try {
      // If marking as revenue and there's already a revenue stage, unmark it first
      if (createStageFormData.is_revenue) {
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
                  name: createStageFormData.name.trim(),
                  color: createStageFormData.color,
                  pipeline_id: parseInt(pipelineId, 10),
                  business_id: parseInt(businessId, 10),
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
                name: createStageFormData.name.trim(),
                color: createStageFormData.color,
                pipeline_id: parseInt(pipelineId, 10),
                business_id: parseInt(businessId, 10),
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
                name: createStageFormData.name.trim(),
                color: createStageFormData.color,
                pipeline_id: parseInt(pipelineId, 10),
                business_id: parseInt(businessId, 10),
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

  const handleOpenCreateDealDialog = (pipelineStageId: string) => {
    setCreateDealFormData({
      ...defaultCreateDealFormData,
      pipeline_stage_id: parseInt(pipelineStageId, 10),
    });
    setIsCreateDealDialogOpen(true);
  };

  const handleCloseCreateDealDialog = () => {
    setIsCreateDealDialogOpen(false);
    setCreateDealFormData(defaultCreateDealFormData);
  };

  const handleSaveNewDeal = async () => {
    if (!createDealFormData.customer_name.trim() || !createDealFormData.value || !createDealFormData.pipeline_stage_id) return;

    // Close modal immediately
    handleCloseCreateDealDialog();

    try {
      const { error } = await supabase
        .from('pipeline_stage_deals')
        .insert([
          {
            customer_name: createDealFormData.customer_name.trim(),
            email: createDealFormData.email.trim() || null,
            phone_number: createDealFormData.phone_number.trim() || null,
            value: createDealFormData.value,
            pipeline_stage_id: createDealFormData.pipeline_stage_id,
            business_id: parseInt(businessId, 10),
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
      id: stage.id,
      name: stage.name,
      color: stage.color,
      is_revenue: stage.is_revenue,
      is_input: stage.is_input,
    });
    setIsEditStageDialogOpen(true);
  };

  const handleCloseEditStageDialog = () => {
    setIsEditStageDialogOpen(false);
    setEditingStage(null);
    setEditStageFormData(defaultEditStageFormData);
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

  const handleChangeCreateStageFormData = <T extends keyof TablesInsert<'pipeline_stages'>>(field: T, value: TablesInsert<'pipeline_stages'>[T]) => {
    setCreateStageFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeEditStageFormData = <T extends keyof TablesUpdate<'pipeline_stages'>>(field: T, value: TablesUpdate<'pipeline_stages'>[T]) => {
    setEditStageFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeCreateDealFormData = <T extends keyof TablesInsert<'pipeline_stage_deals'>>(field: T, value: TablesInsert<'pipeline_stage_deals'>[T]) => {
    setCreateDealFormData((prev) => ({ ...prev, [field]: value }));
  };

  const value: PipelineViewContextType = {
    // Pipeline states
    pipelines,
    selectedPipelineId,
    currentPipeline,
    pipelineStages,
    pipelineDeals,
    revenueStage,

    // Dialog states
    isCreateStageDialogOpen,
    isCreateDealDialogOpen,
    isEditStageDialogOpen,
    isArchiveDealDialogOpen,

    // Form states
    createStageFormData,
    editStageFormData,
    createDealFormData,

    // Other states
    archivingDeal,
    editingStage,
    isReordering,

    // Handlers
    handleChangePipelineView,
    handleDragEnd,
    handleOpenCreateStageDialog,
    handleCloseCreateStageDialog,
    handleSaveNewStage,
    handleOpenCreateDealDialog,
    handleCloseCreateDealDialog,
    handleSaveNewDeal,
    handleOpenEditStageDialog,
    handleCloseEditStageDialog,
    handleUpdateStage,
    handleOpenArchiveDealDialog,
    handleCloseArchiveDealDialog,
    handleArchiveDeal,
    handleMoveStage,
    handleChangeCreateStageFormData,
    handleChangeEditStageFormData,
    handleChangeCreateDealFormData,

    // Utility functions
    getDealsByStage,
    getRevenueValue,
    getConversionRate,
  };

  return (
    <PipelineViewContext.Provider value={value}>
      {children}
    </PipelineViewContext.Provider>
  );
}

export function usePipelineViewContext() {
  const context = useContext(PipelineViewContext);
  if (!context) {
    throw new Error('usePipelineViewContext must be used within a PipelineViewProvider');
  }
  return context;
}

