import { useState, useEffect, useCallback } from 'react';
import supabase from '@/modules/common/supabase';
import { toast } from 'sonner';
import { Tables } from '@/types/supabase.schema';

export function useSalesForPage() {
  // Cart states
  const [cart, setCart] = useState<Tables<'product_snapshots'>[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<{
    items: Tables<'product_snapshots'>[];
    total: number;
    date: Date;
  } | null>(null);

  // Product states
  const [products, setProducts] = useState<(Tables<'products'> & { product_categories: Pick<Tables<'product_categories'>, 'name'> | null })[]>([]);
  const [categories, setCategories] = useState<Tables<'product_categories'>[]>([]);
  const [loading, setLoading] = useState(true);

  // Tax states
  const [applyTax, setApplyTax] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState('16');

  const getData = useCallback(async () => {
    try {
      setLoading(true);

      // Build products query with search filter
      let productsQuery = supabase
        .from('products')
        .select('*, product_categories (name)')
        .eq('is_active', true) // Only fetch active products
        .order('created_at', { ascending: false })
        .range(0, 7); // Get exactly 8 products (indices 0 to 7)

      // Apply search filter if searchTerm exists
      if (searchTerm.trim()) {
        productsQuery = productsQuery.or(
          `name.ilike.%${searchTerm.trim()}%,sku.ilike.%${searchTerm.trim()}%`
        );
      }

      // Fetch categories and products in parallel
      const [categoriesResult, productsResult] = await Promise.all([
        supabase
          .from('product_categories')
          .select('*')
          .order('created_at', { ascending: false }),
        productsQuery,
      ]);

      if (categoriesResult.error) {
        console.error('Error fetching categories:', categoriesResult.error);
        toast.error('Error loading categories');
      }

      if (productsResult.error) {
        console.error('Error fetching products:', productsResult.error);
        toast.error('Error loading products');
      }

      // Set categories
      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      // Map products with categories
      if (productsResult.data && categoriesResult.data) {
        const productsWithCategory = productsResult.data.map(
          (product: Tables<'products'>) => {
            const category = categoriesResult.data.find(
              (cat) => cat.id.toString() === product.product_category_id
            );
            return {
              ...product,
              product_categories: category ? { name: category.name } : null,
            };
          }
        );
        setProducts(productsWithCategory);
      } else if (productsResult.data) {
        // If no categories, just set products without category mapping
        const productsWithCategory = productsResult.data.map(
          (product: Tables<'products'>) =>
            ({
              ...product,
              product_categories: null,
            })
        );
        setProducts(productsWithCategory);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

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

  // Products are already filtered and limited from the database
  const filteredProducts = products;

  // Cart handlers
  const addToCart = (product: Tables<'products'> & { product_categories: Pick<Tables<'product_categories'>, 'name'> | null }) => {
    if (product.stock === 0) {
      toast.error('Producto sin stock');
      return;
    }

    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      // Check if we can add one more item
      if (existingItem.quantity >= product.stock) {
        toast.error('Stock insuficiente');
        return;
      }
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? {
                name: item.name,
                price: item.price,
                product_id: item.product_id,
                quantity: item.quantity + 1,
                sku: item.sku,
                created_at: item.created_at,
                id: item.id,
                sale_id: item.sale_id,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          created_at: new Date().toISOString(),
          id: crypto.randomUUID(),
          sale_id: crypto.randomUUID(),
          name: product.name,
          price: product.price.toString(),
          product_id: product.id,
          quantity: 1,
          sku: product.sku,
        },
      ]);
    }
    toast.success(`${product.name} agregado`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.product_id === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            
            // Check stock availability when increasing quantity
            if (delta > 0) {
              const product = products.find((p) => p.id === productId);
              if (product && newQuantity > product.stock) {
                toast.error('Stock insuficiente');
                return item;
              }
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item !== null && item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  const tax = applyTax ? subtotal * (parseFloat(taxPercentage) / 100) : 0;
  const total = subtotal + tax;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Sale processing
  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('process_sale', {
        cart_items: cart.map((item) => ({
          ...item,
        })),
        applied_tax: applyTax ? parseFloat(taxPercentage) : 0,
      });

      if (error) {
        console.error('Error processing sale:', error);
        toast.error('Error al procesar la venta');
        return;
      }

      // Success - show receipt and clear cart
      setLastSale({
        items: [...cart],
        total,
        date: new Date(),
      });
      setShowReceipt(true);
      setCart([]);
      setApplyTax(false);
      setTaxPercentage('16');

      // Refresh products data to reflect stock changes
      await getData();

      toast.success('Venta procesada exitosamente');
    } catch (error) {
      console.error('Error processing sale:', error);
      toast.error('Error al procesar la venta');
    }
  };

  return {
    // Cart states
    cart,
    searchTerm,
    setSearchTerm,
    showReceipt,
    setShowReceipt,
    lastSale,
    
    // Product states
    products,
    categories,
    loading,
    filteredProducts,
    
    // Tax states
    applyTax,
    setApplyTax,
    taxPercentage,
    setTaxPercentage,
    
    // Calculations
    subtotal,
    tax,
    total,
    totalItems,
    
    // Handlers
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    processSale,
  };
}

