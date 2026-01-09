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
        toast.error('Error al obtener las conexiones');
      } else {
        setConnections(connectionsData || []);
      }
    } catch (error) {
      toast.error('Error al obtener las aplicaciones');
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
        toast.error('Error al iniciar la autenticación OAuth');
      }
    } else {
      toast.info(`Conectando a ${applicationId}...`);
    }
  };

  const handleDisconnectApplication = async (applicationId: string) => {
    try {
      if (!businessId) return;

      const { data: employeeId, error: employeeError } = await supabase
          .rpc('get_my_business_employee_id_by_business', {
            p_business_id: parseInt(businessId, 10),
          });

      // Eliminar la conexión
      // RLS garantiza que solo podamos borrar nuestras propias conexiones
      const { error } = await supabase
        .from('business_employee_oauth_connections')
        .delete()
        .eq('business_id', parseInt(businessId, 10))
        .eq('business_employee_id', employeeId);

      if (error) {
        throw error;
      }

      // Refrescar los datos
      await getData();

      toast.success('Aplicación desconectada con éxito');
    } catch (error: any) {
      toast.error('Error al desconectar la aplicación');
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

