import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import supabase from "@/modules/common/lib/supabase";
import { Tables } from "@/modules/types/supabase.schema";
import { initiateGoogleOAuth } from "@/lib/google-oauth";

export interface Application {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  color: string;
  isConnected: boolean;
  connectedAt?: string;
  pipelineId?: number; // Pipeline al que está conectada
  pipelineName?: string; // Nombre del pipeline conectado
}

interface ApplicationsHomeContextType {
  // Loading state
  loadingData: boolean;

  // Applications state
  applications: Application[];
  pipelines: Tables<'pipelines'>[];
  
  // Dialog state
  isPipelineSelectorDialogOpen: boolean;
  selectedApplicationId: string | null;

  // Handlers
  handleConnectApplication: (applicationId: string) => void;
  handleDisconnectApplication: (applicationId: string, pipelineId: number) => Promise<void>;
  handleOpenPipelineSelector: (applicationId: string) => void;
  handleClosePipelineSelector: () => void;
  handleSelectPipeline: (pipelineId: number) => void;
}

const ApplicationsHomeContext = createContext<ApplicationsHomeContextType | undefined>(undefined);

export function ApplicationsHomeProvider({ children }: { children: ReactNode }) {
  const { id: businessId } = useParams<{ id: string }>();
  
  // Loading state
  const [loadingData, setLoadingData] = useState(true);

  // Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [pipelines, setPipelines] = useState<Tables<'pipelines'>[]>([]);
  
  // Dialog state
  const [isPipelineSelectorDialogOpen, setIsPipelineSelectorDialogOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  const getData = async () => {
    try {
      setLoadingData(true);
      
      if (!businessId) {
        setLoadingData(false);
        return;
      }

      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingData(false);
        return;
      }

      // Obtener pipelines del business
      const { data: pipelinesData, error: pipelinesError } = await supabase
        .from('pipelines')
        .select('*')
        .eq('business_id', parseInt(businessId, 10))
        .order('created_at', { ascending: false });

      if (pipelinesError) {
        console.error('Error fetching pipelines:', pipelinesError);
      } else if (pipelinesData) {
        setPipelines(pipelinesData);
      }

      // Obtener conexiones OAuth existentes para todos los pipelines del business
      const pipelineIds = pipelinesData?.map(p => p.id) || [];
      
      let connections: any[] = [];
      if (pipelineIds.length > 0) {
        const { data: connectionsData, error: connectionsError } = await supabase
          .from('pipeline_oauth_connections')
          .select('*')
          .in('pipeline_id', pipelineIds);

        if (connectionsError) {
          console.error('Error fetching connections:', connectionsError);
        } else if (connectionsData) {
          connections = connectionsData;
        }
      }

      // Definir aplicaciones disponibles
      const availableApplications: Application[] = [
        {
          id: 'google-calendar',
          name: 'Google Calendar',
          description: 'Sync your calendar events and schedule meetings directly from your CRM',
          icon: null,
          color: 'bg-blue-500',
          isConnected: false,
        },
      ];

      // Marcar como conectadas las que tienen conexión en la BD
      // Agrupamos por application_id para mostrar si está conectada en algún pipeline
      const applicationsWithConnections = availableApplications.map(app => {
        const appConnections = connections.filter(c => c.application_id === app.id);
        const isConnected = appConnections.length > 0;
        const latestConnection = appConnections.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        // Encontrar el nombre del pipeline si hay conexión
        const connectedPipeline = latestConnection 
          ? pipelinesData?.find(p => p.id === latestConnection.pipeline_id)
          : null;

        return {
          ...app,
          isConnected,
          connectedAt: latestConnection?.created_at,
          pipelineId: latestConnection?.pipeline_id,
          pipelineName: connectedPipeline?.name,
        };
      });

      setApplications(applicationsWithConnections);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error fetching applications');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    getData();
  }, [businessId]);

  // Handlers
  const handleOpenPipelineSelector = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsPipelineSelectorDialogOpen(true);
  };

  const handleClosePipelineSelector = () => {
    setIsPipelineSelectorDialogOpen(false);
    setSelectedApplicationId(null);
  };

  const handleSelectPipeline = (pipelineId: number) => {
    if (!selectedApplicationId) return;

    if (selectedApplicationId === 'google-calendar') {
      try {
        initiateGoogleOAuth(pipelineId);
      } catch (error: any) {
        console.error('Error initiating OAuth:', error);
        toast.error(error.message || 'Error connecting application');
      }
    } else {
      toast.info(`Connecting to ${selectedApplicationId}...`);
    }
  };

  const handleConnectApplication = (applicationId: string) => {
    // Abrir el selector de pipelines
    handleOpenPipelineSelector(applicationId);
  };

  const handleDisconnectApplication = async (applicationId: string, pipelineId: number) => {
    try {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Eliminar la conexión
      const { error } = await supabase
        .from('pipeline_oauth_connections')
        .delete()
        .eq('pipeline_id', pipelineId)
        .eq('application_id', applicationId);

      if (error) {
        throw error;
      }

      // Refrescar los datos
      await getData();

      toast.success('Application disconnected successfully');
    } catch (error: any) {
      console.error('Error disconnecting application:', error);
      toast.error(error.message || 'Error disconnecting application');
    }
  };

  const value: ApplicationsHomeContextType = {
    // Loading state
    loadingData,

    // Applications state
    applications,
    pipelines,
    
    // Dialog state
    isPipelineSelectorDialogOpen,
    selectedApplicationId,

    // Handlers
    handleConnectApplication,
    handleDisconnectApplication,
    handleOpenPipelineSelector,
    handleClosePipelineSelector,
    handleSelectPipeline,
  };

  return (
    <ApplicationsHomeContext.Provider value={value}>
      {children}
    </ApplicationsHomeContext.Provider>
  );
}

export function useApplicationsHomeContext() {
  const context = useContext(ApplicationsHomeContext);
  if (!context) {
    throw new Error('useApplicationsHomeContext must be used within a ApplicationsHomeProvider');
  }
  return context;
}

