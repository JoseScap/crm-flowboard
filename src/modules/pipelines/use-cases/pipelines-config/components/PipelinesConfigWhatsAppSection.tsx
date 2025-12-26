import { useState } from 'react';
import { Settings, MessageCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { usePipelinesConfigContext } from '../PipelinesConfigContext';

export function PipelinesConfigWhatsAppSection() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    whatsappFormData,
    saving,
    handleChangeWhatsAppFormData,
    handleSaveWhatsAppConfig,
    handleCancelWhatsAppConfig,
  } = usePipelinesConfigContext();

  return (
    <Card className="p-6 max-w-2xl">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <Settings className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-xl font-semibold text-foreground">WhatsApp Integration</h2>
              <p className="text-sm text-muted-foreground">
                Enable WhatsApp notifications and set up your WhatsApp number
              </p>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator className="my-6" />

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
                checked={whatsappFormData.whatsappEnabled}
                onCheckedChange={(enabled) => handleChangeWhatsAppFormData('whatsappEnabled', enabled)}
              />
            </div>

            {/* WhatsApp Number Input */}
            {whatsappFormData.whatsappEnabled && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                  <Input
                    id="whatsapp-number"
                    placeholder="+1234567890"
                    value={whatsappFormData.whatsappNumber}
                    onChange={(e) => handleChangeWhatsAppFormData('whatsappNumber', e.target.value)}
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
                    value={whatsappFormData.whatsappPhoneNumberId}
                    onChange={(e) => handleChangeWhatsAppFormData('whatsappPhoneNumberId', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the WhatsApp phone number ID (optional)
                  </p>
                </div>
              </>
            )}
          </div>

          <Separator className="my-6" />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancelWhatsAppConfig}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveWhatsAppConfig}
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

