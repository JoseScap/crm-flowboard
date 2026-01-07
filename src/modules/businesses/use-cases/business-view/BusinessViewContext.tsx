import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import supabase from '@/modules/common/lib/supabase';
import { Tables } from '@/modules/types/supabase.schema';

export interface BusinessStats {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  totalPipelines: number;
  openSales: number;
  closedSales: number;
}

interface BusinessViewContextType {
  // Business state
  business: Tables<'businesses'> | null;
  loading: boolean;
  
  // Stats state
  stats: BusinessStats;
  
  // Employees state
  employees: Tables<'business_employees'>[];
  loadingEmployees: boolean;
  
  // Dialog state
  isAddEmployeeDialogOpen: boolean;
  newEmployeeEmail: string;
  newEmployeeFirstName: string;
  newEmployeeLastName: string;
  addingEmployee: boolean;
  togglingStatus: boolean;
  
  // Handlers
  handleOpenAddEmployeeDialog: () => void;
  handleCloseAddEmployeeDialog: () => void;
  handleAddEmployee: () => Promise<void>;
  setNewEmployeeEmail: (email: string) => void;
  setNewEmployeeFirstName: (firstName: string) => void;
  setNewEmployeeLastName: (lastName: string) => void;
  handleToggleEmployeeStatus: (employee: Tables<'business_employees'>) => Promise<void>;
}

const BusinessViewContext = createContext<BusinessViewContextType | undefined>(undefined);

export function BusinessViewProvider({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Tables<'businesses'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Tables<'business_employees'>[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeeFirstName, setNewEmployeeFirstName] = useState('');
  const [newEmployeeLastName, setNewEmployeeLastName] = useState('');
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [stats, setStats] = useState<BusinessStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalPipelines: 0,
    openSales: 0,
    closedSales: 0,
  });

  const fetchEmployees = useCallback(async () => {
    if (!id) return;
    
    try {
      const businessId = parseInt(id || '0', 10);
      if (isNaN(businessId)) return;

      setLoadingEmployees(true);
      const { data: employeesData, error: employeesError } = await supabase
        .from('business_employees')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        toast.error('Error fetching employees');
      } else if (employeesData) {
        setEmployees(employeesData);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Error fetching employees');
    } finally {
      setLoadingEmployees(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchBusinessData = async () => {
      try {
        const businessId = parseInt(id || '0', 10);
        if (isNaN(businessId)) {
          throw new Error('Invalid business ID');
        }

        // Fetch business
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .single();

        if (businessError) throw businessError;
        setBusiness(businessData);

        // Fetch statistics
        const salesResponse = await supabase
          .from('sales')
          .select('total, is_open')
          .eq('business_id', businessId);

        const productsResponse = await supabase
          .from('products')
          .select('id')
          .eq('business_id', businessId);

        const pipelinesResponse = await supabase
          .from('pipelines')
          .select('id')
          .eq('business_id', businessId);

        // Calculate stats
        const sales = (salesResponse.data) || [];
        const totalRevenue = sales.reduce((sum: number, sale) => sum + (Number(sale.total) || 0), 0);
        const openSales = sales.filter((sale) => sale.is_open === true).length;
        const closedSales = sales.filter((sale) => sale.is_open === false).length;

        setStats({
          totalSales: sales.length,
          totalRevenue,
          totalProducts: (productsResponse.data as any[])?.length || 0,
          totalPipelines: (pipelinesResponse.data as any[])?.length || 0,
          openSales,
          closedSales,
        });

        // Fetch business employees
        await fetchEmployees();
      } catch (error) {
        console.error('Error fetching business data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [id, fetchEmployees]);

  const handleOpenAddEmployeeDialog = () => {
    setIsAddEmployeeDialogOpen(true);
  };

  const handleCloseAddEmployeeDialog = () => {
    setIsAddEmployeeDialogOpen(false);
    setNewEmployeeEmail('');
    setNewEmployeeFirstName('');
    setNewEmployeeLastName('');
  };

  const handleAddEmployee = async () => {
    if (!id || !newEmployeeEmail.trim() || !newEmployeeFirstName.trim() || !newEmployeeLastName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const businessId = parseInt(id || '0', 10);
    if (isNaN(businessId)) {
      toast.error('Invalid business ID');
      return;
    }

    try {
      setAddingEmployee(true);
      const { data, error } = await supabase.rpc('add_business_employee', {
        p_business_id: businessId,
        p_user_email: newEmployeeEmail.trim(),
        p_first_name: newEmployeeFirstName.trim(),
        p_last_name: newEmployeeLastName.trim(),
      });

      if (error) {
        toast.error(error.message || 'Error adding employee');
        return;
      }

      toast.success('Employee added successfully');
      setIsAddEmployeeDialogOpen(false);
      setNewEmployeeEmail('');
      setNewEmployeeFirstName('');
      setNewEmployeeLastName('');
      await fetchEmployees();
    } catch (error: any) {
      console.error('Error adding employee:', error);
      toast.error(error.message || 'Error adding employee');
    } finally {
      setAddingEmployee(false);
    }
  };

  const handleToggleEmployeeStatus = async (employee: Tables<'business_employees'>) => {
    if (!id) return;

    const businessId = parseInt(id || '0', 10);
    if (isNaN(businessId)) return;

    try {
      setTogglingStatus(true);
      const rpcName = employee.is_active ? 'deactivate_business_employee' : 'activate_business_employee';
      
      const { error } = await supabase.rpc(rpcName, {
        p_business_id: businessId,
        p_user_id: employee.user_id,
      });

      if (error) {
        toast.error(error.message || `Error ${employee.is_active ? 'deactivating' : 'activating'} employee`);
        return;
      }

      toast.success(`Employee ${employee.is_active ? 'deactivated' : 'activated'} successfully`);
      await fetchEmployees();
    } catch (error: any) {
      console.error(`Error toggling employee status:`, error);
      toast.error(error.message || 'Error updating employee status');
    } finally {
      setTogglingStatus(false);
    }
  };

  const value: BusinessViewContextType = {
    business,
    loading,
    stats,
    employees,
    loadingEmployees,
    isAddEmployeeDialogOpen,
    newEmployeeEmail,
    newEmployeeFirstName,
    newEmployeeLastName,
    addingEmployee,
    togglingStatus,
    handleOpenAddEmployeeDialog,
    handleCloseAddEmployeeDialog,
    handleAddEmployee,
    setNewEmployeeEmail,
    setNewEmployeeFirstName,
    setNewEmployeeLastName,
    handleToggleEmployeeStatus,
  };

  return (
    <BusinessViewContext.Provider value={value}>
      {children}
    </BusinessViewContext.Provider>
  );
}

export function useBusinessViewContext() {
  const context = useContext(BusinessViewContext);
  if (!context) {
    throw new Error('useBusinessViewContext must be used within a BusinessViewProvider');
  }
  return context;
}

