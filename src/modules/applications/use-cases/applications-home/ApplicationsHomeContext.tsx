import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import supabase from "@/modules/common/lib/supabase";
import { Tables } from "@/modules/types/supabase.schema";
import { initiateGoogleOAuth } from "@/lib/google-oauth";

interface ApplicationsHomeContextType {
  // Loading state
  loadingData: boolean;

  // Connections state
  connections: Tables<'business_employee_oauth_connections'>[];
  
  // Handlers
  handleConnectApplication: (applicationId: string) => void;
  handleDisconnectApplication: (applicationId: string) => Promise<void>;
}

const ApplicationsHomeContext = createContext<ApplicationsHomeContextType | undefined>(undefined);

export function ApplicationsHomeProvider({ children }: { children: ReactNode }) {
  const { id: businessId } = useParams<{ id: string }>();
  
  // Loading state
  const [loadingData, setLoadingData] = useState(true);

  // Connections state
  const [connections, setConnections] = useState<Tables<'business_employee_oauth_connections'>[]>([]);

  const getData = async () => {
    try {
      setLoadingData(true);
      
      if (!businessId) {
        setLoadingData(false);
        return;
      }

      // Obtener conexiones OAuth del usuario para este business
      // RLS se encarga de filtrar por el usuario autenticado
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('business_employee_oauth_connections')
        .select('*')
        .eq('business_id', parseInt(businessId, 10));

      if (connectionsError) {
        console.error('Error fetching connections:', connectionsError);
      } else {
        setConnections(connectionsData || []);
      }
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
  const handleConnectApplication = async (applicationId: string) => {
    if (!businessId) return;

    if (applicationId === 'google-calendar') {
      try {
        // Necesitamos el ID del empleado para el flujo de OAuth (state)
        // Lo buscamos solo en este momento
        const { data: employeeId, error } = await supabase
          .rpc('get_my_business_employee_id_by_business', {
            p_business_id: parseInt(businessId, 10),
          });

        if (error || !employeeId) {
          throw new Error('Employee record not found for this user');
        }

        initiateGoogleOAuth(employeeId);
      } catch (error: any) {
        console.error('Error initiating OAuth:', error);
        toast.error(error.message || 'Error connecting application');
      }
    } else {
      toast.info(`Connecting to ${applicationId}...`);
    }
  };

  const handleDisconnectApplication = async (applicationId: string) => {
    try {
      if (!businessId) return;

      // Eliminar la conexión
      // RLS garantiza que solo podamos borrar nuestras propias conexiones
      const { error } = await supabase
        .from('business_employee_oauth_connections')
        .delete()
        .eq('business_id', parseInt(businessId, 10))
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

    // Connections state
    connections,

    // Handlers
    handleConnectApplication,
    handleDisconnectApplication,
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

