import { createContext, ReactNode, useContext, useState, useEffect, useCallback, useMemo, Dispatch, SetStateAction } from "react";
import { useParams } from 'react-router-dom';
import supabase from '@/modules/common/lib/supabase';
import { toast } from 'sonner';
import { Tables } from '@/modules/types/supabase.schema';

export type SaleWithDetails = Tables<'sales'> & {
  business_employees: Pick<Tables<'business_employees'>, 'first_name' | 'last_name'> | null;
};

interface SalesHomeContextType {
  loadingData: boolean;
  sales: SaleWithDetails[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  
  // Pagination states
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: Dispatch<SetStateAction<number>>;
  totalSales: number;
  paginationData: {
    totalPages: number;
    startIndex: number;
    endIndex: number;
  }

  // Sort by
  sortSalesBy: keyof Tables<'sales'>;
  sortSalesAscending: boolean;
  handleChangeSortSalesBy: (field: keyof Tables<'sales'>) => void;

  // Selection
  selectedSale: SaleWithDetails | null;
  setSelectedSale: Dispatch<SetStateAction<SaleWithDetails | null>>;
  isDetailsDialogOpen: boolean;
  setIsDetailsDialogOpen: Dispatch<SetStateAction<boolean>>;
  saleSnapshots: Tables<'sale_items'>[];
  loadingSnapshots: boolean;
  
  refreshData: () => Promise<void>;
}

const SalesHomeContext = createContext<SalesHomeContextType | undefined>(undefined);

export function SalesHomeProvider({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const businessId = id ? parseInt(id, 10) : null;

  const [loadingData, setLoadingData] = useState(true);
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalSales, setTotalSales] = useState(0);

  // Sort by
  const [sortSalesBy, setSortSalesBy] = useState<keyof Tables<'sales'>>('created_at');
  const [sortSalesAscending, setSortSalesAscending] = useState(false);

  // Selection
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [saleSnapshots, setSaleSnapshots] = useState<Tables<'sale_items'>[]>([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);

  const fetchSnapshots = useCallback(async (saleId: number) => {
    try {
      setLoadingSnapshots(true);
      const { data, error } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', saleId);
      
      if (error) throw error;
      setSaleSnapshots(data || []);
    } catch (error) {
      console.error('Error fetching snapshots:', error);
      toast.error('Error loading sale details');
    } finally {
      setLoadingSnapshots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSale && isDetailsDialogOpen) {
      fetchSnapshots(selectedSale.id);
    } else if (!isDetailsDialogOpen) {
      setSaleSnapshots([]);
    }
  }, [selectedSale, isDetailsDialogOpen, fetchSnapshots]);

  const getData = useCallback(async () => {
    if (!businessId) {
      setLoadingData(false);
      return;
    }

    try {
      setLoadingData(true);
      
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage - 1;

      // Base query for counting
      let countQuery = supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId);

      if (searchTerm && !isNaN(Number(searchTerm))) {
        countQuery = countQuery.eq('order_number', Number(searchTerm));
      }

      const { count, error: countError } = await countQuery;

      if (countError) throw countError;
      setTotalSales(count || 0);

      // Main query
      let query = supabase
        .from('sales')
        .select('*, business_employees(first_name, last_name)')
        .eq('business_id', businessId)
        .order(sortSalesBy, { ascending: sortSalesAscending })
        .range(startIndex, endIndex);

      if (searchTerm && !isNaN(Number(searchTerm))) {
        query = query.eq('order_number', Number(searchTerm));
      }

      const { data, error } = await query;

      if (error) throw error;
      setSales(data as SaleWithDetails[]);
    } catch (error) {
      console.error('Error loading sales:', error);
      toast.error('Error loading sales history');
    } finally {
      setLoadingData(false);
    }
  }, [businessId, currentPage, itemsPerPage, searchTerm, sortSalesBy, sortSalesAscending]);

  useEffect(() => {
    getData();
  }, [getData]);

  const paginationData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalSales);
    return {
      totalPages: Math.ceil(totalSales / itemsPerPage),
      startIndex,
      endIndex,
    };
  }, [totalSales, itemsPerPage, currentPage]);

  const handleChangeSortSalesBy = (field: keyof Tables<'sales'>) => {
    if (field !== sortSalesBy) {
      setSortSalesBy(field);
      setSortSalesAscending(true);
      return;
    }

    if (field === sortSalesBy && sortSalesAscending) {
      setSortSalesAscending(false);
      return;
    }

    setSortSalesBy('created_at');
    setSortSalesAscending(false);
  };

  const value: SalesHomeContextType = {
    loadingData,
    sales,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalSales,
    paginationData,
    sortSalesBy,
    sortSalesAscending,
    handleChangeSortSalesBy,
    selectedSale,
    setSelectedSale,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    saleSnapshots,
    loadingSnapshots,
    refreshData: getData,
  };

  return (
    <SalesHomeContext.Provider value={value}>
      {children}
    </SalesHomeContext.Provider>
  );
}

export function useSalesHomeContext() {
  const context = useContext(SalesHomeContext);
  if (!context) {
    throw new Error('useSalesHomeContext must be used within a SalesHomeProvider');
  }
  return context;
}

