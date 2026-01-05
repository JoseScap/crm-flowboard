import { useUserSettingsHomeContext } from '../UserSettingsHomeContext';

export function UserSettingsHomeHeader() {
  const { apiKeysMetadata } = useUserSettingsHomeContext();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">API Keys</h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys for secure access to your account
          </p>
        </div>
      </div>
      {apiKeysMetadata.length > 0 && (
        <p className="text-sm text-muted-foreground">
          You have {apiKeysMetadata.length} API key{apiKeysMetadata.length !== 1 ? 's' : ''} configured
        </p>
      )}
    </div>
  );
}

