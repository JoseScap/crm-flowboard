import { Key, Loader2 } from 'lucide-react';
import { useUserSettingsHomeContext } from '../UserSettingsHomeContext';
import { Button } from '@/components/ui/button';

export function UserSettingsHomeEmptyState() {
  const { apiKeysMetadata, handleInitializeApiKeys, initializingKeys } = useUserSettingsHomeContext();

  // Only show if no API keys exist at all
  if (apiKeysMetadata.length > 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 w-full">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Key className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">API Keys Not Initialized</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Las API keys aún no se han inicializado. Por favor, genérelas para habilitar el acceso seguro a su cuenta.
        </p>
        <Button
          onClick={handleInitializeApiKeys}
          disabled={initializingKeys}
          className="flex items-center gap-2"
        >
          {initializingKeys ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Key className="w-4 h-4" />
              Generar API Keys
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

