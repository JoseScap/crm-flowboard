import { Calendar, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApplicationsHomeContext } from '../ApplicationsHomeContext';
import { formatDate } from '@/lib/lead-utils';
import { ApplicationMetadata } from './ApplicationsHomeGrid';

interface ApplicationCardProps {
  application: ApplicationMetadata;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { handleConnectApplication, handleDisconnectApplication } = useApplicationsHomeContext();

  const isConnected = !!application.connection;

  const getApplicationIcon = (appId: string) => {
    switch (appId) {
      case 'google-calendar':
        return <Calendar className="w-6 h-6" />;
      default:
        return <ExternalLink className="w-6 h-6" />;
    }
  };

  const getApplicationColorClasses = (appId: string) => {
    switch (appId) {
      case 'google-calendar':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-200 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${getApplicationColorClasses(application.id)} transition-colors`}>
          {getApplicationIcon(application.id)}
        </div>
        {isConnected && (
          <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">
        {application.name}
      </h3>
      
      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
        {application.description}
      </p>
      
      {isConnected && (
        <div className="space-y-2 mb-4">
          {application.connection?.created_at && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Connected {formatDate(application.connection.created_at)}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="pt-4 border-t border-border">
        {isConnected ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleDisconnectApplication(application.id)}
          >
            <X className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => handleConnectApplication(application.id)}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}

