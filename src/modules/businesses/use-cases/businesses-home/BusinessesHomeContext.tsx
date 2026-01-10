import supabase from "@/modules/common/lib/supabase";
import { Tables, TablesInsert, TablesUpdate, Database } from "@/modules/types/supabase.schema";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface NewBusinessFormData extends Pick<TablesInsert<'businesses'>, 'name' | 'description' | 'address' | 'phone' | 'email'> {
  owner_first_name: string;
  owner_last_name: string;
}

export type BusinessesWithCounts = Tables<'businesses'> & {
  pipelines_count: number;
  leads_count: number;
}

interface BusinessesHomeContextType {
  // Loading state
  loadingData: boolean;

  // Business states
  businesses: BusinessesWithCounts[];
  isCreateBusinessDialogOpen: boolean;
  newBusinessFormData: NewBusinessFormData;
  isEditBusinessDialogOpen: boolean;
  editBusinessFormData: TablesUpdate<'businesses'>;
  editingBusiness: Tables<'businesses'> | null;

  // Handlers
  handleCreateBusiness: () => void;
  handleChangeNewBusinessFormData: <T extends keyof NewBusinessFormData>(field: T, value: NewBusinessFormData[T]) => void;
  handleCancelCreateBusiness: () => void;
  handleSaveBusiness: () => Promise<void>;
  handleOpenEditBusiness: (business: Tables<'businesses'>) => void;
  handleCloseEditBusiness: () => void;
  handleChangeEditBusinessFormData: <T extends keyof TablesUpdate<'businesses'>>(field: T, value: TablesUpdate<'businesses'>[T]) => void;
  handleUpdateBusiness: () => Promise<void>;
}

const BusinessesHomeContext = createContext<BusinessesHomeContextType | undefined>(undefined);

const defaultNewBusinessFormData: NewBusinessFormData = {
  name: '',
  description: null,
  address: null,
  phone: null,
  email: null,
  owner_first_name: '',
  owner_last_name: '',
}

export function BusinessesHomeProvider({ children }: { children: ReactNode }) {
  // Loading state
  const [loadingData, setLoadingData] = useState(true);

  // Business states
  const [businesses, setBusinesses] = useState<BusinessesWithCounts[]>([]);
  const [isCreateBusinessDialogOpen, setIsCreateBusinessDialogOpen] = useState(false);
  const [newBusinessFormData, setNewBusinessFormData] = useState<NewBusinessFormData>(defaultNewBusinessFormData);
  const [isEditBusinessDialogOpen, setIsEditBusinessDialogOpen] = useState(false);
  const [editBusinessFormData, setEditBusinessFormData] = useState<TablesUpdate<'businesses'>>({});
  const [editingBusiness, setEditingBusiness] = useState<Tables<'businesses'> | null>(null);

  const getData = async () => {
    try {
      setLoadingData(true);
      
      // Get businesses (RLS policies will filter based on business_users)
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: businessesWithLeadsCount, error: businessesWithLeadsCountError } = await supabase
        .rpc('get_businesses_with_leads_count_where_user_is_member')
        .select('*');

      const { data: businessesWithPipelinesCount, error: businessesWithPipelinesCountError } = await supabase
        .rpc('get_businesses_with_pipelines_count_where_user_is_member')
        .select('*');

      const businessesWithCountsData: BusinessesWithCounts[] = [];

      if (data) {
        for (const business of data) {
          businessesWithCountsData.push({
            ...business,
            pipelines_count: businessesWithPipelinesCount.find((b) => b.business_id === business.id)?.pipelines_count || 0,
            leads_count: businessesWithLeadsCount.find((b) => b.business_id === business.id)?.leads_count || 0,
          });
        }
      }
      
      if (error) {
        toast.error('Error al obtener los negocios');
      } else if (data) {
        setBusinesses(businessesWithCountsData);
      }
    } catch (error) {
      toast.error('Error al obtener los negocios');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Handlers
  const handleCreateBusiness = () => {
    setNewBusinessFormData(defaultNewBusinessFormData);
    setIsCreateBusinessDialogOpen(true);
  };

  const handleChangeNewBusinessFormData = <T extends keyof NewBusinessFormData>(field: T, value: NewBusinessFormData[T]) => {
    setNewBusinessFormData({ ...newBusinessFormData, [field]: value });
  };

  const handleCancelCreateBusiness = () => {
    setIsCreateBusinessDialogOpen(false);
    setNewBusinessFormData(defaultNewBusinessFormData);
  };

  const handleSaveBusiness = async () => {
    // Validation
    if (!newBusinessFormData.name.trim()) {
      toast.error('El nombre del negocio es obligatorio');
      return;
    }
    if (!newBusinessFormData.owner_first_name.trim()) {
      toast.error('El nombre del dueño es obligatorio');
      return;
    }
    if (!newBusinessFormData.owner_last_name.trim()) {
      toast.error('El apellido del dueño es obligatorio');
      return;
    }

    setIsCreateBusinessDialogOpen(false);
    setLoadingData(true);
    
    try {
      // Use the RPC function instead of direct INSERT
      const { data, error } = await supabase.rpc('create_new_business', {
        p_business_name: newBusinessFormData.name.trim(),
        p_business_description: newBusinessFormData.description?.trim() ?? null,
        p_business_address: newBusinessFormData.address?.trim() ?? null,
        p_business_phone: newBusinessFormData.phone?.trim() ?? null,
        p_business_email: newBusinessFormData.email?.trim() ?? null,
        p_owner_first_name: newBusinessFormData.owner_first_name.trim(),
        p_owner_last_name: newBusinessFormData.owner_last_name.trim(),
      });
      
      if (error) {
        toast.error('Error al crear el negocio');
      } else {
        toast.success('Negocio creado con éxito');
        setNewBusinessFormData(defaultNewBusinessFormData);
      }
      
      // Refetch businesses (whether it failed or succeeded)
      await getData();
    } catch (error) {
      toast.error('Error al crear el negocio');
      // Still refetch to ensure UI is in sync
      await getData();
    }
  };

  const handleOpenEditBusiness = (business: Tables<'businesses'>) => {
    setEditingBusiness(business);
    setEditBusinessFormData({
      id: business.id,
      name: business.name,
      description: business.description,
      address: business.address,
      phone: business.phone,
      email: business.email,
    });
    setIsEditBusinessDialogOpen(true);
  };

  const handleCloseEditBusiness = () => {
    setIsEditBusinessDialogOpen(false);
    setEditingBusiness(null);
    setEditBusinessFormData({});
  };

  const handleChangeEditBusinessFormData = <T extends keyof TablesUpdate<'businesses'>>(field: T, value: TablesUpdate<'businesses'>[T]) => {
    setEditBusinessFormData({ ...editBusinessFormData, [field]: value });
  };

  const handleUpdateBusiness = async () => {
    if (!editingBusiness || !editBusinessFormData.id) return;

    setIsEditBusinessDialogOpen(false);
    setLoadingData(true);

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: editBusinessFormData.name?.trim() || editingBusiness.name,
          description: editBusinessFormData.description?.trim() || null,
          address: editBusinessFormData.address?.trim() || null,
          phone: editBusinessFormData.phone?.trim() || null,
          email: editBusinessFormData.email?.trim() || null,
        })
        .eq('id', editingBusiness.id);

      if (error) {
        toast.error('Error al actualizar el negocio');
      } else {
        toast.success('Negocio actualizado con éxito');
      }

      // Refetch businesses
      await getData();
    } catch (error) {
      toast.error('Error al actualizar el negocio');
      await getData();
    } finally {
      setLoadingData(false);
      setEditingBusiness(null);
      setEditBusinessFormData({});
    }
  };

  const value: BusinessesHomeContextType = {
    // Loading state
    loadingData,

    // Business states
    businesses,
    isCreateBusinessDialogOpen,
    newBusinessFormData,
    isEditBusinessDialogOpen,
    editBusinessFormData,
    editingBusiness,

    // Handlers
    handleCreateBusiness,
    handleChangeNewBusinessFormData,
    handleCancelCreateBusiness,
    handleSaveBusiness,
    handleOpenEditBusiness,
    handleCloseEditBusiness,
    handleChangeEditBusinessFormData,
    handleUpdateBusiness,
  };

  return (
    <BusinessesHomeContext.Provider value={value}>
      {children}
    </BusinessesHomeContext.Provider>
  );
}

export function useBusinessesHomeContext() {
  const context = useContext(BusinessesHomeContext);
  if (!context) {
    throw new Error('useBusinessesHomeContext must be used within a BusinessesHomeProvider');
  }
  return context;
}

