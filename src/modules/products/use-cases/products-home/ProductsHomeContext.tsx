import { createContext, useContext, useState, useEffect, useCallback, ReactNode, Dispatch, SetStateAction, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '@/modules/common/lib/supabase';
import { toast } from 'sonner';
import { Tables, TablesInsert, TablesUpdate } from '@/modules/types/supabase.schema';

type StockStatus = {
  label: string;
  variant: 'default' | 'destructive' | 'warning';
}

// Define the context type
interface ProductsHomeContextType {
  // Loading state
  loadingData: boolean;

  // Product states
  products: (Tables<'products'> & { product_categories: Pick<Tables<'product_categories'>, 'name'> | null })[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  isCreateProductDialogOpen: boolean;
  setIsCreateProductDialogOpen: Dispatch<SetStateAction<boolean>>;
  newProductFormData: TablesInsert<'products'>;
  setNewProductFormData: Dispatch<SetStateAction<TablesInsert<'products'>>>;
  editingProductFormData: TablesUpdate<'products'> | null;
  setEditingProductFormData: Dispatch<SetStateAction<TablesUpdate<'products'> | null>>;
  isEditProductDialogOpen: boolean;
  setIsEditProductDialogOpen: Dispatch<SetStateAction<boolean>>;
  productToToggleStatus: Tables<'products'> | null;
  isToggleStatusDialogOpen: boolean;
  setIsToggleStatusDialogOpen: Dispatch<SetStateAction<boolean>>;
  
  // Category states
  showCategories: boolean;
  setShowCategories: Dispatch<SetStateAction<boolean>>;
  categories: Tables<'product_categories'>[];
  isAddingCategory: boolean;
  newCategoryName: string;
  setNewCategoryName: Dispatch<SetStateAction<string>>;
  isDeleteCategoryDialogOpen: boolean;
  setIsDeleteCategoryDialogOpen: Dispatch<SetStateAction<boolean>>;
  categoryToDelete: Tables<'product_categories'> | null;
  editingCategory: TablesUpdate<'product_categories'> | null;
  editingCategoryName: string;
  setEditingCategoryName: Dispatch<SetStateAction<string>>;
  
  // Pagination states
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: Dispatch<SetStateAction<number>>;
  totalProducts: number;
  paginationData: {
    totalPages: number;
    startIndex: number;
    endIndex: number;
  }
  
  // Stock filter states
  lowStockCount: number;
  showLowStockOnly: boolean;
  outOfStockCount: number;
  showOutOfStockOnly: boolean;
  
  // Handlers
  handleAddCategory: () => void;
  handleCancelAddCategory: () => void;
  handleSaveCategory: () => Promise<void>;
  handleDeleteCategory: (category: Tables<'product_categories'>) => void;
  handleConfirmDeleteCategory: () => Promise<void>;
  handleCancelDeleteCategory: () => void;
  handleEditCategory: (category: TablesUpdate<'product_categories'>) => void;
  handleCancelEditCategory: () => void;
  handleSaveEditCategory: () => Promise<void>;
  getStockStatus: (stock: number, minStock: number | null) => StockStatus;
  handleAddProduct: () => void;
  handleSaveAddProduct: () => Promise<void>;
  handleCancelAddProduct: () => void;
  toggleActiveStatus: (product: Tables<'products'>) => void;
  handleConfirmToggleStatus: () => Promise<void>;
  handleCancelToggleStatus: () => void;
  handleEditProduct: (product: TablesUpdate<'products'>) => void;
  handleCancelEditProduct: () => void;
  handleSaveEditProduct: () => Promise<void>;
  handleViewLowStockProducts: () => void;
  handleViewOutOfStockProducts: () => void;
  handleViewAllProducts: () => void;
}

const ProductsHomeContext = createContext<ProductsHomeContextType | undefined>(undefined);

const defaultProductFormData: TablesInsert<'products'> = {
  name: '',
  price: 0,
  sku: '',
  stock: 0,
  product_category_id: null,
  minimum_stock: 0,
  business_id: 0, // Will be set from route params
}

export function ProductsHomeProvider({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const businessId = id ? parseInt(id, 10) : null;
  
  // Loading state
  const [loadingData, setLoadingData] = useState(true);
  
  // Product states
  const [products, setProducts] = useState<(Tables<'products'> & { product_categories: Pick<Tables<'product_categories'>, 'name'> | null })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateProductDialogOpen, setIsCreateProductDialogOpen] = useState(false);
  const [newProductFormData, setNewProductFormData] = useState<TablesInsert<'products'>>(defaultProductFormData);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [editingProductFormData, setEditingProductFormData] = useState<TablesUpdate<'products'> | null>(null);
  const [productToToggleStatus, setProductToToggleStatus] = useState<Tables<'products'> | null>(null);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] = useState(false);

  // Category states
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState<Tables<'product_categories'>[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Tables<'product_categories'> | null>(null);
  const [editingCategory, setEditingCategory] = useState<TablesUpdate<'product_categories'> | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalProducts, setTotalProducts] = useState(0);

  // Stock filter states
  const [lowStockCount, setLowStockCount] = useState(0);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);
  
  const getData = useCallback(async () => {
    try {
      setLoadingData(true);
      
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage - 1;
      
      // Determine which view to use
      const useLowStock = showLowStockOnly && !showOutOfStockOnly;
      const useOutOfStock = showOutOfStockOnly && !showLowStockOnly;
      
      if (!businessId) {
        setLoadingData(false);
        return;
      }

      // Fetch categories and products in parallel
      const [
        categoriesResult,
        productsResult,
        lowStockProductsResult,
        outOfStockProductsResult,
        productsCountResult,
        lowStockCountResult,
        outOfStockCountResult
      ] = await Promise.all([
        supabase
          .from('product_categories')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false }),
         supabase
           .from('products')
           .select('*, product_categories (name)')
           .eq('business_id', businessId)
           .order('created_at', { ascending: false })
           .range(startIndex, endIndex),
        supabase.rpc('get_products_low_stock', { p_business_id: businessId }),
        supabase.rpc('get_products_out_of_stock', { p_business_id: businessId }),
        supabase
          .from('products')
          .select('count', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .single(),
        supabase.rpc('get_products_low_stock_total', { p_business_id: businessId }),
        supabase.rpc('get_products_out_of_stock_total', { p_business_id: businessId }),
      ]);

      if (categoriesResult.error) {
        toast.error('Error loading categories');
      }

      if (productsResult.error) {
        toast.error('Error loading products');
      }

      if (lowStockProductsResult.error) {
        console.error('Error loading low stock products:', lowStockProductsResult.error);
        toast.error('Error loading low stock products');
      }

      if (outOfStockProductsResult.error) {
        console.error('Error loading out of stock products:', outOfStockProductsResult.error);
        toast.error('Error loading out of stock products');
      }

      if (lowStockCountResult.error) {
        console.error('Error loading low stock count:', lowStockCountResult.error);
        toast.error('Error loading low stock count');
      }

      if (outOfStockCountResult.error) {
        console.error('Error loading out of stock count:', outOfStockCountResult.error);
        toast.error('Error loading out of stock count');
      }

      // Set total count
      if (productsCountResult.data && productsCountResult.data.count !== null) {
        setTotalProducts(productsCountResult.data.count);
      }

      // Get low stock count from the function (returns BIGINT directly)
      if (lowStockCountResult.data !== null && lowStockCountResult.data !== undefined) {
        const count = Number(lowStockCountResult.data);
        setLowStockCount(count);
        if (useLowStock) {
          setTotalProducts(count);
        }
      }

      // Get out of stock count from the function (returns BIGINT directly)
      if (outOfStockCountResult.data !== null && outOfStockCountResult.data !== undefined) {
        const count = Number(outOfStockCountResult.data);
        setOutOfStockCount(count);
        if (useOutOfStock) {
          setTotalProducts(count);
        }
      }

      // Set categories
      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      // Helper function to map products with categories
      const mapProductsWithCategories = (productsData: any[]) => {
        if (!productsData || !categoriesResult.data) return productsData;
        return productsData.map((product) => ({
          ...product,
          product_categories: product.product_category_id
            ? categoriesResult.data.find((cat) => cat.id === product.product_category_id)
              ? { name: categoriesResult.data.find((cat) => cat.id === product.product_category_id)!.name }
              : null
            : null,
        }));
      };

      // Map products with categories based on view mode
      if (useOutOfStock && outOfStockProductsResult.data) {
        const productsWithCategories = mapProductsWithCategories(outOfStockProductsResult.data);
        // Apply pagination manually since RPC doesn't support range
        const paginatedProducts = productsWithCategories.slice(startIndex, endIndex + 1);
        setProducts(paginatedProducts);
      } else if (useLowStock && lowStockProductsResult.data) {
        const productsWithCategories = mapProductsWithCategories(lowStockProductsResult.data);
        // Apply pagination manually since RPC doesn't support range
        const paginatedProducts = productsWithCategories.slice(startIndex, endIndex + 1);
        setProducts(paginatedProducts);
      } else if (productsResult.data) {
        setProducts(productsResult.data);
      }
    } catch (error) {
      toast.error('Error loading products');
    } finally {
      setLoadingData(false);
    }
  }, [currentPage, itemsPerPage, showLowStockOnly, showOutOfStockOnly, searchTerm, businessId]);

  // Fetch data when dependencies change
  useEffect(() => {
    getData();
  }, [getData]);

  // Set up realtime subscription for products
  useEffect(() => {
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'products',
        },
        () => {
          // Refresh products data when there are changes
          getData();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [getData]);

  const paginationData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
    return {
      totalPages: Math.ceil(totalProducts / itemsPerPage),
      startIndex,
      endIndex,
    };
  }, [totalProducts, itemsPerPage, currentPage]);

  // Reset to page 1 when search term, items per page, or view mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage, showLowStockOnly, showOutOfStockOnly]);

  // Category handlers
  const handleAddCategory = () => {
    setIsAddingCategory(true);
    setNewCategoryName('');
  };

  const handleCancelAddCategory = () => {
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    if (!businessId) {
      toast.error('Business ID is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('product_categories')
        .insert([{ name: newCategoryName.trim(), business_id: businessId }]);

      if (error) {
        toast.error('Error creating category');
      } else {
        toast.success('Category created');
        setIsAddingCategory(false);
        setNewCategoryName('');
        await getData();
      }
    } catch (error) {
      toast.error('Error creating category');
    }
  };

  const handleDeleteCategory = (category: Tables<'product_categories'>) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryDialogOpen(true);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', categoryToDelete.id);

      if (error) {
        console.error('Error deleting category:', error);
        toast.error('Error deleting category');
      } else {
        toast.success('Category deleted');
        setIsDeleteCategoryDialogOpen(false);
        setCategoryToDelete(null);
        await getData();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error deleting category');
    }
  };

  const handleCancelDeleteCategory = () => {
    setIsDeleteCategoryDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleEditCategory = (category: TablesUpdate<'product_categories'>) => {
    setEditingCategory(category);
    setEditingCategoryName(category.name || '');
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const handleSaveEditCategory = async () => {
    if (!editingCategory || !editingCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    if (!editingCategory.id) {
      toast.error('Category ID is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('product_categories')
        .update({ name: editingCategoryName.trim() })
        .eq('id', editingCategory.id);

      if (error) {
        toast.error('Error updating category');
      } else {
        toast.success('Category updated');
        setEditingCategory(null);
        setEditingCategoryName('');
        await getData();
      }
    } catch (error) {
      toast.error('Error updating category');
    }
  };

  const getStockStatus = (stock: number, minStock: number | null): StockStatus => {
    if (stock === 0) return { label: 'Out of Stock', variant: 'destructive' };
    if (minStock !== null && stock <= minStock) return { label: 'Low Stock', variant: 'warning' };
    return { label: 'In Stock', variant: 'default' };
  };

  const handleAddProduct = () => {
    setIsCreateProductDialogOpen(true);
    setNewProductFormData({ ...defaultProductFormData, business_id: businessId || 0 });
  };

  const handleSaveAddProduct = async () => {
    if (!newProductFormData.name || !newProductFormData.sku) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newProductFormData.price === undefined || newProductFormData.price === null || newProductFormData.price < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (newProductFormData.stock === undefined || newProductFormData.stock === null || newProductFormData.stock < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    if (!businessId) {
      toast.error('Business ID is required');
      return;
    }

    try {
      const productData: TablesInsert<'products'> = {
        name: newProductFormData.name,
        sku: newProductFormData.sku,
        product_category_id: newProductFormData.product_category_id || null,
        price: newProductFormData.price || 0,
        stock: newProductFormData.stock || 0,
        minimum_stock: newProductFormData.minimum_stock || null,
        business_id: businessId,
      };

      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) {
        console.error('Error creating product:', error);
        toast.error('Error creating product');
      } else {
        toast.success('Product added');
        setIsCreateProductDialogOpen(false);
        setNewProductFormData({ ...defaultProductFormData, business_id: businessId });
        await getData();
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error creating product');
    }
  };

  const handleCancelAddProduct = () => {
    setIsCreateProductDialogOpen(false);
    setNewProductFormData(defaultProductFormData);
  };

  const toggleActiveStatus = (product: Tables<'products'>) => {
    setProductToToggleStatus(product);
    setIsToggleStatusDialogOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!productToToggleStatus) return;

    try {
      const newStatus = !productToToggleStatus.is_active;
      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus })
        .eq('id', productToToggleStatus.id);

      if (error) {
        console.error('Error updating product status:', error);
        toast.error('Error updating product status');
      } else {
        toast.success(newStatus ? 'Product activated' : 'Product deactivated');
        setIsToggleStatusDialogOpen(false);
        setProductToToggleStatus(null);
        await getData();
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Error updating product status');
    }
  };

  const handleCancelToggleStatus = () => {
    setIsToggleStatusDialogOpen(false);
    setProductToToggleStatus(null);
  };

  const handleEditProduct = (product: TablesUpdate<'products'>) => {
    setEditingProductFormData({
      created_at: product.created_at,
      id: product.id,
      is_active: product.is_active,
      minimum_stock: product.minimum_stock,
      name: product.name,
      price: product.price,
      product_category_id: product.product_category_id,
      sku: product.sku,
      stock: product.stock,
    });
    setIsEditProductDialogOpen(true);
  };

  const handleCancelEditProduct = () => {
    setIsEditProductDialogOpen(false);
    setEditingProductFormData(null);
  };

  const handleSaveEditProduct = async () => {
    if (!editingProductFormData || !editingProductFormData.id) {
      toast.error('No product selected for editing');
      return;
    }

    try {
      const { id, ...updateData } = editingProductFormData;
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        toast.error('Error updating product');
      } else {
        toast.success('Product updated');
        setIsEditProductDialogOpen(false);
        setEditingProductFormData(null);
        await getData();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product');
    }
  };

  // View mode handlers
  const handleViewLowStockProducts = () => {
    setShowLowStockOnly(true);
    setShowOutOfStockOnly(false);
    setCurrentPage(1);
  };

  const handleViewOutOfStockProducts = () => {
    setShowOutOfStockOnly(true);
    setShowLowStockOnly(false);
    setCurrentPage(1);
  };

  const handleViewAllProducts = () => {
    setShowLowStockOnly(false);
    setShowOutOfStockOnly(false);
    setCurrentPage(1);
  };

  const value: ProductsHomeContextType = {
    loadingData,

    // Product states
    products,
    searchTerm,
    setSearchTerm,
    isCreateProductDialogOpen,
    setIsCreateProductDialogOpen,
    newProductFormData,
    setNewProductFormData,
    editingProductFormData,
    setEditingProductFormData,
    isEditProductDialogOpen,
    setIsEditProductDialogOpen,
    productToToggleStatus,
    isToggleStatusDialogOpen,
    setIsToggleStatusDialogOpen,
    
    // Category states
    showCategories,
    setShowCategories,
    categories,
    isAddingCategory,
    newCategoryName,
    setNewCategoryName,
    isDeleteCategoryDialogOpen,
    setIsDeleteCategoryDialogOpen,
    categoryToDelete,
    editingCategory,
    editingCategoryName,
    setEditingCategoryName,
    
    // Pagination states
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalProducts,
    paginationData,
    
    // Stock filter states
    lowStockCount,
    showLowStockOnly,
    outOfStockCount,
    showOutOfStockOnly,
    
    // Handlers
    handleAddCategory,
    handleCancelAddCategory,
    handleSaveCategory,
    handleDeleteCategory,
    handleConfirmDeleteCategory,
    handleCancelDeleteCategory,
    handleEditCategory,
    handleCancelEditCategory,
    handleSaveEditCategory,
    getStockStatus,
    handleAddProduct,
    handleSaveAddProduct,
    handleCancelAddProduct,
    toggleActiveStatus,
    handleConfirmToggleStatus,
    handleCancelToggleStatus,
    handleEditProduct,
    handleCancelEditProduct,
    handleSaveEditProduct,
    handleViewLowStockProducts,
    handleViewOutOfStockProducts,
    handleViewAllProducts,
  };

  return (
    <ProductsHomeContext.Provider value={value}>
      {children}
    </ProductsHomeContext.Provider>
  );
}

export function useProductsHomeContext() {
  const context = useContext(ProductsHomeContext);
  if (!context) {
    throw new Error('useProductsForPage must be used within a ProductsHomeProvider');
  }
  return context;
}

