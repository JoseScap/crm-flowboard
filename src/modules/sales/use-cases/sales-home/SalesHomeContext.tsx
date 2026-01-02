import { createContext, useContext, useState, useEffect, useCallback, ReactNode, Dispatch, SetStateAction, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '@/modules/common/lib/supabase';
import { toast } from 'sonner';
import { Database, Tables, TablesInsert } from '@/modules/types/supabase.schema';

type BaseCartItem = TablesInsert<'product_snapshots'>;
type CartItemWithoutOptionalFields = Omit<BaseCartItem, 'created_at' | 'id' | 'sale_id'>;

type ProcessedSale = Database['public']['Functions']['process_sale']['Returns'][number];

// Define the context type
interface SalesHomeContextType {
  // Loading state
  loadingData: boolean;

  // Cart states
  cart: CartItemWithoutOptionalFields[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  showReceipt: boolean;
  setShowReceipt: Dispatch<SetStateAction<boolean>>;

  // Product states
  products: (Tables<'products'> & { product_categories: Pick<Tables<'product_categories'>, 'name'> | null })[];
  categories: Tables<'product_categories'>[];

  // Tax states
  applyTax: boolean;
  setApplyTax: Dispatch<SetStateAction<boolean>>;
  taxPercentage: string;
  setTaxPercentage: Dispatch<SetStateAction<string>>;

  // Sales states
  saleDetails: {
    subtotal: number;
    tax: number;
    total: number;
    totalItems: number;
  }
  processedSale: ProcessedSale | null;

  // Handlers
  handleAddProductToCart: (productId: number) => void;
  handleUpdateProductQuantity: (productId: number, delta: number) => void;
  handleRemoveProductFromCart: (productId: number) => void;
  handleResetCart: () => void;
  handleProcessSale: () => Promise<void>;
  handleCloseReceipt: () => void;
}

const SalesHomeContext = createContext<SalesHomeContextType | undefined>(undefined);

export function SalesHomeProvider({ children }: { children: ReactNode }) {
  const { id: businessIdParam } = useParams<{ id: string }>();
  const businessId = businessIdParam ? parseInt(businessIdParam, 10) : null;

  // Loading state
  const [loadingData, setLoadingData] = useState(true);
  
  // Cart states
  const [cart, setCart] = useState<CartItemWithoutOptionalFields[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [processedSale, setProcessedSale] = useState<ProcessedSale | null>(null);

  // Product states
  const [products, setProducts] = useState<(Tables<'products'> & { product_categories: Pick<Tables<'product_categories'>, 'name'> | null })[]>([]);
  const [categories, setCategories] = useState<Tables<'product_categories'>[]>([]);

  // Tax states
  const [applyTax, setApplyTax] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState('16');

  // Calculations
  const saleDetails = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
    const tax = applyTax ? subtotal * (parseFloat(taxPercentage) / 100) : 0;
    const total = subtotal + tax;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, tax, total, totalItems };
  }, [cart, applyTax, taxPercentage]);

  const getData = useCallback(async () => {
    if (!businessId || isNaN(businessId)) {
      setLoadingData(false);
      return;
    }

    try {
      setLoadingData(true);

      // Build products query with search filter
      let productsQuery = supabase
        .from('products')
        .select('*, product_categories (name)')
        .eq('business_id', businessId)
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
          .eq('business_id', businessId)
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
        setProducts(productsResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading data');
    } finally {
      setLoadingData(false);
    }
  }, [searchTerm, businessId]);

  // Fetch data when dependencies change
  useEffect(() => {
    getData();
  }, [getData]);

  // Set up realtime subscription for products
  useEffect(() => {
    if (!businessId || isNaN(businessId)) {
      return;
    }

    const channel = supabase
      .channel(`products-changes-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'products',
          filter: `business_id=eq.${businessId}`,
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
  }, [getData, businessId]);

  // Cart handlers
  const handleAddProductToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }

    if (!product.is_active) {
      toast.error('Producto no activo');
      return;
    }

    if (product.stock === 0) {
      toast.error('Producto sin stock');
      return;
    }

    const existingItem = cart.find((item) => item.product_id === productId);

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
                name: product.name,
                price: product.price.toString(),
                quantity: item.quantity + 1,
                sku: product.sku,
                product_id: product.id,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          name: product.name,
          price: product.price.toString(),
          product_id: product.id,
          quantity: 1,
          sku: product.sku,
        },
      ]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const handleUpdateProductQuantity = (productId: number, delta: number) => {
    const productIndex = cart.findIndex((item) => item.product_id === productId);
    if (productIndex === -1) {
      toast.error('Product not found in cart');
      return;
    }
    const newQuantity = cart[productIndex].quantity + delta;
    if (newQuantity <= 0) {
      handleRemoveProductFromCart(productId);
      return;
    }
    if (delta > 0) {
      const product = products.find((p) => p.id === productId);
      if (product && newQuantity > product.stock) {
        toast.error('Insufficient stock');
        return;
      }
    }
    cart[productIndex].quantity = newQuantity;
    setCart([...cart]);
  };

  const handleRemoveProductFromCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast.error('Product not found in cart');
      return;
    }
    setCart([...cart.filter((item) => item.product_id !== productId)]);
    toast.success(`${product.name} removed from cart`);
  };

  const handleResetCart = () => {
    setCart([]);
    setApplyTax(false);
    setTaxPercentage('16');
    setProcessedSale(null);
    setShowReceipt(false);
  };

  // Sale processing
  const handleProcessSale = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (!businessId || isNaN(businessId)) {
      toast.error('Business ID is missing');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('process_sale', {
        p_business_id: businessId,
        cart_items: cart.map((item) => ({
          ...item,
        })),
        applied_tax: applyTax ? parseFloat(taxPercentage) : 0,
      })
      .single();

      if (error) {
        console.error('Error processing sale:', error);
        toast.error('Error al procesar la venta');
        return;
      }

      // Success - show receipt and clear cart
      setShowReceipt(true);
      setProcessedSale(data);

      // Refresh products data to reflect stock changes
      await getData();

      toast.success('Venta procesada exitosamente');
    } catch (error) {
      console.error('Error processing sale:', error);
      toast.error('Error al procesar la venta');
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setProcessedSale(null);
    handleResetCart();
  };

  const value: SalesHomeContextType = {
    // Loading state
    loadingData,

    // Cart states
    cart,
    searchTerm,
    setSearchTerm,
    showReceipt,
    setShowReceipt,

    // Product states
    products,
    categories,

    // Tax states
    applyTax,
    setApplyTax,
    taxPercentage,
    setTaxPercentage,

    // Sales states
    saleDetails,
    processedSale,

    // Handlers
    handleAddProductToCart,
    handleUpdateProductQuantity,
    handleRemoveProductFromCart,
    handleResetCart,
    handleProcessSale,
    handleCloseReceipt,
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

