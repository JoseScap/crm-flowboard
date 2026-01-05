import { Key, Eye, Copy, Loader2, RefreshCw, Calendar } from 'lucide-react';
import { useUserSettingsHomeContext } from '../UserSettingsHomeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatDate } from '@/lib/lead-utils';

export function UserSettingsHomeGrid() {
  const { 
    apiKeysMetadata, 
    visibleKeys, 
    loadingKey,
    rotatingKey,
    handleGetApiKey,
    handleRotateApiKey,
    clearVisibleKey 
  } = useUserSettingsHomeContext();

  // Get keys metadata by index (1 and 2)
  const key1Metadata = apiKeysMetadata.find(k => k.key_index === 1);
  const key2Metadata = apiKeysMetadata.find(k => k.key_index === 2);

  // Dummy masked value for password input
  const DUMMY_MASKED_VALUE = '••••••••••••••••••••••••••••••••••••••••';

  const getDisplayValue = (keyIndex: number) => {
    // If key is visible, show it
    if (visibleKeys[keyIndex]) {
      return visibleKeys[keyIndex]!;
    }
    // Otherwise show dummy masked value
    return DUMMY_MASKED_VALUE;
  };

  const handleShowKey = async (keyIndex: number) => {
    await handleGetApiKey(keyIndex);
  };

  const handleCopyKey = async (keyIndex: number) => {
    if (visibleKeys[keyIndex]) {
      try {
        await navigator.clipboard.writeText(visibleKeys[keyIndex]!);
        toast.success('API key copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy to clipboard');
      }
    } else {
      toast.error('Key must be visible to copy. Click the eye icon first.');
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">API Keys</h2>
          <p className="text-sm text-muted-foreground">Manage your API keys for secure access</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* API Key 1 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="api-key-1" className="text-sm font-medium">
              API Key 1
            </Label>
            {key1Metadata && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotateApiKey(1)}
                disabled={rotatingKey[1]}
                className="flex items-center gap-2"
              >
                {rotatingKey[1] ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Rotating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    Rotate
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="api-key-1"
              type={visibleKeys[1] ? 'text' : 'password'}
              value={getDisplayValue(1)}
              readOnly
              placeholder={key1Metadata ? '' : 'API key not initialized'}
              className="font-mono text-sm"
            />
            {key1Metadata && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => visibleKeys[1] ? clearVisibleKey(1) : handleShowKey(1)}
                  disabled={loadingKey[1] || rotatingKey[1]}
                  className="flex-shrink-0"
                  title="View key"
                >
                  {loadingKey[1] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyKey(1)}
                  disabled={loadingKey[1] || rotatingKey[1] || !visibleKeys[1]}
                  className="flex-shrink-0"
                  title="Copy key"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          {key1Metadata && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>
                Last rotated: {key1Metadata.last_rotated_at 
                  ? formatDate(key1Metadata.last_rotated_at) 
                  : 'Never rotated'}
              </span>
            </div>
          )}
          {visibleKeys[1] && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Key will be hidden in 1 minute
            </p>
          )}
        </div>

        {/* API Key 2 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="api-key-2" className="text-sm font-medium">
              API Key 2
            </Label>
            {key2Metadata && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotateApiKey(2)}
                disabled={rotatingKey[2]}
                className="flex items-center gap-2"
              >
                {rotatingKey[2] ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Rotating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    Rotate
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="api-key-2"
              type={visibleKeys[2] ? 'text' : 'password'}
              value={getDisplayValue(2)}
              readOnly
              placeholder={key2Metadata ? '' : 'API key not initialized'}
              className="font-mono text-sm"
            />
            {key2Metadata && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => visibleKeys[2] ? clearVisibleKey(2) : handleShowKey(2)}
                  disabled={loadingKey[2] || rotatingKey[2]}
                  className="flex-shrink-0"
                  title="View key"
                >
                  {loadingKey[2] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyKey(2)}
                  disabled={loadingKey[2] || rotatingKey[2] || !visibleKeys[2]}
                  className="flex-shrink-0"
                  title="Copy key"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          {key2Metadata && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>
                Last rotated: {key2Metadata.last_rotated_at 
                  ? formatDate(key2Metadata.last_rotated_at) 
                  : 'Never rotated'}
              </span>
            </div>
          )}
          {visibleKeys[2] && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Key will be hidden in 1 minute
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

