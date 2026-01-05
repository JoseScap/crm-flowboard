import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRef, useEffect, useState } from 'react';
import { WhatsAppMessage } from '../LeadDetailsContext';

interface WhatsAppChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: WhatsAppMessage[];
  contactName?: string;
  pagingNext?: string;
  sendingMessage: boolean;
  loadingMore: boolean;
  messageText: string;
  onMessageTextChange: (text: string) => void;
  onSendMessage: () => void;
  onLoadMore: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function WhatsAppChatModal({
  open,
  onOpenChange,
  messages,
  contactName,
  pagingNext,
  sendingMessage,
  loadingMore,
  messageText,
  onMessageTextChange,
  onSendMessage,
  onLoadMore,
  onKeyPress,
}: WhatsAppChatModalProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const lastMessageIdRef = useRef<string | null>(null);

  const formatTimestamp = (timestamp: string) => {
    try {
      // Convert Unix timestamp to Date
      const date = new Date(parseInt(timestamp) * 1000);
      return format(date, 'HH:mm');
    } catch {
      return '';
    }
  };

  const sortedMessages = [...messages].sort((a, b) => {
    return parseInt(a.timestamp) - parseInt(b.timestamp);
  });

  // Scroll to bottom when modal opens (first render)
  useEffect(() => {
    if (open && isInitialLoad && messages.length > 0) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        scrollToBottom();
        setIsInitialLoad(false);
        // Store the last message ID
        if (sortedMessages.length > 0) {
          lastMessageIdRef.current = sortedMessages[sortedMessages.length - 1].id;
        }
      }, 100);
    }
  }, [open, isInitialLoad, messages.length, sortedMessages]);

  // Reset initial load flag when modal closes
  useEffect(() => {
    if (!open) {
      setIsInitialLoad(true);
      lastMessageIdRef.current = null;
    }
  }, [open]);

  // Scroll to bottom when new messages are added at the end (not when loading more)
  useEffect(() => {
    if (open && !loadingMore && !isInitialLoad && sortedMessages.length > 0) {
      const lastMessage = sortedMessages[sortedMessages.length - 1];
      
      // Only scroll if the last message changed (new message added at the end)
      // If loading more, messages are added at the beginning, so last message stays the same
      if (lastMessage.id !== lastMessageIdRef.current) {
        setTimeout(() => {
          scrollToBottom();
        }, 50);
        lastMessageIdRef.current = lastMessage.id;
      }
    }
  }, [sortedMessages, open, loadingMore, isInitialLoad]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            WhatsApp Chat {contactName && `- ${contactName}`}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {pagingNext && (
              <div className="flex justify-center py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    'Cargar más mensajes'
                  )}
                </Button>
              </div>
            )}
            {sortedMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No hay mensajes disponibles
              </div>
            ) : (
              sortedMessages.map((message) => {
                const isInbound = message.kapso.direction === 'inbound';
                const messageTime = formatTimestamp(message.timestamp);
                const messageTextContent = message.text?.body || '';

                return (
                  <div
                    key={message.id}
                    className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isInbound
                          ? 'bg-muted text-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {messageTextContent}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isInbound
                            ? 'text-muted-foreground'
                            : 'text-primary-foreground/70'
                        }`}
                      >
                        {messageTime}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Escribe un mensaje..."
              className="flex-1"
              value={messageText}
              onChange={(e) => onMessageTextChange(e.target.value)}
              onKeyPress={onKeyPress}
              disabled={sendingMessage}
            />
            <Button 
              size="icon" 
              onClick={onSendMessage}
              disabled={sendingMessage || !messageText.trim()}
            >
              {sendingMessage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

