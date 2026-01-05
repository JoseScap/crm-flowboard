import { useLeadDetailsContext } from '../LeadDetailsContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, DollarSign, Calendar, CheckCircle2, XCircle, MessageSquare, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/lead-utils';
import { Badge } from '@/components/ui/badge';
import { WhatsAppChatModal } from './WhatsAppChatModal';

export function LeadDetailsCard() {
  const {
    lead,
    pipelineStage,
    pipeline,
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
    contactName,
    getBackUrl,
  } = useLeadDetailsContext();
  const navigate = useNavigate();

  if (!lead) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Back button and WhatsApp chat button */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(getBackUrl())}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {lead.whatsapp_conversation_id && pipeline?.whatsapp_phone_number_id && (
          <Button
            variant="outline"
            onClick={handleViewChat}
            disabled={loadingChat || !lead.phone_number}
            className="flex items-center gap-2"
          >
            {loadingChat ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                Ver chat
              </>
            )}
          </Button>
        )}
      </div>

      {/* Lead Details Card */}
      <div className="bg-card border border-border rounded-xl p-6 lg:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{lead.customer_name}</h1>
            {pipeline && pipelineStage && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Pipeline:</span>
                <Badge variant="outline">{pipeline.name}</Badge>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">Stage:</span>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: pipelineStage.color,
                    color: pipelineStage.color 
                  }}
                >
                  {pipelineStage.name}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {lead.is_active ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Inactive
              </Badge>
            )}
            {lead.is_revenue && (
              <Badge variant="default" className="bg-green-600">
                Revenue
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
            
            {lead.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a 
                    href={`mailto:${lead.email}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {lead.email}
                  </a>
                </div>
              </div>
            )}

            {lead.phone_number && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a 
                    href={`tel:${lead.phone_number}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {lead.phone_number}
                  </a>
                </div>
              </div>
            )}

            {lead.whatsapp_conversation_id && (
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="text-foreground">Conversation ID: {lead.whatsapp_conversation_id}</p>
                </div>
              </div>
            )}
          </div>

          {/* Lead Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Lead Information</h2>
            
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Value</p>
                <p className="text-foreground font-semibold text-lg">{formatCurrency(lead.value)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-foreground">{formatDate(lead.created_at)}</p>
              </div>
            </div>

            {lead.closed_at && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Closed</p>
                  <p className="text-foreground">{formatDate(lead.closed_at)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Lead ID</p>
                <p className="text-foreground font-mono text-sm">{lead.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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

