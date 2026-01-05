import { Tables } from "@/modules/types/supabase.schema";
import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import supabase from "@/modules/common/lib/supabase";
import { toast } from "sonner";

interface UserSettingsHomeContextType {
  // Loading state
  loadingData: boolean;
  initializingKeys: boolean;
  loadingKey: { [key: number]: boolean };
  rotatingKey: { [key: number]: boolean };

  // API Keys states
  // Only store metadata (id, key_index, created_at, etc.) but NOT the actual key
  apiKeysMetadata: Omit<Tables<'user_api_keys'>, 'key'>[];
  visibleKeys: { [key: number]: string | null }; // Temporarily store visible keys
  visibleKeysTimers: { [key: number]: NodeJS.Timeout | null };

  // Handlers
  handleInitializeApiKeys: () => Promise<void>;
  getData: () => Promise<void>;
  handleGetApiKey: (keyIndex: number) => Promise<void>;
  handleRotateApiKey: (keyIndex: number) => Promise<void>;
  clearVisibleKey: (keyIndex: number) => void;
}

const UserSettingsHomeContext = createContext<UserSettingsHomeContextType | undefined>(undefined);

export function UserSettingsHomeProvider({ children }: { children: ReactNode }) {
  // Loading state
  const [loadingData, setLoadingData] = useState(false);
  const [initializingKeys, setInitializingKeys] = useState(false);
  const [loadingKey, setLoadingKey] = useState<{ [key: number]: boolean }>({});
  const [rotatingKey, setRotatingKey] = useState<{ [key: number]: boolean }>({});

  // API Keys states - only metadata, not the actual keys
  const [apiKeysMetadata, setApiKeysMetadata] = useState<Omit<Tables<'user_api_keys'>, 'key'>[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<{ [key: number]: string | null }>({});
  const [visibleKeysTimers, setVisibleKeysTimers] = useState<{ [key: number]: NodeJS.Timeout | null }>({});

  // Fetch API keys metadata from Supabase using the view
  // The view automatically obfuscates the 'key' column with a dummy value
  // Even if we select 'key', it will return the obfuscated value
  const getData = async () => {
    try {
      setLoadingData(true);
      
      const { data, error } = await supabase
        .from('user_api_keys_view')
        .select('*')
        .order('key_index', { ascending: true });

      if (error) {
        console.error('Error fetching API keys metadata:', error);
        // If error, assume no keys exist
        setApiKeysMetadata([]);
        return;
      }

      if (data) {
        // Map the data to exclude the obfuscated 'key' column
        const metadata = data.map((item: any) => {
          const { key, ...rest } = item;
          return rest;
        });
        setApiKeysMetadata(metadata);
      } else {
        setApiKeysMetadata([]);
      }
    } catch (error) {
      console.error('Error fetching API keys metadata:', error);
      // If error, assume no keys exist
      setApiKeysMetadata([]);
    } finally {
      setLoadingData(false);
    }
  };

  // Get a specific API key (will be visible for 1 minute)
  // Only one key can be visible at a time - if another key is visible, it will be hidden
  const handleGetApiKey = async (keyIndex: number) => {
    try {
      setLoadingKey(prev => ({ ...prev, [keyIndex]: true }));

      // Clear any other visible keys first (only one key visible at a time)
      const otherKeyIndex = keyIndex === 1 ? 2 : 1;
      if (visibleKeys[otherKeyIndex]) {
        clearVisibleKey(otherKeyIndex);
      }

      const { data, error } = await supabase.rpc('get_user_api_key' as any, { p_key_index: keyIndex });

      if (error) {
        console.error(`Error getting API key ${keyIndex}:`, error);
        toast.error(`Error getting API key: ${error.message || 'Unknown error'}`);
        return;
      }

      if (data && typeof data === 'string') {
        // Set the visible key
        setVisibleKeys(prev => ({ ...prev, [keyIndex]: data }));

        // Clear any existing timer for this key
        if (visibleKeysTimers[keyIndex]) {
          clearTimeout(visibleKeysTimers[keyIndex]!);
        }

        // Set timer to hide the key after 1 minute (60000 ms)
        const timer = setTimeout(() => {
          setVisibleKeys(prev => {
            const newState = { ...prev };
            delete newState[keyIndex];
            return newState;
          });
          setVisibleKeysTimers(prev => {
            const newState = { ...prev };
            delete newState[keyIndex];
            return newState;
          });
        }, 60000);

        setVisibleKeysTimers(prev => ({ ...prev, [keyIndex]: timer }));
      }
    } catch (error) {
      console.error(`Error getting API key ${keyIndex}:`, error);
      toast.error('Error getting API key');
    } finally {
      setLoadingKey(prev => ({ ...prev, [keyIndex]: false }));
    }
  };

  // Clear visible key manually
  const clearVisibleKey = (keyIndex: number) => {
    setVisibleKeys(prev => {
      const newState = { ...prev };
      delete newState[keyIndex];
      return newState;
    });

    if (visibleKeysTimers[keyIndex]) {
      clearTimeout(visibleKeysTimers[keyIndex]!);
      setVisibleKeysTimers(prev => {
        const newState = { ...prev };
        delete newState[keyIndex];
        return newState;
      });
    }
  };

  // Rotate a specific API key
  const handleRotateApiKey = async (keyIndex: number) => {
    try {
      setRotatingKey(prev => ({ ...prev, [keyIndex]: true }));

      const { data, error } = await supabase.rpc('rotate_user_api_key' as any, { p_key_index: keyIndex });

      if (error) {
        console.error(`Error rotating API key ${keyIndex}:`, error);
        toast.error(`Error rotating API key: ${error.message || 'Unknown error'}`);
        return;
      }

      if (data) {
        toast.success(`API key ${keyIndex} rotated successfully`);
        // Clear visible key if it was visible (since it's now rotated)
        clearVisibleKey(keyIndex);
        // Refetch metadata to get updated last_rotated_at
        await getData();
      }
    } catch (error) {
      console.error(`Error rotating API key ${keyIndex}:`, error);
      toast.error('Error rotating API key');
    } finally {
      setRotatingKey(prev => ({ ...prev, [keyIndex]: false }));
    }
  };

  // Initialize API keys by calling the Supabase function
  const handleInitializeApiKeys = async () => {
    try {
      setInitializingKeys(true);
      
      const { data, error } = await supabase.rpc('initialize_api_keys');

      if (error) {
        console.error('Error initializing API keys:', error);
        toast.error(`Error initializing API keys: ${error.message || 'Unknown error'}`);
        return;
      }

      if (data) {
        toast.success('API keys initialized successfully');
        // Refetch the API keys metadata to display them
        await getData();
      }
    } catch (error) {
      console.error('Error initializing API keys:', error);
      toast.error('Error initializing API keys');
    } finally {
      setInitializingKeys(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    getData();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(visibleKeysTimers).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  const value: UserSettingsHomeContextType = {
    // Loading state
    loadingData,
    initializingKeys,
    loadingKey,
    rotatingKey,

    // API Keys states
    apiKeysMetadata,
    visibleKeys,
    visibleKeysTimers,

    // Handlers
    handleInitializeApiKeys,
    getData,
    handleGetApiKey,
    handleRotateApiKey,
    clearVisibleKey,
  };

  return (
    <UserSettingsHomeContext.Provider value={value}>
      {children}
    </UserSettingsHomeContext.Provider>
  );
}

export function useUserSettingsHomeContext() {
  const context = useContext(UserSettingsHomeContext);
  if (!context) {
    throw new Error('useUserSettingsHomeContext must be used within a UserSettingsHomeProvider');
  }
  return context;
}

