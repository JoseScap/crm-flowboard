import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo, Dispatch, SetStateAction } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '@/modules/common/lib/supabase';
import { toast } from 'sonner';
import { Tables, TablesInsert } from '@/modules/types/supabase.schema';

export type SaleItem = Omit<TablesInsert<'sale_items'>, 'business_id' | 'sale_id'> & { 
  stock: number; // To check against current stock
};

interface NewSaleContextType {
  loading: boolean;
  saving: boolean;
  
  // Sale state
  selectedItems: SaleItem[];
  addItem: (product: Tables<'products'>) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  
  // Available products (for modal)
  availableProducts: Tables<'products'>[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  isAddProductModalOpen: boolean;
  setIsAddProductModalOpen: Dispatch<SetStateAction<boolean>>;
  
  // Calculations
  subtotal: number;
  isTaxEnabled: boolean;
  setIsTaxEnabled: Dispatch<SetStateAction<boolean>>;
  taxRate: number;
  setTaxRate: Dispatch<SetStateAction<number>>;
  tax: number;
  total: number;
  
  // Actions
  handleSaveSale: () => Promise<void>;
}

const NewSaleContext = createContext<NewSaleContextType | undefined>(undefined);

export function NewSaleProvider({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const businessId = id ? parseInt(id, 10) : null;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Tables<'products'>[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [isTaxEnabled, setIsTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState(15);

  // Fetch employee ID
  useEffect(() => {
    const fetchEmployeeId = async () => {
      if (!businessId) return;
      try {
        const { data, error } = await supabase.rpc('get_my_business_employee_id_by_business', { 
          p_business_id: businessId 
        });
        if (error) throw error;
        setEmployeeId(data as number);
      } catch (error) {
        toast.error('Error al obtener el ID del empleado');
      }
    };
    fetchEmployeeId();
  }, [businessId]);

  // Fetch available products
  const fetchProducts = useCallback(async (signal?: AbortSignal) => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .gt('stock', 0);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(7).abortSignal(signal!);
      
      if (error) {
        if (error.message === 'Fetch is aborted' || error.name === 'AbortError') return;
        throw error;
      }
      
      setAvailableProducts(data || []);
    } catch (error: any) {
      if (error.name.includes('AbortError')) return;
      toast.error('Error al obtener los productos');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [businessId, searchTerm]);

  // Initial fetch and fetch on search
  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isAddProductModalOpen) {
      setSearchTerm('');
    }
  }, [isAddProductModalOpen]);

  const addItem = (product: Tables<'products'>) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: 1,
        stock: product.stock
      }];
    });
    toast.success(`${product.name} agregado a la venta`);
  };

  const removeItem = (productId: number) => {
    setSelectedItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setSelectedItems(prev => prev.map(item => 
      item.product_id === productId ? { ...item, quantity } : item
    ));
  };

  const subtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  }, [selectedItems]);

  const tax = useMemo(() => isTaxEnabled ? subtotal * (taxRate / 100) : 0, [subtotal, isTaxEnabled, taxRate]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const handleSaveSale = async () => {
    if (selectedItems.length === 0) {
      toast.error('Agregue al menos un producto a la venta');
      return;
    }

    if (!businessId || !employeeId) {
      toast.error('No se puede completar la venta: falta información del negocio o del empleado');
      return;
    }

    try {
      setSaving(true);

      const { data: saleId, error: saleError } = await supabase.rpc('process_new_sale', {
        p_business_id: businessId,
        p_business_employee_id: employeeId,
        p_subtotal: subtotal,
        p_applied_tax: isTaxEnabled ? taxRate : 0,
        p_total: total,
        p_items: selectedItems,
        p_lead_id: null,
      });

      if (saleError) throw saleError;

      toast.success(`Venta creada con éxito`);
      navigate(`/user/businesses/${businessId}/sales`);
    } catch (error: any) {
      toast.error('Error al guardar la venta');
    } finally {
      setSaving(false);
    }
  };

  const value: NewSaleContextType = {
    loading,
    saving,
    selectedItems,
    addItem,
    removeItem,
    updateQuantity,
    availableProducts,
    searchTerm,
    setSearchTerm,
    isAddProductModalOpen,
    setIsAddProductModalOpen,
    subtotal,
    isTaxEnabled,
    setIsTaxEnabled,
    taxRate,
    setTaxRate,
    tax,
    total,
    handleSaveSale
  };

  return (
    <NewSaleContext.Provider value={value}>
      {children}
    </NewSaleContext.Provider>
  );
}

export function useNewSaleContext() {
  const context = useContext(NewSaleContext);
  if (!context) {
    throw new Error('useNewSaleContext must be used within a NewSaleProvider');
  }
  return context;
}
