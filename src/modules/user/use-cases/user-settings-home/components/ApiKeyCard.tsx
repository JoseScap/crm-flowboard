import { Key, Calendar, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Tables } from '@/modules/types/supabase.schema';
import { formatDate } from '@/lib/lead-utils';
import { Badge } from '@/components/ui/badge';

interface ApiKeyCardProps {
  apiKey: Tables<'user_api_keys'>;
}

export function ApiKeyCard({ apiKey }: ApiKeyCardProps) {
  // Mask the key for display (show first 8 characters and last 4)
  const maskKey = (key: string) => {
    if (key.length <= 12) {
      return '•'.repeat(key.length);
    }
    return `${key.substring(0, 8)}${'•'.repeat(key.length - 12)}${key.substring(key.length - 4)}`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-200 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-primary/10 text-primary">
          <Key className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
            {apiKey.is_active ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
          <Badge variant="outline">
            Key {apiKey.key_index}
          </Badge>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">API Key</h3>
        <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm break-all">
          {maskKey(apiKey.key)}
        </div>
      </div>
      
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Created: {formatDate(apiKey.created_at)}</span>
        </div>
        {apiKey.last_rotated_at && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-4 h-4" />
            <span>Last rotated: {formatDate(apiKey.last_rotated_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

