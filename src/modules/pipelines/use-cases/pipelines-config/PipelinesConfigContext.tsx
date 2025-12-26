import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '@/modules/common/supabase';
import { toast } from 'sonner';
import { Tables } from '@/modules/types/supabase.schema';

type WhatsAppFormData = {
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappPhoneNumberId: string;
};

interface PipelinesConfigContextType {
  // Loading states
  loading: boolean;
  saving: boolean;

  // Pipeline state
  pipeline: Tables<'pipelines'> | null;

  // WhatsApp form data
  whatsappFormData: WhatsAppFormData;

  // Handlers
  handleChangeWhatsAppFormData: <T extends keyof WhatsAppFormData>(field: T, value: WhatsAppFormData[T]) => void;
  handleSaveWhatsAppConfig: () => Promise<void>;
  handleCancelWhatsAppConfig: () => void;
}

const PipelinesConfigContext = createContext<PipelinesConfigContextType | undefined>(undefined);

const defaultWhatsAppFormData: WhatsAppFormData = {
  whatsappEnabled: false,
  whatsappNumber: '',
  whatsappPhoneNumberId: '',
};

export function PipelinesConfigProvider({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<Tables<'pipelines'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [whatsappFormData, setWhatsappFormData] = useState<WhatsAppFormData>(defaultWhatsAppFormData);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const fetchPipeline = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('pipelines')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching pipeline:', error);
          toast.error('Error loading pipeline configuration');
          navigate('/');
          return;
        }

        if (data) {
          setPipeline(data);
          setWhatsappFormData({
            whatsappEnabled: data.whatsapp_is_enabled || false,
            whatsappNumber: data.whatsapp_number || '',
            whatsappPhoneNumberId: data.whatsapp_phone_number_id || '',
          });
        }
      } catch (error) {
        console.error('Error fetching pipeline:', error);
        toast.error('Error loading pipeline configuration');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPipeline();
  }, [id, navigate]);

  const handleSaveWhatsAppConfig = async () => {
    if (!pipeline || !id) return;

    // Validate: if WhatsApp is enabled, both fields are required
    if (whatsappFormData.whatsappEnabled) {
      const trimmedNumber = whatsappFormData.whatsappNumber.trim();
      const trimmedPhoneNumberId = whatsappFormData.whatsappPhoneNumberId.trim();
      
      if (!trimmedNumber || !trimmedPhoneNumberId) {
        toast.error('WhatsApp number and phone number ID are required when WhatsApp is enabled');
        return;
      }
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('pipelines')
        .update({
          whatsapp_is_enabled: whatsappFormData.whatsappEnabled,
          whatsapp_number: whatsappFormData.whatsappNumber.trim() || null,
          whatsapp_phone_number_id: whatsappFormData.whatsappPhoneNumberId.trim() || null,
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating pipeline:', error);
        toast.error('Error saving configuration');
      } else {
        toast.success('Configuration saved successfully');
        // Update local state
        setPipeline({
          ...pipeline,
          whatsapp_is_enabled: whatsappFormData.whatsappEnabled,
          whatsapp_number: whatsappFormData.whatsappNumber.trim() || '',
          whatsapp_phone_number_id: whatsappFormData.whatsappPhoneNumberId.trim() || null,
        });
      }
    } catch (error) {
      console.error('Error updating pipeline:', error);
      toast.error('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelWhatsAppConfig = () => {
    if (!id) return;
    navigate(`/pipeline/${id}`);
  };

  const handleChangeWhatsAppFormData = <T extends keyof WhatsAppFormData>(field: T, value: WhatsAppFormData[T]) => {
    setWhatsappFormData((prev) => ({ ...prev, [field]: value }));
  };

  const value: PipelinesConfigContextType = {
    // Loading states
    loading,
    saving,

    // Pipeline state
    pipeline,

    // WhatsApp form data
    whatsappFormData,

    // Handlers
    handleChangeWhatsAppFormData,
    handleSaveWhatsAppConfig,
    handleCancelWhatsAppConfig,
  };

  return (
    <PipelinesConfigContext.Provider value={value}>
      {children}
    </PipelinesConfigContext.Provider>
  );
}

export function usePipelinesConfigContext() {
  const context = useContext(PipelinesConfigContext);
  if (!context) {
    throw new Error('usePipelinesConfigContext must be used within a PipelinesConfigProvider');
  }
  return context;
}

