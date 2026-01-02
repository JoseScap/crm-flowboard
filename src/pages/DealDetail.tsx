import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import supabase from '@/modules/common/lib/supabase';
import { Pipeline, PipelineStageDeal, PipelineStage, ProductWithCategory, ProductSnapshotCartItem } from '@/types/index.types';
import { STAGE_COLORS } from '@/constants/colors';
import { formatCurrency, getInitials, getAvatarColor, formatDate } from '@/lib/deal-utils';
import { DollarSign, Mail, Phone, Calendar, User, ArrowLeft, Send, MessageSquare, Edit2, Check, X, ChevronDown, ChevronUp, ShoppingCart, Plus, Minus, Trash2, Search, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WhatsAppMessage {
  id: string;
  from?: string;
  to?: string;
  text?: {
    body: string;
  };
  timestamp: string;
  type: string;
}

interface WhatsAppPaging {
  cursors?: {
    before?: string;
    after?: string;
  };
  next?: string;
  previous?: string | null;
}

interface WhatsAppResponse {
  status: string;
  data: WhatsAppMessage[];
  paging?: WhatsAppPaging;
}

const DealDetail = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<PipelineStageDeal | null>(null);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [stage, setStage] = useState<PipelineStage | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isEditingStage, setIsEditingStage] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [updatingStage, setUpdatingStage] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [cart, setCart] = useState<ProductSnapshotCartItem[]>([]);
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [applyTax, setApplyTax] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState('16');
  const [processingSale, setProcessingSale] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [paging, setPaging] = useState<WhatsAppPaging | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const pagingRef = useRef<WhatsAppPaging | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getData = async () => {
    if (!dealId) {
      navigate('/user');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch deal with stage information
      const { data: dealData, error: dealError } = await supabase
        .from('pipeline_stage_deals')
        .select(`
          *,
          pipeline_stages (
            id,
            name,
            color,
            pipeline_id
          )
        `)
        .eq('id', dealId)
        .single();

      if (dealError) {
        console.error('Error fetching deal:', dealError);
        toast.error('Error loading deal details');
        navigate('/user');
        return;
      }

      if (!dealData) {
        navigate('/user');
        return;
      }

      setDeal(dealData);

      // Extract stage information if available
      if (dealData.pipeline_stages && Array.isArray(dealData.pipeline_stages) && dealData.pipeline_stages.length > 0) {
        const stageData = dealData.pipeline_stages[0] as PipelineStage;
        setStage(stageData);

        // Fetch pipeline using pipeline_id from stage
        if (stageData.pipeline_id) {
          const { data: pipelineData, error: pipelineError } = await supabase
            .from('pipelines')
            .select('*')
            .eq('id', stageData.pipeline_id)
            .single();

          if (pipelineError) {
            console.error('Error fetching pipeline:', pipelineError);
            return;
          }

          if (pipelineData) {
            setPipeline(pipelineData);
            // Fetch all stages for this pipeline
            const { data: stagesData, error: stagesError } = await supabase
              .from('pipeline_stages')
              .select('*')
              .eq('pipeline_id', pipelineData.id)
              .order('order', { ascending: true });

            if (!stagesError && stagesData) {
              setStages(stagesData);
            }
          }
        }
      } else if (dealData.pipeline_stage_id) {
        // Fallback: fetch stage separately if join didn't work
        const { data: stageData, error: stageError } = await supabase
          .from('pipeline_stages')
          .select('*')
          .eq('id', dealData.pipeline_stage_id)
          .single();

        if (!stageError && stageData) {
          setStage(stageData);

          if (stageData.pipeline_id) {
            const { data: pipelineData, error: pipelineError } = await supabase
              .from('pipelines')
              .select('*')
              .eq('id', stageData.pipeline_id)
              .single();

            if (!pipelineError && pipelineData) {
              setPipeline(pipelineData);
              // Fetch all stages for this pipeline
              const { data: stagesData, error: stagesError } = await supabase
                .from('pipeline_stages')
                .select('*')
                .eq('pipeline_id', pipelineData.id)
                .order('order', { ascending: true });

              if (!stagesError && stagesData) {
                setStages(stagesData);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading deal details');
      navigate('/user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [dealId, navigate]);

  // Check for open sale when deal is loaded
  useEffect(() => {
    const checkOpenSale = async () => {
      if (!deal?.id) {
        return;
      }

      try {
        // Search for an existing open sale for this deal
        const { data: existingSale, error: searchError } = await supabase
          .from('sales')
          .select('*')
          .eq('deal_id', deal.id)
          .eq('is_open', true)
          .maybeSingle();

        if (searchError) {
          console.error('Error searching for open sale:', searchError);
          return;
        }

        if (existingSale) {
          // Load existing sale and its product snapshots
          setCurrentSaleId(existingSale.id);
          setApplyTax(existingSale.applied_tax > 0);
          setTaxPercentage(existingSale.applied_tax.toString());

          // Fetch product snapshots for this sale
          const { data: snapshots, error: snapshotsError } = await supabase
            .from('product_snapshots')
            .select('*, products(id, stock, price)')
            .eq('sale_id', existingSale.id);

          if (snapshotsError) {
            console.error('Error loading product snapshots:', snapshotsError);
          } else if (snapshots) {
            // Convert snapshots to cart items
            const cartItems: ProductSnapshotCartItem[] = snapshots.map((snapshot) => ({
              name: snapshot.name,
              price: snapshot.price,
              product_id: snapshot.product_id,
              quantity: snapshot.quantity,
              sku: snapshot.sku,
            }));
            setCart(cartItems);
          }
          
          // Always open cart if sale exists (regardless of items)
          setShowCart(true);
        }
      } catch (error) {
        console.error('Error checking for open sale:', error);
      }
    };

    if (deal?.id && !loading) {
      checkOpenSale();
    }
  }, [deal?.id, loading]);

  const getInitialMessages = async () => {
    if (!pipeline?.whatsapp_phone_number_id || !deal?.phone_number) {
      return;
    }

    try {
      const params = {
        limit: 5,
        phone_number: deal.phone_number,
        conversation_id: deal.whatsapp_conversation_id,
      };

      const response = await axios.get<WhatsAppResponse>(
        `http://localhost:3000/deals/whatsapp/messages/${pipeline.whatsapp_phone_number_id}`,
        { params }
      );
      
      if (response.data.status === 'success' && response.data.data) {
        // Filter messages to only include those where from or to matches the deal's phone number
        const dealPhoneNumber = deal.phone_number;
        const filteredMessages = response.data.data.filter((msg) => {
          return msg.from === dealPhoneNumber || msg.to === dealPhoneNumber;
        });

        // Reverse the order so newest messages are at the bottom
        const reversedMessages = [...filteredMessages].reverse();
        setWhatsappMessages(reversedMessages);

        // Update paging info
        if (response.data.paging) {
          setPaging(response.data.paging);
          pagingRef.current = response.data.paging;
        }
      }
    } catch (error) {
      console.error('Error fetching initial WhatsApp messages:', error);
      toast.error('Error loading messages');
    }
  };

  const getAfterMessages = async (after: string) => {
    if (!pipeline?.whatsapp_phone_number_id || !deal?.phone_number) {
      return;
    }

    try {
      setLoadingMore(true);

      const params = {
        limit: 5,
        phone_number: deal.phone_number,
        conversation_id: deal.whatsapp_conversation_id,
        after: after,
      };

      const response = await axios.get<WhatsAppResponse>(
        `http://localhost:3000/deals/whatsapp/messages/${pipeline.whatsapp_phone_number_id}`,
        { params }
      );
      
      if (response.data.status === 'success' && response.data.data) {
        // Filter messages to only include those where from or to matches the deal's phone number
        const dealPhoneNumber = deal.phone_number;
        const filteredMessages = response.data.data.filter((msg) => {
          return msg.from === dealPhoneNumber || msg.to === dealPhoneNumber;
        });

        // Reverse the order so newest messages are at the bottom
        const reversedMessages = [...filteredMessages].reverse();
        
        // Loading older messages (using 'after') - prepend to existing messages
        // Will appear at bottom due to flex-col-reverse
        setWhatsappMessages((prev) => [...reversedMessages, ...prev]);

        // Update paging info
        if (response.data.paging) {
          setPaging(response.data.paging);
          pagingRef.current = response.data.paging;
        }
      }
    } catch (error) {
      console.error('Error fetching older WhatsApp messages:', error);
      toast.error('Error loading older messages');
    } finally {
      setLoadingMore(false);
    }
  };

  // Fetch initial WhatsApp messages when we have both pipeline and deal data
  useEffect(() => {
    if (pipeline?.whatsapp_phone_number_id && deal?.phone_number) {
      getInitialMessages();
    }
  }, [pipeline?.whatsapp_phone_number_id, deal?.phone_number]);

  // Fetch products for cart
  const getProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);

      let productsQuery = supabase
        .from('products')
        .select('*, product_categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (productSearchTerm.trim()) {
        productsQuery = productsQuery.ilike('name', `%${productSearchTerm.trim()}%`);
      }

      const { data: productsData, error: productsError } = await productsQuery;

      if (productsError) {
        console.error('Error fetching products:', productsError);
        toast.error('Error loading products');
        return;
      }

      if (productsData) {
        setProducts(productsData as ProductWithCategory[]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    } finally {
      setLoadingProducts(false);
    }
  }, [productSearchTerm]);

  useEffect(() => {
    if (showProductModal) {
      getProducts();
    }
  }, [showProductModal, getProducts]);

  // Auto-scroll to bottom (top in flex-col-reverse) when messages change
  useEffect(() => {
    if (messagesEndRef.current && !loadingMore) {
      // In flex-col-reverse, the newest messages are at the top, so we scroll to top
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = 0;
      }
    }
  }, [whatsappMessages, loadingMore]);

  const handleSendMessage = async () => {
    if (!message.trim() || !pipeline?.whatsapp_phone_number_id || !deal?.phone_number || sending) {
      return;
    }

    setSending(true);
    try {
      await axios.post(
        `http://localhost:3000/deals/whatsapp/messages/${pipeline.whatsapp_phone_number_id}`,
        {
          to: deal.phone_number,
          text: message.trim(),
          preview_url: false,
        }
      );

      // Clear input
      setMessage('');

      // Fetch newer messages - refetch all messages to get the latest including the one we just sent
      await getInitialMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditStage = () => {
    setIsEditingStage(true);
    setSelectedStageId(stage?.id || '');
  };

  const handleCancelEditStage = () => {
    setIsEditingStage(false);
    setSelectedStageId('');
  };

  const handleUpdateStage = async () => {
    if (!deal || !selectedStageId || selectedStageId === stage?.id || updatingStage) {
      return;
    }

    try {
      setUpdatingStage(true);

      // Update the deal's pipeline_stage_id
      const { data: updatedDeal, error: updateError } = await supabase
        .from('pipeline_stage_deals')
        .update({ pipeline_stage_id: selectedStageId })
        .eq('id', deal.id)
        .select(`
          *,
          pipeline_stages (
            id,
            name,
            color,
            pipeline_id
          )
        `)
        .single();

      if (updateError) {
        console.error('Error updating deal stage:', updateError);
        toast.error('Error updating stage');
        return;
      }

      if (updatedDeal) {
        // Update local state
        setDeal(updatedDeal);

        // Extract and update stage information
        if (updatedDeal.pipeline_stages && Array.isArray(updatedDeal.pipeline_stages) && updatedDeal.pipeline_stages.length > 0) {
          const newStageData = updatedDeal.pipeline_stages[0] as PipelineStage;
          setStage(newStageData);
        }

        setIsEditingStage(false);
        toast.success('Stage updated successfully');
      }
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Error updating stage');
    } finally {
      setUpdatingStage(false);
    }
  };

  // Cart handlers
  const addToCart = async (product: ProductWithCategory) => {
    if (product.stock === 0) {
      toast.error('Product out of stock');
      return;
    }

    if (!currentSaleId) {
      toast.error('No sale found. Please open cart first.');
      return;
    }

    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      // Check if we can add one more item
      if (existingItem.quantity >= product.stock) {
        toast.error('Insufficient stock');
        return;
      }

      // Update quantity in cart
      const updatedCart = cart.map((item) =>
        item.product_id === product.id
          ? {
              name: item.name,
              price: item.price,
              product_id: item.product_id,
              quantity: item.quantity + 1,
              sku: item.sku,
            }
          : item
      );
      setCart(updatedCart);

      // Update product snapshot in DB
      const { error: updateError } = await supabase
        .from('product_snapshots')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('sale_id', currentSaleId)
        .eq('product_id', product.id);

      if (updateError) {
        console.error('Error updating product snapshot:', updateError);
        toast.error('Error updating cart item');
        // Revert cart change
        setCart(cart);
        return;
      }
    } else {
      // Add new item to cart
      const newItem: ProductSnapshotCartItem = {
        name: product.name,
        price: product.price.toString(),
        product_id: product.id,
        quantity: 1,
        sku: product.sku,
      };
      setCart([...cart, newItem]);

      // Create product snapshot in DB
      const { error: insertError } = await supabase
        .from('product_snapshots')
        .insert([
          {
            sale_id: currentSaleId,
            product_id: product.id,
            name: product.name,
            price: product.price.toString(),
            quantity: 1,
            sku: product.sku,
          },
        ]);

      if (insertError) {
        console.error('Error creating product snapshot:', insertError);
        toast.error('Error adding product to cart');
        // Revert cart change
        setCart(cart);
        return;
      }
    }
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = async (productId: string, delta: number) => {
    if (!currentSaleId) {
      toast.error('No sale found');
      return;
    }

    const item = cart.find((i) => i.product_id === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      // Remove item
      await removeFromCart(productId);
      return;
    }

    // Check stock availability when increasing quantity
    if (delta > 0) {
      const product = products.find((p) => p.id === productId);
      if (product && newQuantity > product.stock) {
        toast.error('Insufficient stock');
        return;
      }
    }

    // Update cart
    const updatedCart = cart.map((cartItem) =>
      cartItem.product_id === productId
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );
    setCart(updatedCart);

    // Update product snapshot in DB
    const { error } = await supabase
      .from('product_snapshots')
      .update({ quantity: newQuantity })
      .eq('sale_id', currentSaleId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error updating product snapshot:', error);
      toast.error('Error updating quantity');
      // Revert cart change
      setCart(cart);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!currentSaleId) {
      toast.error('No sale found');
      return;
    }

    // Remove from cart
    setCart(cart.filter((item) => item.product_id !== productId));

    // Delete product snapshot from DB
    const { error } = await supabase
      .from('product_snapshots')
      .delete()
      .eq('sale_id', currentSaleId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing product snapshot:', error);
      toast.error('Error removing item from cart');
      // Note: We don't revert cart change here as it's already updated
    }
  };

  const clearCart = async () => {
    if (!currentSaleId) {
      setCart([]);
      return;
    }

    // Delete all product snapshots for this sale
    const { error } = await supabase
      .from('product_snapshots')
      .delete()
      .eq('sale_id', currentSaleId);

    if (error) {
      console.error('Error clearing cart:', error);
      toast.error('Error clearing cart');
      return;
    }

    setCart([]);
  };

  // Open cart - search for existing open sale or create new one
  const handleOpenCart = async () => {
    if (!deal?.id) {
      toast.error('Deal not found');
      return;
    }

    try {
      setLoadingCart(true);

      // First, search for an existing open sale for this deal
      const { data: existingSale, error: searchError } = await supabase
        .from('sales')
        .select('*')
        .eq('deal_id', deal.id)
        .eq('is_open', true)
        .maybeSingle();

      if (searchError) {
        console.error('Error searching for open sale:', searchError);
        toast.error('Error loading cart');
        return;
      }

      if (existingSale) {
        // Load existing sale and its product snapshots
        setCurrentSaleId(existingSale.id);
        setApplyTax(existingSale.applied_tax > 0);
        setTaxPercentage(existingSale.applied_tax.toString());

        // Fetch product snapshots for this sale
        const { data: snapshots, error: snapshotsError } = await supabase
          .from('product_snapshots')
          .select('*')
          .eq('sale_id', existingSale.id);

        if (snapshotsError) {
          console.error('Error loading product snapshots:', snapshotsError);
          toast.error('Error loading cart items');
        } else if (snapshots) {
          // Convert snapshots to cart items
          const cartItems: ProductSnapshotCartItem[] = snapshots.map((snapshot) => ({
            name: snapshot.name,
            price: snapshot.price,
            product_id: snapshot.product_id,
            quantity: snapshot.quantity,
            sku: snapshot.sku,
          }));
          setCart(cartItems);
        }
      } else {
        // Create new open sale
        const { data: newSale, error: createError } = await supabase
          .from('sales')
          .insert({
            deal_id: deal.id,
            subtotal: 0,
            applied_tax: 0,
            total: 0,
            is_open: true,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating sale:', createError);
          console.error('Error details:', JSON.stringify(createError, null, 2));
          toast.error(`Error creating cart: ${createError.message || 'Unknown error'}`);
          setLoadingCart(false);
          return;
        }

        if (!newSale) {
          console.error('No sale returned after creation');
          toast.error('Error creating cart: No sale returned');
          setLoadingCart(false);
          return;
        }

        console.log('Sale created successfully:', newSale);
        setCurrentSaleId(newSale.id);
        setCart([]);
        setApplyTax(false);
        setTaxPercentage('16');
      }

      setShowCart(true);
    } catch (error) {
      console.error('Error opening cart:', error);
      toast.error('Error opening cart');
    } finally {
      setLoadingCart(false);
    }
  };

  // Cart calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  const tax = applyTax ? subtotal * (parseFloat(taxPercentage) / 100) : 0;
  const total = subtotal + tax;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Process sale (not implemented yet - will update sale totals when closing)
  const processSale = async () => {
    // TODO: Implement sale closing logic
    toast.info('Sale processing will be implemented soon');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Deal not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(pipeline ? `/pipeline/${pipeline.id}` : '/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${getAvatarColor(deal.customer_name)} text-primary-foreground flex-shrink-0`}
            >
              {getInitials(deal.customer_name)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{deal.customer_name}</h1>
              <p className="text-sm text-muted-foreground">Deal Details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Chat Section - Left */}
        <div className="w-2/3 border-r border-border flex flex-col min-h-0">
          <div className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Chat</h2>
            </div>
          </div>
          
          <div 
            className="flex-1 overflow-y-auto p-4 min-h-0 flex flex-col-reverse"
          >
            {whatsappMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No messages yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {whatsappMessages.map((msg) => {
                  const isFromCustomer = msg.from === deal?.phone_number;
                  const messageText = msg.text?.body || '';
                  const messageTimestamp = msg.timestamp 
                    ? new Date(parseInt(msg.timestamp) * 1000).toISOString()
                    : new Date().toISOString();

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isFromCustomer ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isFromCustomer
                            ? 'bg-muted text-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <p className="text-sm">{messageText}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatDate(messageTimestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
            {loadingMore && (
              <div className="flex justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!paging?.cursors?.after && !loadingMore && whatsappMessages.length > 0 && (
              <div className="px-4 py-2">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You're at the beginning of the conversation
                  </AlertDescription>
                </Alert>
              </div>
            )}
            {paging?.cursors?.after && !loadingMore && (
              <div className="flex justify-center py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentPaging = pagingRef.current || paging;
                    if (currentPaging?.cursors?.after) {
                      getAfterMessages(currentPaging.cursors.after);
                    }
                  }}
                >
                  Load More Messages
                </Button>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim() || sending}>
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Deal Details Section - Right */}
        <div className="w-1/3 overflow-y-auto p-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-semibold ${getAvatarColor(deal.customer_name)} text-primary-foreground flex-shrink-0`}
                  >
                    {getInitials(deal.customer_name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{deal.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">Customer</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                >
                  {isDetailsExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {isDetailsExpanded && (
                <>
                  <Separator />

              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Deal Value</p>
                    <p className="text-lg font-semibold text-foreground">{formatCurrency(deal.value)}</p>
                  </div>
                </div>

                {deal.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-foreground">{deal.email}</p>
                    </div>
                  </div>
                )}

                {deal.phone_number && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p className="text-foreground">{deal.phone_number}</p>
                    </div>
                  </div>
                )}

                {stage && (
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-5 h-5 rounded mt-0.5 flex-shrink-0" 
                      style={{ backgroundColor: stage.color }}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Stage</p>
                      {isEditingStage ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Select
                            value={selectedStageId}
                            onValueChange={setSelectedStageId}
                            disabled={updatingStage}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a stage" />
                            </SelectTrigger>
                            <SelectContent>
                              {stages.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded" 
                                      style={{ backgroundColor: s.color }}
                                    />
                                    <span>{s.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleUpdateStage}
                            disabled={updatingStage || selectedStageId === stage.id}
                          >
                            {updatingStage ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleCancelEditStage}
                            disabled={updatingStage}
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-foreground font-medium">{stage.name}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0"
                            onClick={handleEditStage}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="text-foreground">{formatDate(deal.created_at)}</p>
                  </div>
                </div>

                {deal.closed_at && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Closed At</p>
                      <p className="text-foreground">{formatDate(deal.closed_at)}</p>
                    </div>
                  </div>
                )}

                {deal.is_revenue !== null && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Revenue Status</p>
                      <p className="text-foreground">
                        {deal.is_revenue ? (
                          <span className="text-success font-semibold">Closed with Revenue</span>
                        ) : (
                          <span className="text-muted-foreground">Closed without Revenue</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
                </>
              )}
            </div>
          </Card>

          {/* Cart Section */}
          {showCart && (
            <Card className="mt-4">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Cart</h3>
                    {totalItems > 0 && (
                      <Badge>{totalItems} items</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowCart(false)}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>

                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                      {cart.map((item) => (
                        <div
                          key={item.product_id}
                          className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${parseFloat(item.price).toLocaleString()} each
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.product_id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.product_id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 py-2">
                        <Checkbox
                          id="apply-tax"
                          checked={applyTax}
                          onCheckedChange={(checked) =>
                            setApplyTax(checked === true)
                          }
                        />
                        <Label
                          htmlFor="apply-tax"
                          className="text-sm cursor-pointer"
                        >
                          Add tax
                        </Label>
                      </div>
                      
                      {applyTax && (
                        <div className="flex items-center gap-2 pb-2">
                          <Input
                            type="number"
                            value={taxPercentage}
                            onChange={(e) => setTaxPercentage(e.target.value)}
                            placeholder="%"
                            className="w-20 h-8"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      )}
                      
                      {applyTax && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Tax ({taxPercentage}%)
                          </span>
                          <span>
                            ${tax.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">
                          ${total.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={clearCart}
                        disabled={processingSale}
                      >
                        Clear Cart
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={processSale}
                        disabled={processingSale || cart.length === 0 || !currentSaleId}
                        variant="outline"
                      >
                        {processingSale ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Process Sale (Coming Soon)
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Button to open cart */}
          {!showCart && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleOpenCart}
              disabled={loadingCart}
            >
              {loadingCart ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {cart.length > 0 ? `Cart (${totalItems} items)` : 'Open Cart'}
                </>
              )}
            </Button>
          )}

          {/* Button to add products */}
          <Button
            className="w-full mt-2"
            onClick={() => setShowProductModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Products
          </Button>
        </div>
      </div>

      {/* Product Selection Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Loading products...
                    </span>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <p>No products found</p>
                </div>
              ) : (
                products.map((product) => (
                  <Card
                    key={product.id}
                    className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
                      product.stock === 0 ? "opacity-50" : ""
                    }`}
                    onClick={async () => {
                      if (product.stock > 0) {
                        addToCart(product);
                        setShowProductModal(false);
                        // If cart is not open, open it (will search/create sale)
                        if (!showCart) {
                          await handleOpenCart();
                        }
                      }
                    }}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {product.product_categories?.name || "N/A"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Stock: {product.stock}
                        </span>
                      </div>
                      <h3 className="font-medium text-sm leading-tight mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {product.sku}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        ${product.price.toLocaleString()}
                      </p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealDetail;

