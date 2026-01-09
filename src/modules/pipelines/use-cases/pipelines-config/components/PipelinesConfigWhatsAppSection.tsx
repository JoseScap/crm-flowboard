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
              <h2 className="text-xl font-semibold text-foreground">Integración de WhatsApp</h2>
              <p className="text-sm text-muted-foreground">
                Habilita las notificaciones de WhatsApp y configura tu número de WhatsApp
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
                    Habilitar WhatsApp
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Activar las notificaciones de WhatsApp para este pipeline
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
                  <Label htmlFor="whatsapp-number">Número de WhatsApp</Label>
                  <Input
                    id="whatsapp-number"
                    placeholder="+1234567890"
                    value={whatsappFormData.whatsappNumber}
                    onChange={(e) => handleChangeWhatsAppFormData('whatsappNumber', e.target.value)}
                    type="tel"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingrese su número de WhatsApp en formato internacional (ej., +1234567890)
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp-phone-number-id">ID de Teléfono de WhatsApp</Label>
                  <Input
                    id="whatsapp-phone-number-id"
                    placeholder="Ingrese el ID del número de teléfono"
                    value={whatsappFormData.whatsappPhoneNumberId}
                    onChange={(e) => handleChangeWhatsAppFormData('whatsappPhoneNumberId', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingrese el ID del número de teléfono de WhatsApp (opcional)
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
              Cancelar
            </Button>
            <Button
              onClick={handleSaveWhatsAppConfig}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Configuración'
              )}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

