import supabase from "@/modules/common/supabase";
import { Tables, TablesInsert } from "@/modules/types/supabase.schema";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
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
}

export function PipelinesHomeProvider({ children }: { children: ReactNode }) {
  // Loading state
  const [loadingData, setLoadingData] = useState(true);

  // Pipeline states
  const [pipelines, setPipelines] = useState<Tables<'pipelines'>[]>([]);
  const [isCreatePipelineDialogOpen, setIsCreatePipelineDialogOpen] = useState(false);
  const [newPipelineFormData, setNewPipelineFormData] = useState<TablesInsert<'pipelines'>>(defaultNewPipelineFormData);

  const getData = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
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
  };

  useEffect(() => {
    getData();
  }, []);

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