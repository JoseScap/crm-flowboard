import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '@/modules/common/lib/supabase';
import { Tables, TablesInsert } from '@/modules/types/supabase.schema';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

export interface WhatsAppMessage {
  id: string;
  from?: string;
  to?: string;
  text: {
    body: string;
  };
  timestamp: string;
  type: string;
  kapso: {
    direction: 'inbound' | 'outbound';
    status: string;
    contact_name: string;
  };
}

interface WhatsAppMessagesResponse {
  status: string;
  data: WhatsAppMessage[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string | null;
  };
}

interface LeadDetailsContextType {
  // Loading state
  loadingData: boolean;

  // Lead state
  lead: Tables<'pipeline_stage_leads'> | null;
  pipelineStage: Tables<'pipeline_stages'> | null;
  pipeline: Tables<'pipelines'> | null;
  businessEmployees: Tables<'business_employees'>[];
  currentUserEmployee: Tables<'business_employees'> | null;

  // WhatsApp Chat state
  loadingChat: boolean;
  isChatModalOpen: boolean;
  chatMessages: WhatsAppMessage[];
  pagingNext: string | undefined;
  sendingMessage: boolean;
  loadingMore: boolean;
  messageText: string;

  // WhatsApp Chat handlers
  handleViewChat: () => Promise<void>;
  handleCloseChatModal: () => void;
  handleSendMessage: () => Promise<void>;
  handleLoadMore: () => Promise<void>;
  setMessageText: (text: string) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleUpdateLeadAssignment: (employeeId: number | null) => Promise<void>;

  // Lead Items state
  leadItems: Tables<'pipeline_stage_lead_items'>[];
  loadingItems: boolean;
  isAddProductModalOpen: boolean;
  setIsAddProductModalOpen: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  availableProducts: Tables<'products'>[];
  
  // Lead Items handlers
  handleAddProduct: (product: TablesInsert<'pipeline_stage_lead_items'>) => Promise<void>;
  handleRemoveProduct: (itemId: number) => Promise<void>;
  handleUpdateQuantity: (itemId: number, quantity: number) => Promise<void>;
  handleProcessSale: () => Promise<void>;
  isProcessingSale: boolean;

  // Computed values
  contactName: string | undefined;
  getBackUrl: () => string;
  subtotal: number;
}

const LeadDetailsContext = createContext<LeadDetailsContextType | undefined>(undefined);

export function LeadDetailsProvider({ children }: { children: ReactNode }) {
  const { id: businessId, leadId } = useParams<{ id: string; leadId: string }>();
  const [loadingData, setLoadingData] = useState(true);
  const [lead, setLead] = useState<Tables<'pipeline_stage_leads'> | null>(null);
  const [pipelineStage, setPipelineStage] = useState<Tables<'pipeline_stages'> | null>(null);
  const [pipeline, setPipeline] = useState<Tables<'pipelines'> | null>(null);
  const [businessEmployees, setBusinessEmployees] = useState<Tables<'business_employees'>[]>([]);
  const [currentUserEmployee, setCurrentUserEmployee] = useState<Tables<'business_employees'> | null>(null);

  // WhatsApp Chat state
  const [loadingChat, setLoadingChat] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<WhatsAppMessage[]>([]);
  const [pagingNext, setPagingNext] = useState<string | undefined>(undefined);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Lead Items state
  const [leadItems, setLeadItems] = useState<Tables<'pipeline_stage_lead_items'>[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableProducts, setAvailableProducts] = useState<Tables<'products'>[]>([]);
  const [isProcessingSale, setIsProcessingSale] = useState(false);

  useEffect(() => {
    const getData = async () => {
      if (!businessId || !leadId) {
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        const businessIdNum = parseInt(businessId, 10);
        const leadIdNum = parseInt(leadId, 10);

        // Fetch lead
        const { data: leadData, error: leadError } = await supabase
          .from('pipeline_stage_leads')
          .select('*')
          .eq('id', leadIdNum)
          .eq('business_id', businessIdNum)
          .single();

        if (leadError) {
          toast.error('Error al obtener los detalles del lead');
          setLoadingData(false);
          return;
        }

        if (leadData) {
          setLead(leadData);

          // Fetch lead items
          const { data: itemsData, error: itemsError } = await (supabase
            .from('pipeline_stage_lead_items')
            .select('*') as any)
            .eq('lead_id', leadIdNum)
            .eq('business_id', businessIdNum);
          
          if (!itemsError && itemsData) {
            setLeadItems(itemsData);
          }

          // Fetch business employees
          const { data: employeesData, error: employeesError } = await supabase
            .from('business_employees')
            .select('*')
            .eq('business_id', businessIdNum);

          if (!employeesError && employeesData) {
            setBusinessEmployees(employeesData);

            // Get current user to identify "Me"
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const currentEmp = employeesData.find(e => e.user_id === user.id);
              if (currentEmp) {
                setCurrentUserEmployee(currentEmp);
              }
            }
          }

          // Fetch pipeline stage if lead has a stage
          if (leadData.pipeline_stage_id) {
            const { data: stageData, error: stageError } = await supabase
              .from('pipeline_stages')
              .select('*')
              .eq('id', leadData.pipeline_stage_id)
              .eq('business_id', businessIdNum)
              .single();

            if (!stageError && stageData) {
              setPipelineStage(stageData);

              // Fetch pipeline
              const { data: pipelineData, error: pipelineError } = await supabase
                .from('pipelines')
                .select('*')
                .eq('id', stageData.pipeline_id)
                .eq('business_id', businessIdNum)
                .single();

              if (!pipelineError && pipelineData) {
                setPipeline(pipelineData);
              }
            }
          }
        }
      } catch (error) {
        toast.error('Error al obtener los detalles del lead');
      } finally {
        setLoadingData(false);
      }
    };

    getData();
  }, [businessId, leadId]);

  // Fetch available products for modal
  useEffect(() => {
    const fetchProducts = async () => {
      if (!businessId || !isAddProductModalOpen) return;

      try {
        setLoadingItems(true);
        let query = supabase
          .from('products')
          .select('*')
          .eq('business_id', parseInt(businessId, 10))
          .eq('is_active', true)
          .gt('stock', 0);

        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
        }

        const { data, error } = await query.limit(7);
        if (error) throw error;
        setAvailableProducts(data || []);
      } catch (error) {
        toast.error('Error al obtener los productos');
      } finally {
        setLoadingItems(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [businessId, isAddProductModalOpen, searchTerm]);

  // Lead Items handlers
  const syncLeadValue = async (items: Tables<'pipeline_stage_lead_items'>[]) => {
    if (!lead || !businessId) return;
    const newValue = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    try {
      const { error } = await supabase
        .from('pipeline_stage_leads')
        .update({ value: newValue })
        .eq('id', lead.id)
        .eq('business_id', parseInt(businessId, 10));

      if (error) throw error;
      setLead(prev => prev ? { ...prev, value: newValue } : null);
    } catch (error) {
      toast.error('Error al sincronizar el valor del lead');
    }
  };

  const handleAddProduct = async (product: TablesInsert<'pipeline_stage_lead_items'>) => {
    if (!lead || !businessId) return;

    try {
      const existingItem = leadItems.find(item => item.product_id === product.product_id);

      if (existingItem) {
        await handleUpdateQuantity(existingItem.id, existingItem.quantity + 1);
        return;
      }

      const { data, error } = await supabase
        .from('pipeline_stage_lead_items')
        .insert({
          ...product,
          business_id: parseInt(businessId, 10),
          lead_id: lead.id,
          quantity: product.quantity || 1,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const updatedItems = [...leadItems, data];
        setLeadItems(updatedItems);
        await syncLeadValue(updatedItems);
        toast.success(`${product.name} agregado al lead`);
      }
    } catch (error) {
      toast.error('Error al agregar el producto al lead');
    }
  };

  const handleRemoveProduct = async (itemId: number) => {
    try {
      const { error } = await supabase
        .from('pipeline_stage_lead_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      const updatedItems = leadItems.filter(item => item.id !== itemId);
      setLeadItems(updatedItems);
      await syncLeadValue(updatedItems);
      toast.success('Producto eliminado del lead');
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await handleRemoveProduct(itemId);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pipeline_stage_lead_items')
        .update({ quantity } as any)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const updatedItems = leadItems.map(item => item.id === itemId ? data : item);
        setLeadItems(updatedItems);
        await syncLeadValue(updatedItems);
      }
    } catch (error) {
      toast.error('Error al actualizar la cantidad');
    }
  };

  const handleProcessSale = async () => {
    if (leadItems.length === 0 || !lead || !businessId || !currentUserEmployee) {
      toast.error('No se puede procesar la venta: faltan datos');
      return;
    }

    try {
      setIsProcessingSale(true);
      const subtotal = leadItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const total = subtotal; // Assuming no tax for now, matching simple replication

      const { data: saleId, error: saleError } = await supabase.rpc('process_new_sale', {
        p_business_id: parseInt(businessId, 10),
        p_business_employee_id: currentUserEmployee.id,
        p_subtotal: subtotal,
        p_applied_tax: 0,
        p_total: total,
        p_items: leadItems.map(item => ({
          product_id: item.product_id,
          name: item.name,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity
        })),
        p_lead_id: lead.id,
      });

      if (saleError) throw saleError;

      toast.success('Venta procesada correctamente');
    } catch (error: any) {
      toast.error('Error al procesar la venta');
    } finally {
      setIsProcessingSale(false);
    }
  };

  // WhatsApp Chat handlers
  const fetchMessages = async () => {
    if (!pipeline?.whatsapp_phone_number_id || !lead?.phone_number || !lead.whatsapp_conversation_id) {
      return;
    }

    try {
      const response = await apiClient.get<WhatsAppMessagesResponse>(
        `/leads/whatsapp/messages/${pipeline.whatsapp_phone_number_id}`,
        {
          params: {
            phone_number: lead.phone_number,
            conversation_id: lead.whatsapp_conversation_id,
            limit: '10',
          },
        }
      );

      if (response.data.status === 'success' && response.data.data) {
        setChatMessages(response.data.data);
        setPagingNext(response.data.paging?.next);
      }
    } catch (error) {
      toast.error('Error al obtener los mensajes de WhatsApp');
    }
  };

  const handleViewChat = async () => {
    if (!pipeline?.whatsapp_phone_number_id || !lead?.phone_number || !lead.whatsapp_conversation_id) {
      return;
    }

    try {
      setLoadingChat(true);
      await fetchMessages();
      setIsChatModalOpen(true);
    } catch (error) {
      toast.error('Error al abrir el chat');
    } finally {
      setLoadingChat(false);
    }
  };

  const handleCloseChatModal = () => {
    setIsChatModalOpen(false);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || sendingMessage || !pipeline?.whatsapp_phone_number_id || !lead?.phone_number) {
      return;
    }

    try {
      setSendingMessage(true);

      await apiClient.post(
        `/leads/whatsapp/messages/${pipeline.whatsapp_phone_number_id}`,
        {
          to: lead.phone_number,
          text: messageText.trim(),
          preview_url: false,
        }
      );

      // Clear input
      setMessageText('');
      
      // Show success message
      toast.success('Mensaje enviado correctamente');

      // Refresh messages
      await fetchMessages();
    } catch (error) {
      toast.error('Error al enviar el mensaje');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLoadMore = async () => {
    if (!pagingNext || loadingMore || !pipeline?.whatsapp_phone_number_id || !lead?.phone_number || !lead.whatsapp_conversation_id) {
      return;
    }

    try {
      setLoadingMore(true);

      const response = await apiClient.get<WhatsAppMessagesResponse>(
        `/leads/whatsapp/messages/${pipeline.whatsapp_phone_number_id}`,
        {
          params: {
            phone_number: lead.phone_number,
            conversation_id: lead.whatsapp_conversation_id,
            limit: '10',
            after: pagingNext,
          },
        }
      );

      if (response.data.status === 'success' && response.data.data) {
        setChatMessages(prev => [...response.data.data, ...prev]);
        setPagingNext(response.data.paging?.next);
      }
    } catch (error) {
      toast.error('Error al cargar más mensajes');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUpdateLeadAssignment = async (employeeId: number | null) => {
    if (!lead || !businessId) return;

    try {
      const { error } = await supabase
        .from('pipeline_stage_leads')
        .update({ business_employee_id: employeeId })
        .eq('id', lead.id)
        .eq('business_id', parseInt(businessId, 10));

      if (error) throw error;

      setLead(prev => prev ? { ...prev, business_employee_id: employeeId } : null);
      toast.success('Asignación del lead actualizada');
    } catch (error) {
      toast.error('Error al actualizar la asignación del lead');
    }
  };

  // Computed values
  const contactName = chatMessages.length > 0 
    ? chatMessages[0]?.kapso?.contact_name 
    : lead?.customer_name;

  const getBackUrl = () => {
    if (!lead) return '/user/businesses';
    const businessIdNum = lead.business_id;
    if (pipeline && pipelineStage) {
      return `/user/businesses/${businessIdNum}/pipeline/${pipeline.id}`;
    }
    return `/user/businesses/${businessIdNum}`;
  };

  const subtotal = leadItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const value: LeadDetailsContextType = {
    loadingData,
    lead,
    pipelineStage,
    pipeline,
    businessEmployees,
    currentUserEmployee,
    loadingChat,
    isChatModalOpen,
    chatMessages,
    pagingNext,
    sendingMessage,
    loadingMore,
    messageText,
    handleViewChat,
    handleCloseChatModal,
    handleSendMessage,
    handleLoadMore,
    setMessageText,
    handleKeyPress,
    handleUpdateLeadAssignment,
    leadItems,
    loadingItems,
    isAddProductModalOpen,
    setIsAddProductModalOpen,
    searchTerm,
    setSearchTerm,
    availableProducts,
    handleAddProduct,
    handleRemoveProduct,
    handleUpdateQuantity,
    handleProcessSale,
    isProcessingSale,
    contactName,
    getBackUrl,
    subtotal,
  };

  return (
    <LeadDetailsContext.Provider value={value}>
      {children}
    </LeadDetailsContext.Provider>
  );
}

export function useLeadDetailsContext() {
  const context = useContext(LeadDetailsContext);
  if (!context) {
    throw new Error('useLeadDetailsContext must be used within a LeadDetailsProvider');
  }
  return context;
}

