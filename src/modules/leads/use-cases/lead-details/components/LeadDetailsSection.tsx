import { useLeadDetailsContext } from '../LeadDetailsContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, DollarSign, Calendar, CheckCircle2, XCircle, MessageSquare, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/lead-utils';
import { Badge } from '@/components/ui/badge';
import { WhatsAppChatModal } from './WhatsAppChatModal';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { LeadItemsTable } from './LeadItemsTable';
import { AddLeadItemModal } from './AddLeadItemModal';

export function LeadDetailsSection() {
  const {
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
  } = useLeadDetailsContext();
  const navigate = useNavigate();

  const currentEmployeeId = lead.business_employee_id?.toString() || 'unassigned';

  if (!lead) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Back button and WhatsApp chat button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(getBackUrl())}
          className="hover:bg-transparent px-0 h-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Pipeline
        </Button>
        {lead.whatsapp_conversation_id && pipeline?.whatsapp_phone_number_id && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewChat}
            disabled={loadingChat || !lead.phone_number}
            className="flex items-center gap-2"
          >
            {loadingChat ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <MessageCircle className="w-3 h-3" />
                Ver chat
              </>
            )}
          </Button>
        )}
      </div>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {lead.is_active ? (
                <Badge variant="default" className="h-5 px-1.5 text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Activo
                </Badge>
              ) : (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] flex items-center gap-1">
                  <XCircle className="w-2.5 h-2.5" />
                  Inactivo
                </Badge>
              )}
              {lead.is_revenue && (
                <Badge variant="default" className="h-5 px-1.5 text-[10px] bg-green-600">
                  Ingresos
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{lead.customer_name}</h1>
          </div>

          <div className="flex items-center gap-4">
            {pipeline && pipelineStage && (
              <>
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">Pipeline</span>
                  <span className="text-sm font-medium">{pipeline.name}</span>
                </div>
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">Etapa</span>
                  <Badge 
                    variant="outline"
                    className="h-5 px-1.5 text-[10px] font-medium"
                    style={{ 
                      borderColor: pipelineStage.color,
                      color: pipelineStage.color,
                      backgroundColor: `${pipelineStage.color}10`
                    }}
                  >
                    {pipelineStage.name}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Contact Information */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <User className="w-4 h-4" />
              Información de contacto
            </h2>
            
            <div className="grid gap-3">
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground w-12">Correo:</span>
                  <a 
                    href={`mailto:${lead.email}`}
                    className="text-sm text-foreground font-medium hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    {lead.email}
                  </a>
                </div>
              )}

              {lead.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground w-12">Teléfono:</span>
                  <a 
                    href={`tel:${lead.phone_number}`}
                    className="text-sm text-foreground font-medium hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    {lead.phone_number}
                  </a>
                </div>
              )}

              {lead.whatsapp_conversation_id && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground w-12">WA ID:</span>
                  <span className="text-sm text-foreground font-medium">{lead.whatsapp_conversation_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Lead Information */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              Información del Lead
            </h2>
            
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground w-16">Valor:</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(lead.value)}</span>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary mt-0.5" />
                <span className="text-xs text-muted-foreground w-16">Timeline:</span>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  <span className="text-xs text-foreground font-medium">Creado: {formatDate(lead.created_at)}</span>
                  {lead.closed_at && (
                    <span className="text-xs text-green-600 font-semibold">Cerrado: {formatDate(lead.closed_at)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground w-16">Asignado:</span>
                <div className="flex-1 max-w-[200px]">
                  <Select
                    value={currentEmployeeId}
                    onValueChange={(value) => {
                      const employeeId = value === 'unassigned' ? null : parseInt(value, 10);
                      handleUpdateLeadAssignment(employeeId);
                    }}
                  >
                    <SelectTrigger className="h-8 py-0 px-2 text-xs bg-background border-border hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned" className="text-xs">Sin asignar</SelectItem>
                      {businessEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()} className="text-xs">
                          {employee.email} {employee.id === currentUserEmployee?.id ? '(Yo)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-4" />
      
      <LeadItemsTable />
      <AddLeadItemModal />

      {pipeline?.whatsapp_phone_number_id && lead.phone_number && (
        <WhatsAppChatModal
          open={isChatModalOpen}
          onOpenChange={handleCloseChatModal}
          messages={chatMessages}
          contactName={contactName}
          pagingNext={pagingNext}
          sendingMessage={sendingMessage}
          loadingMore={loadingMore}
          messageText={messageText}
          onMessageTextChange={setMessageText}
          onSendMessage={handleSendMessage}
          onLoadMore={handleLoadMore}
          onKeyPress={handleKeyPress}
        />
      )}
    </div>
  );
}
