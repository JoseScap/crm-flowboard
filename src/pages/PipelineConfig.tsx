import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { ArrowLeft, Settings, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tables } from '@/types/supabase.schema';

const PipelineConfig = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<Tables<'pipelines'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('');

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
          setWhatsappEnabled(data.whatsapp_is_enabled || false);
          setWhatsappNumber(data.whatsapp_number || '');
          setWhatsappPhoneNumberId(data.whatsapp_phone_number_id || '');
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

  const handleSave = async () => {
    if (!pipeline || !id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('pipelines')
        .update({
          whatsapp_is_enabled: whatsappEnabled,
          whatsapp_number: whatsappNumber.trim() || null,
          whatsapp_phone_number_id: whatsappPhoneNumberId.trim() || null,
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
          whatsapp_is_enabled: whatsappEnabled,
          whatsapp_number: whatsappNumber.trim() || '',
          whatsapp_phone_number_id: whatsappPhoneNumberId.trim() || null,
        });
      }
    } catch (error) {
      console.error('Error updating pipeline:', error);
      toast.error('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Pipeline not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 h-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/pipeline/${id}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pipeline Configuration</h1>
            <p className="text-muted-foreground mt-1">
              Configure settings for {pipeline.name}
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Card */}
      <Card className="p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">WhatsApp Integration</h2>
            <p className="text-sm text-muted-foreground">
              Enable WhatsApp notifications and set up your WhatsApp number
            </p>
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="space-y-6">
          {/* WhatsApp Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-primary" />
              <div>
                <Label htmlFor="whatsapp-enabled" className="text-base font-medium">
                  Enable WhatsApp
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activate WhatsApp notifications for this pipeline
                </p>
              </div>
            </div>
            <Switch
              id="whatsapp-enabled"
              checked={whatsappEnabled}
              onCheckedChange={setWhatsappEnabled}
            />
          </div>

          {/* WhatsApp Number Input */}
          {whatsappEnabled && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                <Input
                  id="whatsapp-number"
                  placeholder="+1234567890"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  type="tel"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your WhatsApp number in international format (e.g., +1234567890)
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="whatsapp-phone-number-id">WhatsApp Phone Number ID</Label>
                <Input
                  id="whatsapp-phone-number-id"
                  placeholder="Enter phone number ID"
                  value={whatsappPhoneNumberId}
                  onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the WhatsApp phone number ID (optional)
                </p>
              </div>
            </>
          )}
        </div>

        <Separator className="my-6" />

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/pipeline/${id}`)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PipelineConfig;

