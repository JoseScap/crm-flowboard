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
  pipelineLeads: Tables<'pipeline_stage_leads'>[];
  revenueStage: Tables<'pipeline_stages'> | null;

  // Dialog states
  isCreateStageDialogOpen: boolean;
  isCreateLeadDialogOpen: boolean;
  isEditStageDialogOpen: boolean;
  isArchiveLeadDialogOpen: boolean;

  // Form states
  createStageFormData: TablesInsert<'pipeline_stages'>;
  editStageFormData: TablesUpdate<'pipeline_stages'>;
  createLeadFormData: TablesInsert<'pipeline_stage_leads'>;

  // Other states
  archivingLead: TablesUpdate<'pipeline_stage_leads'> | null;
  editingStage: TablesUpdate<'pipeline_stages'> | null;
  isReordering: boolean;

  // Handlers
  handleChangePipelineView: (pipelineId: string) => void;
  handleDragEnd: (result: DropResult) => Promise<void>;
  handleOpenCreateStageDialog: () => void;
  handleCloseCreateStageDialog: () => void;
  handleSaveNewStage: () => Promise<void>;
  handleOpenCreateLeadDialog: (pipelineStageId: string) => void;
  handleCloseCreateLeadDialog: () => void;
  handleSaveNewLead: () => Promise<void>;
  handleOpenEditStageDialog: (stage: Tables<'pipeline_stages'>) => void;
  handleCloseEditStageDialog: () => void;
  handleUpdateStage: () => Promise<void>;
  handleOpenArchiveLeadDialog: (lead: Tables<'pipeline_stage_leads'>) => void;
  handleCloseArchiveLeadDialog: () => void;
  handleArchiveLead: (withRevenue: boolean) => Promise<void>;
  handleMoveStage: (currentIndex: number, direction: 'left' | 'right') => Promise<void>;
  handleChangeCreateStageFormData: <T extends keyof TablesInsert<'pipeline_stages'>>(field: T, value: TablesInsert<'pipeline_stages'>[T]) => void;
  handleChangeEditStageFormData: <T extends keyof TablesUpdate<'pipeline_stages'>>(field: T, value: TablesUpdate<'pipeline_stages'>[T]) => void;
  handleChangeCreateLeadFormData: <T extends keyof TablesInsert<'pipeline_stage_leads'>>(field: T, value: TablesInsert<'pipeline_stage_leads'>[T]) => void;

  // Utility functions
  getLeadsByStage: (stageId: string) => Tables<'pipeline_stage_leads'>[];
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
  ai_prompt: null,
}

const defaultEditStageFormData: TablesUpdate<'pipeline_stages'> = {
  name: '',
  color: STAGE_COLORS[0].hsl,
  is_revenue: false,
  is_input: false,
  ai_prompt: null,
}

const defaultCreateLeadFormData: TablesInsert<'pipeline_stage_leads'> = {
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
  const [pipelineLeads, setPipelineLeads] = useState<Tables<'pipeline_stage_leads'>[]>([]);
  const [isCreateStageDialogOpen, setIsCreateStageDialogOpen] = useState(false);
  const [isCreateLeadDialogOpen, setIsCreateLeadDialogOpen] = useState(false);
  const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
  const [isArchiveLeadDialogOpen, setIsArchiveLeadDialogOpen] = useState(false);
  const [archivingLead, setArchivingLead] = useState<Tables<'pipeline_stage_leads'> | null>(null);
  const [editingStage, setEditingStage] = useState<Tables<'pipeline_stages'> | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [createStageFormData, setCreateStageFormData] = useState<TablesInsert<'pipeline_stages'>>(defaultStageFormData);
  const [editStageFormData, setEditStageFormData] = useState<TablesUpdate<'pipeline_stages'>>(defaultEditStageFormData);
  const [createLeadFormData, setCreateLeadFormData] = useState<TablesInsert<'pipeline_stage_leads'>>(defaultCreateLeadFormData);

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
    
    // Fetch leads - both active (with stage_id) and closed (with is_revenue=true)
    let pipelineLeads: Tables<'pipeline_stage_leads'>[] | null = null;
    let pipelineLeadsError = null;
    if (pipelineStages && pipelineStages.length > 0) {
      // Get active leads (with stage_id)
      const activeLeadsResult = await supabase
        .from('pipeline_stage_leads')
        .select('*')
        .in('pipeline_stage_id', pipelineStages.map(stage => stage.id))
        .eq('business_id', parseInt(businessId, 10))
        .order('created_at', { ascending: true });
      
      // Get closed leads (stage_id null - both with and without revenue)
      const closedLeadsResult = await supabase
        .from('pipeline_stage_leads')
        .select('*')
        .is('pipeline_stage_id', null)
        .eq('business_id', parseInt(businessId, 10))
        .order('created_at', { ascending: true });
      
      // Combine both results
      pipelineLeads = [
        ...(activeLeadsResult.data || []),
        ...(closedLeadsResult.data || [])
      ];
      pipelineLeadsError = activeLeadsResult.error || closedLeadsResult.error;
    } else {
      // If no stages, still get closed leads
      const closedLeadsResult = await supabase
        .from('pipeline_stage_leads')
        .select('*')
        .is('pipeline_stage_id', null)
        .eq('business_id', parseInt(businessId, 10))
        .order('created_at', { ascending: true });
      
      pipelineLeads = closedLeadsResult.data || [];
      pipelineLeadsError = closedLeadsResult.error;
    }

    if (error) {
      console.error('Error fetching pipelines:', error);
    }
    
    if (pipelineStagesError) {
      console.error('Error fetching pipeline stages:', pipelineStagesError);
    }
    
    if (pipelineLeadsError) {
      console.error('Error fetching pipeline leads:', pipelineLeadsError);
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
    
    if (pipelineLeads) {
      setPipelineLeads(pipelineLeads);
    }
  }, [businessId, pipelineId]);

  useEffect(() => {
    getData();
  }, [getData]);

  // Set up realtime subscription for pipeline_stage_leads
  useEffect(() => {
    if (!businessId || !pipelineId || isNaN(parseInt(businessId, 10))) {
      return;
    }

    const channel = supabase
      .channel(`pipeline_stage_leads-changes-${businessId}-${pipelineId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'pipeline_stage_leads',
          filter: `business_id=eq.${businessId}`,
        },
        () => {
          // Refresh leads data when there are changes
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

    // Find the lead being moved
    const lead = pipelineLeads.find((d) => d.id.toString() === draggableId);
    if (!lead) return;

    // Update the lead's pipeline_stage_id in the database
    try {
      const { error } = await supabase
        .from('pipeline_stage_leads')
        .update({ pipeline_stage_id: parseInt(destination.droppableId, 10) })
        .eq('id', parseInt(draggableId, 10))
        .eq('business_id', parseInt(businessId, 10));

      if (error) {
        console.error('Error updating lead stage:', error);
      } else {
        // Refetch leads to update UI
        await getData();
      }
    } catch (error) {
      console.error('Error updating lead stage:', error);
    }
  };

  const getLeadsByStage = (stageId: string): Tables<'pipeline_stage_leads'>[] => {
    const stageIdNum = parseInt(stageId, 10);
    return pipelineLeads.filter((lead) => lead.pipeline_stage_id === stageIdNum);
  };

  const getRevenueValue = (): { total: number; closed: number } => {
    const revenueStage = pipelineStages.find(stage => stage.is_revenue === true);
    
    // Get active leads in revenue stage
    const activeRevenueLeads = revenueStage 
      ? pipelineLeads.filter(lead => lead.pipeline_stage_id === revenueStage.id)
      : [];
    
    // Get closed leads (stage_id null and is_revenue true)
    const closedRevenueLeads = pipelineLeads.filter(
      lead => lead.pipeline_stage_id === null && lead.is_revenue === true
    );
    
    const activeTotal = activeRevenueLeads.reduce((sum, lead) => sum + lead.value, 0);
    const closedTotal = closedRevenueLeads.reduce((sum, lead) => sum + lead.value, 0);
    
    return {
      total: activeTotal + closedTotal,
      closed: closedTotal
    };
  };

  const getConversionRate = (): number => {
    // Get all closed leads (with and without revenue)
    const allClosedLeads = pipelineLeads.filter(
      lead => lead.pipeline_stage_id === null
    );
    
    // Get closed leads with revenue
    const closedLeadsWithRevenue = allClosedLeads.filter(
      lead => lead.is_revenue === true
    );
    
    if (allClosedLeads.length === 0) return 0;
    
    return Math.round((closedLeadsWithRevenue.length / allClosedLeads.length) * 100);
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
                  ai_prompt: createStageFormData.ai_prompt?.trim() || null,
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
                ai_prompt: createStageFormData.ai_prompt?.trim() || null,
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
                ai_prompt: createStageFormData.ai_prompt?.trim() || null,
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

  const handleOpenCreateLeadDialog = (pipelineStageId: string) => {
    setCreateLeadFormData({
      ...defaultCreateLeadFormData,
      pipeline_stage_id: parseInt(pipelineStageId, 10),
    });
    setIsCreateLeadDialogOpen(true);
  };

  const handleCloseCreateLeadDialog = () => {
    setIsCreateLeadDialogOpen(false);
    setCreateLeadFormData(defaultCreateLeadFormData);
  };

  const handleSaveNewLead = async () => {
    if (!createLeadFormData.customer_name.trim() || !createLeadFormData.value || !createLeadFormData.pipeline_stage_id) return;

    // Close modal immediately
    handleCloseCreateLeadDialog();

    try {
      const { error } = await supabase
        .from('pipeline_stage_leads')
        .insert([
          {
            customer_name: createLeadFormData.customer_name.trim(),
            email: createLeadFormData.email.trim() || null,
            phone_number: createLeadFormData.phone_number.trim() || null,
            value: createLeadFormData.value,
            pipeline_stage_id: createLeadFormData.pipeline_stage_id,
            business_id: parseInt(businessId, 10),
          },
        ]);

      if (error) {
        console.error('Error creating lead:', error);
      }

      // Refetch leads
      await getData();
    } catch (error) {
      console.error('Error creating lead:', error);
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
      ai_prompt: stage.ai_prompt || null,
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
                ai_prompt: editStageFormData.ai_prompt?.trim() || null,
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
              ai_prompt: editStageFormData.ai_prompt?.trim() || null,
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
            ai_prompt: editStageFormData.ai_prompt?.trim() || null,
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

  const handleOpenArchiveLeadDialog = (lead: Tables<'pipeline_stage_leads'>) => {
    setArchivingLead(lead);
    setIsArchiveLeadDialogOpen(true);
  };

  const handleCloseArchiveLeadDialog = () => {
    setIsArchiveLeadDialogOpen(false);
    setArchivingLead(null);
  };

  const handleArchiveLead = async (withRevenue: boolean) => {
    if (!archivingLead) return;

    // Close modal immediately
    handleCloseArchiveLeadDialog();

    try {
      const { error } = await supabase
        .from('pipeline_stage_leads')
        .update({
          pipeline_stage_id: null,
          is_revenue: withRevenue,
          closed_at: new Date().toISOString(),
        })
        .eq('id', archivingLead.id);

      if (error) {
        console.error('Error archiving lead:', error);
      }

      // Refetch leads
      await getData();
    } catch (error) {
      console.error('Error archiving lead:', error);
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

  const handleChangeCreateLeadFormData = <T extends keyof TablesInsert<'pipeline_stage_leads'>>(field: T, value: TablesInsert<'pipeline_stage_leads'>[T]) => {
    setCreateLeadFormData((prev) => ({ ...prev, [field]: value }));
  };

  const value: PipelineViewContextType = {
    // Pipeline states
    pipelines,
    selectedPipelineId,
    currentPipeline,
    pipelineStages,
    pipelineLeads,
    revenueStage,

    // Dialog states
    isCreateStageDialogOpen,
    isCreateLeadDialogOpen,
    isEditStageDialogOpen,
    isArchiveLeadDialogOpen,

    // Form states
    createStageFormData,
    editStageFormData,
    createLeadFormData,

    // Other states
    archivingLead,
    editingStage,
    isReordering,

    // Handlers
    handleChangePipelineView,
    handleDragEnd,
    handleOpenCreateStageDialog,
    handleCloseCreateStageDialog,
    handleSaveNewStage,
    handleOpenCreateLeadDialog,
    handleCloseCreateLeadDialog,
    handleSaveNewLead,
    handleOpenEditStageDialog,
    handleCloseEditStageDialog,
    handleUpdateStage,
    handleOpenArchiveLeadDialog,
    handleCloseArchiveLeadDialog,
    handleArchiveLead,
    handleMoveStage,
    handleChangeCreateStageFormData,
    handleChangeEditStageFormData,
    handleChangeCreateLeadFormData,

    // Utility functions
    getLeadsByStage,
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

