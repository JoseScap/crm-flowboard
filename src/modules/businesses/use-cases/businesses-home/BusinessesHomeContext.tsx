import supabase from "@/modules/common/lib/supabase";
import { Tables, TablesInsert, TablesUpdate } from "@/modules/types/supabase.schema";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface BusinessesHomeContextType {
  // Loading state
  loadingData: boolean;

  // Business states
  businesses: Tables<'businesses'>[];
  isCreateBusinessDialogOpen: boolean;
  newBusinessFormData: Omit<TablesInsert<'businesses'>, 'owner_id'>;
  isEditBusinessDialogOpen: boolean;
  editBusinessFormData: TablesUpdate<'businesses'>;
  editingBusiness: Tables<'businesses'> | null;

  // Handlers
  handleCreateBusiness: () => void;
  handleChangeNewBusinessFormData: <T extends keyof Omit<TablesInsert<'businesses'>, 'owner_id'>>(field: T, value: Omit<TablesInsert<'businesses'>, 'owner_id'>[T]) => void;
  handleCancelCreateBusiness: () => void;
  handleSaveBusiness: () => Promise<void>;
  handleOpenEditBusiness: (business: Tables<'businesses'>) => void;
  handleCloseEditBusiness: () => void;
  handleChangeEditBusinessFormData: <T extends keyof TablesUpdate<'businesses'>>(field: T, value: TablesUpdate<'businesses'>[T]) => void;
  handleUpdateBusiness: () => Promise<void>;
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
        toast.error('Error updating business');
      } else {
        toast.success('Business updated successfully');
      }

      // Refetch businesses
      await getData();
    } catch (error) {
      console.error('Error updating business:', error);
      toast.error('Error updating business');
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

