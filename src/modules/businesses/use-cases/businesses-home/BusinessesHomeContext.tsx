import supabase from "@/modules/common/lib/supabase";
import { Tables, TablesInsert } from "@/modules/types/supabase.schema";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface BusinessesHomeContextType {
  // Loading state
  loadingData: boolean;

  // Business states
  businesses: Tables<'businesses'>[];
  isCreateBusinessDialogOpen: boolean;
  newBusinessFormData: Omit<TablesInsert<'businesses'>, 'owner_id'>;

  // Handlers
  handleCreateBusiness: () => void;
  handleChangeNewBusinessFormData: <T extends keyof Omit<TablesInsert<'businesses'>, 'owner_id'>>(field: T, value: Omit<TablesInsert<'businesses'>, 'owner_id'>[T]) => void;
  handleCancelCreateBusiness: () => void;
  handleSaveBusiness: () => Promise<void>;
}

const BusinessesHomeContext = createContext<BusinessesHomeContextType | undefined>(undefined);

const defaultNewBusinessFormData: Omit<TablesInsert<'businesses'>, 'owner_id'> = {
  name: '',
  description: null,
  address: null,
  phone: null,
  email: null,
}

export function BusinessesHomeProvider({ children }: { children: ReactNode }) {
  // Loading state
  const [loadingData, setLoadingData] = useState(true);

  // Business states
  const [businesses, setBusinesses] = useState<Tables<'businesses'>[]>([]);
  const [isCreateBusinessDialogOpen, setIsCreateBusinessDialogOpen] = useState(false);
  const [newBusinessFormData, setNewBusinessFormData] = useState<Omit<TablesInsert<'businesses'>, 'owner_id'>>(defaultNewBusinessFormData);

  const getData = async () => {
    try {
      setLoadingData(true);
      
      // Get businesses (RLS policies will filter based on business_users)
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error fetching businesses');
      } else if (data) {
        setBusinesses(data);
      }
    } catch (error) {
      toast.error('Error fetching businesses');
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

  const handleChangeNewBusinessFormData = <T extends keyof Omit<TablesInsert<'businesses'>, 'owner_id'>>(field: T, value: Omit<TablesInsert<'businesses'>, 'owner_id'>[T]) => {
    setNewBusinessFormData({ ...newBusinessFormData, [field]: value });
  };

  const handleCancelCreateBusiness = () => {
    setIsCreateBusinessDialogOpen(false);
    setNewBusinessFormData(defaultNewBusinessFormData);
  };

  const handleSaveBusiness = async () => {
    setIsCreateBusinessDialogOpen(false);
    setNewBusinessFormData(defaultNewBusinessFormData);
    setLoadingData(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('User not authenticated');
        setLoadingData(false);
        return;
      }

      // Insert into Supabase (owner_id will be set automatically via trigger or we set it here)
      const { error } = await supabase
        .from('businesses')
        .insert([
          {
            name: newBusinessFormData.name.trim(),
            description: newBusinessFormData.description?.trim() || null,
            address: newBusinessFormData.address?.trim() || null,
            phone: newBusinessFormData.phone?.trim() || null,
            email: newBusinessFormData.email?.trim() || null,
            owner_id: user.id,
          },
        ]);
      
      if (error) {
        toast.error('Error creating business');
      } else {
        toast.success('Business created successfully');
      }
      
      // Refetch businesses (whether it failed or succeeded)
      await getData();
    } catch (error) {
      console.error('Error creating business:', error);
      toast.error('Error creating business');
      // Still refetch to ensure UI is in sync
      await getData();
    }
  };

  const value: BusinessesHomeContextType = {
    // Loading state
    loadingData,

    // Business states
    businesses,
    isCreateBusinessDialogOpen,
    newBusinessFormData,

    // Handlers
    handleCreateBusiness,
    handleChangeNewBusinessFormData,
    handleCancelCreateBusiness,
    handleSaveBusiness,
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

