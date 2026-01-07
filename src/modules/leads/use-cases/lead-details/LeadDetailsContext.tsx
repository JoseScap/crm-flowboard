import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '@/modules/common/lib/supabase';
import { Tables } from '@/modules/types/supabase.schema';
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

  // Computed values
  contactName: string | undefined;
  getBackUrl: () => string;
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
          console.error('Error fetching lead:', leadError);
          toast.error('Error fetching lead details');
          setLoadingData(false);
          return;
        }

        if (leadData) {
          setLead(leadData);

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
        console.error('Error fetching lead details:', error);
        toast.error('Error fetching lead details');
      } finally {
        setLoadingData(false);
      }
    };

    getData();
  }, [businessId, leadId]);

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
      console.error('Error fetching WhatsApp messages:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown }; message?: string };
        console.error('Error details:', axiosError.response?.data || axiosError.message);
      }
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
      console.error('Error opening chat:', error);
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
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown }; message?: string };
        console.error('Error details:', axiosError.response?.data || axiosError.message);
      }
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
      console.error('Error loading more messages:', error);
      toast.error('Error al cargar más mensajes');
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown }; message?: string };
        console.error('Error details:', axiosError.response?.data || axiosError.message);
      }
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
      toast.success('Lead assignment updated');
    } catch (error) {
      console.error('Error updating lead assignment:', error);
      toast.error('Error updating lead assignment');
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
    contactName,
    getBackUrl,
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

