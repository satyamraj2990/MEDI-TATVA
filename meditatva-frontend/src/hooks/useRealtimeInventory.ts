import { useEffect, useRef, useState } from 'react';
import { getGlobalRealtimeManager } from '@/lib/apiClient';

interface InventoryUpdate {
  type: 'inventory-update' | 'initial-inventory';
  timestamp: string;
  data: any;
}

interface UseRealtimeInventoryOptions {
  onUpdate?: (data: any) => void;
  autoConnect?: boolean;
}

/**
 * Custom hook for real-time inventory updates via SSE with REST fallback
 * Uses a global singleton instance to ensure only one connection across all components
 * 
 * @param options - Configuration options
 * @returns { isConnected, error, reconnect }
 */
export const useRealtimeInventory = (options: UseRealtimeInventoryOptions = {}) => {
  const { onUpdate, autoConnect = true } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbackRef = useRef(onUpdate);
  const isConnectedRef = useRef(false);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  const connect = () => {
    // Use global singleton
    const manager = getGlobalRealtimeManager();
    
    // Check if already connected
    if (manager.isConnected() && isConnectedRef.current) {
      console.log('✅ Already connected to realtime updates (global instance)');
      setIsConnected(true);
      return;
    }

    console.log('🔌 Connecting to global realtime instance...');
    isConnectedRef.current = true;
    
    manager.connect(
      (data) => {
        setIsConnected(true);
        setError(null);
        if (callbackRef.current) {
          callbackRef.current(data);
        }
      },
      (err) => {
        console.error('❌ Realtime error:', err);
        setError('Connection error');
        // Don't set isConnected to false - polling fallback might be active
        const status = manager.getStatus();
        setIsConnected(status.connected);
      }
    );
  };

  const disconnect = () => {
    console.log('🔌 Component disconnecting from realtime updates');
    isConnectedRef.current = false;
    setIsConnected(false);
    // Note: We don't disconnect the global manager, just this component
    // The manager stays alive for other components
  };

  const reconnect = () => {
    console.log('🔄 Component requesting reconnect...');
    disconnect();
    setTimeout(() => connect(), 1000);
  };

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      // Just mark this component as disconnected
      // Don't kill the global connection
      isConnectedRef.current = false;
    };
  }, [autoConnect]);

  return {
    isConnected,
    error,
    reconnect
  };
};
