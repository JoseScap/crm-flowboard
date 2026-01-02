import supabase from "@/modules/common/lib/supabase";
import { Tables, TablesInsert } from "@/modules/types/supabase.schema";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface PipelinesHomeContextType {
  // Loading state
  loadingData: boolean;

  // Pipeline states
  pipelines: Tables<'pipelines'>[];
  isCreatePipelineDialogOpen: boolean;
  newPipelineFormData: TablesInsert<'pipelines'>;

  // Handlers
  handleCreatePipeline: () => void;
  handleChangeNewPipelineFormData: <T extends keyof TablesInsert<'pipelines'>>(field: T, value: TablesInsert<'pipelines'>[T]) => void;
  handleCancelCreatePipeline: () => void;
  handleSavePipeline: () => Promise<void>;
}

const PipelinesHomeContext = createContext<PipelinesHomeContextType | undefined>(undefined);

const defaultNewPipelineFormData: TablesInsert<'pipelines'> = {
  name: '',
  description: '',
  business_id: 0,
}

export function PipelinesHomeProvider({ children }: { children: ReactNode }) {
  const { id: businessIdParam } = useParams<{ id: string }>();
  const businessId = businessIdParam ? parseInt(businessIdParam, 10) : null;

  // Loading state
  const [loadingData, setLoadingData] = useState(true);

  // Pipeline states
  const [pipelines, setPipelines] = useState<Tables<'pipelines'>[]>([]);
  const [isCreatePipelineDialogOpen, setIsCreatePipelineDialogOpen] = useState(false);
  const [newPipelineFormData, setNewPipelineFormData] = useState<TablesInsert<'pipelines'>>(defaultNewPipelineFormData);

  const getData = useCallback(async () => {
    if (!businessId || isNaN(businessId)) {
      setLoadingData(false);
      return;
    }

    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error fetching pipelines');
      } else if (data) {
        setPipelines(data);
      }
    } catch (error) {
      toast.error('Error fetching pipelines');
    } finally {
      setLoadingData(false);
    }
  }, [businessId]);

  useEffect(() => {
    getData();
  }, [getData]);

  // Handlers
  const handleCreatePipeline = () => {
    setNewPipelineFormData(defaultNewPipelineFormData);
    setIsCreatePipelineDialogOpen(true);
  };

  const handleChangeNewPipelineFormData = <T extends keyof TablesInsert<'pipelines'>>(field: T, value: TablesInsert<'pipelines'>[T]) => {
    setNewPipelineFormData({ ...newPipelineFormData, [field]: value });
  };

  const handleCancelCreatePipeline = () => {
    setIsCreatePipelineDialogOpen(false);
    setNewPipelineFormData(defaultNewPipelineFormData);
  };

  const handleSavePipeline = async () => {
    if (!businessId || isNaN(businessId)) {
      toast.error('Business ID is missing');
      return;
    }

    setIsCreatePipelineDialogOpen(false);
    setNewPipelineFormData(defaultNewPipelineFormData);
    setLoadingData(true);
    
    try {
      // Step 3: Insert into Supabase
      const { error } = await supabase
        .from('pipelines')
        .insert([
          {
            name: newPipelineFormData.name.trim(),
            description: newPipelineFormData.description.trim(),
            business_id: businessId,
          },
        ]);
      
      if (error) {
        toast.error('Error creating pipeline');
      }
      
      // Step 4: Refetch pipelines (whether it failed or succeeded)
      await getData();
    } catch (error) {
      console.error('Error creating pipeline:', error);
      // Still refetch to ensure UI is in sync
      await getData();
    }
  };

  const value: PipelinesHomeContextType = {
    // Loading state
    loadingData,

    // Pipeline states
    pipelines,
    isCreatePipelineDialogOpen,
    newPipelineFormData,

    // Handlers
    handleCreatePipeline,
    handleChangeNewPipelineFormData,
    handleCancelCreatePipeline,
    handleSavePipeline,
  };

  return (
    <PipelinesHomeContext.Provider value={value}>
      {children}
    </PipelinesHomeContext.Provider>
  );
}

export function usePipelinesHomeContext() {
  const context = useContext(PipelinesHomeContext);
  if (!context) {
    throw new Error('usePipelinesHomeContext must be used within a PipelinesHomeProvider');
  }
  return context;
}