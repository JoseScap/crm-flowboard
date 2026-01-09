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
  isCreateCategoryDialogOpen: boolean;
  setIsCreateCategoryDialogOpen: Dispatch<SetStateAction<boolean>>;
  newCategoryFormData: TablesInsert<'product_categories'>;
  setNewCategoryFormData: Dispatch<SetStateAction<TablesInsert<'product_categories'>>>;
  isDeleteCategoryDialogOpen: boolean;
  setIsDeleteCategoryDialogOpen: Dispatch<SetStateAction<boolean>>;
  categoryToDelete: Tables<'product_categories'> | null;
  isEditCategoryDialogOpen: boolean;
  setIsEditCategoryDialogOpen: Dispatch<SetStateAction<boolean>>;
  editingCategoryFormData: TablesUpdate<'product_categories'> | null;
  setEditingCategoryFormData: Dispatch<SetStateAction<TablesUpdate<'product_categories'> | null>>;
  
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

  // Sort by
  sortProductsBy: keyof Tables<'products'>;
  sortProductsAscending: boolean;

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
  handleChangeSortProductsBy: (field: keyof Tables<'products'>) => void;
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

const defaultCategoryFormData: TablesInsert<'product_categories'> = {
  name: '',
  description: null,
  business_id: 0,
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
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);
  const [newCategoryFormData, setNewCategoryFormData] = useState<TablesInsert<'product_categories'>>(defaultCategoryFormData);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Tables<'product_categories'> | null>(null);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [editingCategoryFormData, setEditingCategoryFormData] = useState<TablesUpdate<'product_categories'> | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalProducts, setTotalProducts] = useState(0);

  // Sort by
  const [sortProductsBy, setSortProductsBy] = useState<keyof Tables<'products'>>('created_at');
  const [sortProductsAscending, setSortProductsAscending] = useState(false);

  
  const getData = useCallback(async () => {
    try {
      setLoadingData(true);
      
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage - 1;
      
      if (!businessId) {
        setLoadingData(false);
        return;
      }

      // Fetch categories and products in parallel
      const [
        categoriesResult,
        productsResult,
        productsCountResult,
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
           .ilike('name', `%${searchTerm}%`)
           .ilike('sku', `%${searchTerm}%`)
           .order(sortProductsBy, { ascending: sortProductsAscending })
           .range(startIndex, endIndex),
        supabase
          .from('products')
          .select('count', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .ilike('name', `%${searchTerm}%`)
          .ilike('sku', `%${searchTerm}%`)
          .single(),
      ]);

      if (categoriesResult.error) {
        toast.error('Error al cargar las categorías');
      }

      if (productsResult.error) {
        toast.error('Error al cargar los productos');
      }

      // Set total count
      if (productsCountResult.count !== null) {
        setTotalProducts(productsCountResult.count);
      }

      // Set categories
      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      setProducts(productsResult.data);
    } catch (error) {
      toast.error('Error al cargar los productos');
    } finally {
      setLoadingData(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, businessId, sortProductsBy, sortProductsAscending]);

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
  }, [searchTerm, itemsPerPage]);

  // Category handlers
  const handleAddCategory = () => {
    setIsCreateCategoryDialogOpen(true);
    setNewCategoryFormData({ ...defaultCategoryFormData, business_id: businessId || 0 });
  };

  const handleCancelAddCategory = () => {
    setIsCreateCategoryDialogOpen(false);
    setNewCategoryFormData(defaultCategoryFormData);
  };

  const handleSaveCategory = async () => {
    if (!newCategoryFormData.name.trim()) {
      toast.error('Por favor, ingrese un nombre para la categoría');
      return;
    }

    if (!businessId) {
      toast.error('El ID del negocio es requerido');
      return;
    }

    try {
      const { error } = await supabase
        .from('product_categories')
        .insert([{ 
          name: newCategoryFormData.name.trim(), 
          description: newCategoryFormData.description?.trim() || null,
          business_id: businessId 
        }]);

      if (error) {
        toast.error('Error al crear la categoría');
      } else {
        toast.success('Categoría creada');
        setIsCreateCategoryDialogOpen(false);
        setNewCategoryFormData(defaultCategoryFormData);
        await getData();
      }
    } catch (error) {
      toast.error('Error al crear la categoría');
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
        toast.error('Error al eliminar la categoría');
      } else {
        toast.success('Categoría eliminada');
        setIsDeleteCategoryDialogOpen(false);
        setCategoryToDelete(null);
        await getData();
      }
    } catch (error) {
      toast.error('Error al eliminar la categoría');
    }
  };

  const handleCancelDeleteCategory = () => {
    setIsDeleteCategoryDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleEditCategory = (category: Tables<'product_categories'>) => {
    setEditingCategoryFormData({
      id: category.id,
      name: category.name,
      description: category.description,
      business_id: category.business_id
    });
    setIsEditCategoryDialogOpen(true);
  };

  const handleCancelEditCategory = () => {
    setIsEditCategoryDialogOpen(false);
    setEditingCategoryFormData(null);
  };

  const handleSaveEditCategory = async () => {
    if (!editingCategoryFormData || !editingCategoryFormData.name?.trim()) {
      toast.error('Por favor, ingrese un nombre para la categoría');
      return;
    }

    if (!editingCategoryFormData.id) {
      toast.error('El ID de la categoría es requerido');
      return;
    }

    try {
      const { id, ...updateData } = editingCategoryFormData;
      const { error } = await supabase
        .from('product_categories')
        .update({ 
          name: updateData.name?.trim(),
          description: updateData.description?.trim() || null
        })
        .eq('id', id);

      if (error) {
        toast.error('Error al actualizar la categoría');
      } else {
        toast.success('Categoría actualizada');
        setIsEditCategoryDialogOpen(false);
        setEditingCategoryFormData(null);
        await getData();
      }
    } catch (error) {
      toast.error('Error al actualizar la categoría');
    }
  };

  const getStockStatus = (stock: number, minStock: number | null): StockStatus => {
    if (stock === 0) return { label: 'Agotado', variant: 'destructive' };
    if (minStock !== null && stock <= minStock) return { label: 'Stock Bajo', variant: 'warning' };
    return { label: 'En Stock', variant: 'default' };
  };

  const handleAddProduct = () => {
    setIsCreateProductDialogOpen(true);
    setNewProductFormData({ ...defaultProductFormData, business_id: businessId || 0 });
  };

  const handleSaveAddProduct = async () => {
    if (!newProductFormData.name || !newProductFormData.sku) {
      toast.error('Por favor, complete todos los campos obligatorios');
      return;
    }

    if (newProductFormData.price === undefined || newProductFormData.price === null || newProductFormData.price < 0) {
      toast.error('Por favor, ingrese un precio válido');
      return;
    }

    if (newProductFormData.stock === undefined || newProductFormData.stock === null || newProductFormData.stock < 0) {
      toast.error('Por favor, ingrese una cantidad de stock válida');
      return;
    }

    if (!businessId) {
      toast.error('El ID del negocio es requerido');
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
        toast.error('Error al crear el producto');
      } else {
        toast.success('Producto agregado');
        setIsCreateProductDialogOpen(false);
        setNewProductFormData({ ...defaultProductFormData, business_id: businessId });
        await getData();
      }
    } catch (error) {
      toast.error('Error al crear el producto');
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
        toast.error('Error al actualizar el estado del producto');
      } else {
        toast.success(newStatus ? 'Producto activado' : 'Producto desactivado');
        setIsToggleStatusDialogOpen(false);
        setProductToToggleStatus(null);
        await getData();
      }
    } catch (error) {
      toast.error('Error al actualizar el estado del producto');
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
      toast.error('No se seleccionó ningún producto para editar');
      return;
    }

    try {
      const { id, ...updateData } = editingProductFormData;
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) {
        toast.error('Error al actualizar el producto');
      } else {
        toast.success('Producto actualizado');
        setIsEditProductDialogOpen(false);
        setEditingProductFormData(null);
        await getData();
      }
    } catch (error) {
      toast.error('Error al actualizar el producto');
    }
  };

  const handleChangeSortProductsBy = (field: keyof Tables<'products'>) => {
    if (field !== sortProductsBy) {
      setSortProductsBy(field);
      setSortProductsAscending(true);
      return;
    }

    if (field === sortProductsBy && sortProductsAscending) {
      setSortProductsAscending(false);
      return;
    }

    setSortProductsBy('created_at');
    setSortProductsAscending(true);
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
    isCreateCategoryDialogOpen,
    setIsCreateCategoryDialogOpen,
    newCategoryFormData,
    setNewCategoryFormData,
    isDeleteCategoryDialogOpen,
    setIsDeleteCategoryDialogOpen,
    categoryToDelete,
    isEditCategoryDialogOpen,
    setIsEditCategoryDialogOpen,
    editingCategoryFormData,
    setEditingCategoryFormData,
    
    // Pagination states
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalProducts,
    paginationData,

    // Sort by
    sortProductsBy,
    sortProductsAscending,
    
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
    handleChangeSortProductsBy,
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

