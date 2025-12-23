import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { toast } from 'sonner';
import { Tables } from '@/types/supabase.schema';

export function useProductsForPage() {
  // Product states
  const [products, setProducts] = useState<(Tables<'products'> & { product_categories: Pick<Tables<'product_categories'>, 'name'> | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Tables<'products'> | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    minStock: '',
  });

  // Category states
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState<Tables<'product_categories'>[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Tables<'product_categories'> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Tables<'product_categories'> | null>(null);
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
      setLoading(true);
      
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage - 1;
      
      // Determine which view to use
      const useLowStock = showLowStockOnly && !showOutOfStockOnly;
      const useOutOfStock = showOutOfStockOnly && !showLowStockOnly;
      
      // Fetch categories and products in parallel
      const [categoriesResult, productsResult, countResult, lowStockCountResult, outOfStockCountResult] = await Promise.all([
        supabase
          .from('product_categories')
          .select('*')
          .order('created_at', { ascending: false }),
        useOutOfStock
          ? supabase
              .from('products_out_of_stock')
              .select('*, product_categories (name)')
              .order('created_at', { ascending: false })
              .range(startIndex, endIndex)
          : useLowStock
          ? supabase
              .from('products_low_stock')
              .select('*, product_categories (name)')
              .order('created_at', { ascending: false })
              .range(startIndex, endIndex)
          : supabase
              .from('products')
              .select('*, product_categories (name)')
              .eq('is_active', true)
              .order('created_at', { ascending: false })
              .range(startIndex, endIndex),
        useOutOfStock
          ? supabase
              .from('products_out_of_stock')
              .select('*', { count: 'exact', head: true })
          : useLowStock
          ? supabase
              .from('products_low_stock')
              .select('*', { count: 'exact', head: true })
          : supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('is_active', true),
        supabase
          .from('products_low_stock_total')
          .select('count')
          .single(),
        supabase
          .from('products_out_of_stock_total')
          .select('count')
          .single()
      ]);

      if (categoriesResult.error) {
        console.error('Error fetching categories:', categoriesResult.error);
        toast.error('Error loading categories');
      }

      if (productsResult.error) {
        console.error('Error fetching products:', productsResult.error);
        toast.error('Error loading products');
      }

      if (lowStockCountResult.error) {
        console.error('Error fetching low stock count:', lowStockCountResult.error);
      }

      if (outOfStockCountResult.error) {
        console.error('Error fetching out of stock count:', outOfStockCountResult.error);
      }

      // Set total count
      if (countResult.count !== null) {
        setTotalProducts(countResult.count);
      }

      // Get low stock count from the database view
      if (lowStockCountResult.data && lowStockCountResult.data.count !== null) {
        setLowStockCount(lowStockCountResult.data.count);
      }

      // Get out of stock count from the database view
      if (outOfStockCountResult.data && outOfStockCountResult.data.count !== null) {
        setOutOfStockCount(outOfStockCountResult.data.count);
      }

      // Set categories
      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      // Map products with categories
      if (useOutOfStock && productsResult.data) {
        // When showing out of stock, map the view data
        const productsWithCategory = productsResult.data.map((product) => {
          const category = categoriesResult.data?.find(cat => cat.id.toString() === product.product_category_id);
          return {
            ...product,
            product_categories: category ? { name: category.name } : null,
          };
        });
        setProducts(productsWithCategory);
      } else if (useLowStock && productsResult.data) {
        // When showing low stock, the view might already include category info or we need to map it
        const productsWithCategory = productsResult.data.map((product) => {
          const category = categoriesResult.data?.find(cat => cat.id.toString() === product.product_category_id);
          return {
            ...product,
            product_categories: category ? { name: category.name } : null,
          };
        });
        setProducts(productsWithCategory);
      } else if (productsResult.data && categoriesResult.data) {
        const productsWithCategory = productsResult.data.map((product) => {
          const category = categoriesResult.data.find(cat => cat.id.toString() === product.product_category_id);
          return {
            ...product,
            product_categories: category ? { name: category.name } : null,
          };
        });
        setProducts(productsWithCategory);
      } else if (productsResult.data) {
        // If no categories, just set products without category mapping
        const productsWithCategory = productsResult.data.map((product) => ({
          ...product,
          product_categories: null,
        }));
        setProducts(productsWithCategory);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, showLowStockOnly, showOutOfStockOnly]);

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

    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert([{ name: newCategoryName.trim() }])
        .select();

      if (error) {
        console.error('Error creating category:', error);
        toast.error('Error creating category');
      } else {
        toast.success('Category created');
        setIsAddingCategory(false);
        setNewCategoryName('');
        await getData();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error creating category');
    }
  };

  const handleDeleteCategory = (category: Tables<'product_categories'>) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
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
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
        await getData();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error deleting category');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleEditCategory = (category: Tables<'product_categories'>) => {
    setEditingCategory(category);
    setEditingCategoryName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || !editingCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const { error } = await supabase
        .from('product_categories')
        .update({ name: editingCategoryName.trim() })
        .eq('id', editingCategory.id);

      if (error) {
        console.error('Error updating category:', error);
        toast.error('Error updating category');
      } else {
        toast.success('Category updated');
        setEditingCategory(null);
        setEditingCategoryName('');
        await getData();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Error updating category');
    }
  };

  // Product handlers
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.product_categories?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  // Pagination calculations - use totalProducts for server-side pagination
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);

  const getStockStatus = (stock: number, minStock: number | null) => {
    if (stock === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (minStock !== null && stock <= minStock) return { label: 'Low Stock', variant: 'warning' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const handleOpenDialog = (product?: Tables<'products'> & { product_categories: Pick<Tables<'product_categories'>, 'name'> | null }) => {
    if (product) {
      setEditingProduct(product);
      const categoryName = product.product_categories?.name || 'N/A';
      setFormData({
        name: product.name,
        sku: product.sku,
        category: categoryName,
        price: product.price.toString(),
        stock: product.stock.toString(),
        minStock: (product.minimum_stock || 0).toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', category: '', price: '', stock: '', minStock: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.sku || !formData.price) {
      toast.error('Please complete required fields');
      return;
    }

    // Handle category selection - if "N/A" is selected, set to null
    let categoryId: string | null = null;
    if (formData.category && formData.category !== 'N/A') {
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      if (!selectedCategory) {
        toast.error('Please select a valid category');
        return;
      }
      categoryId = selectedCategory.id.toString();
    }

    const productData = {
      name: formData.name,
      sku: formData.sku,
      product_category_id: categoryId,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
      minimum_stock: parseInt(formData.minStock) || null,
      is_active: true, // Always set to true when creating/updating
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) {
          console.error('Error updating product:', error);
          toast.error('Error updating product');
        } else {
          toast.success('Product updated');
          await getData();
        }
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) {
          console.error('Error creating product:', error);
          toast.error('Error creating product');
        } else {
          toast.success('Product added');
          await getData();
        }
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', sku: '', category: '', price: '', stock: '', minStock: '' });
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error saving product');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        toast.error('Error deleting product');
      } else {
        toast.success('Product deleted');
        await getData();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  // View mode handlers
  const handleViewLowStock = () => {
    setShowLowStockOnly(true);
    setShowOutOfStockOnly(false);
    setCurrentPage(1);
  };

  const handleViewOutOfStock = () => {
    setShowOutOfStockOnly(true);
    setShowLowStockOnly(false);
    setCurrentPage(1);
  };

  const handleViewAll = () => {
    setShowLowStockOnly(false);
    setShowOutOfStockOnly(false);
    setCurrentPage(1);
  };

  return {
    // Product states
    products,
    loading,
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    setIsDialogOpen,
    editingProduct,
    formData,
    setFormData,
    filteredProducts,
    
    // Category states
    showCategories,
    setShowCategories,
    categories,
    isAddingCategory,
    newCategoryName,
    setNewCategoryName,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
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
    totalPages,
    startIndex,
    endIndex,
    
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
    handleConfirmDelete,
    handleCancelDelete,
    handleEditCategory,
    handleCancelEdit,
    handleSaveEdit,
    getStockStatus,
    handleOpenDialog,
    handleSave,
    handleDelete,
    handleViewLowStock,
    handleViewOutOfStock,
    handleViewAll,
  };
}

