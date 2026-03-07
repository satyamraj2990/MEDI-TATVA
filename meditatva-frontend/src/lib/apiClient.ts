/**
 * Centralized API Client with WebSocket fallback
 * Handles all backend communication with proper error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

// Get API URL from environment or use default
const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  let apiUrl: string;
  
  if (envUrl && envUrl.trim() !== '') {
    // Use explicit environment variable
    apiUrl = envUrl.trim();
  } else {
    // Auto-detect based on current window location (Codespaces compatible)
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    
    // Use relative URL to leverage Vite proxy (works in all environments)
    apiUrl = '/api';
    console.log('🔄 Using Vite proxy for backend connection');
  }
  
  // Ensure URL doesn't end with a slash
  apiUrl = apiUrl.replace(/\/$/, '');
  
  // Detailed logging for debugging
  console.log('╔══════════════════════════════════════════╗');
  console.log('║        API CLIENT INITIALIZATION        ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║ 🔑 VITE_API_URL:', envUrl || '(AUTO-DETECT)');
  console.log('║ 🌐 Window Origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
  console.log('║ 📍 Environment:', import.meta.env.MODE);
  console.log('║ ✅ Final API URL:', apiUrl);
  console.log('╚══════════════════════════════════════════╝');
  
  return apiUrl;
};

export const API_BASE_URL = getApiUrl();

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
  },
  withCredentials: false, // Set to true if you need cookies
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error: AxiosError) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

// Centralized error handler
const handleApiError = (error: AxiosError) => {
  console.error('╔══════════════════════════════════════════╗');
  console.error('║           API ERROR DETAILS             ║');
  console.error('╠══════════════════════════════════════════╣');
  console.error('║ Error Code:', error.code);
  console.error('║ Error Message:', error.message);
  console.error('║ Request URL:', error.config?.url);
  console.error('║ Base URL:', error.config?.baseURL);
  console.error('║ Full URL:', error.config?.baseURL + error.config?.url);
  console.error('╚══════════════════════════════════════════╝');
  
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const message = (error.response.data as any)?.message || error.message;
    
    console.error(`❌ Server Error (${status}):`, message);
    console.error('Response data:', error.response.data);
    
    // Only show toast for critical errors (not for data fetching failures)
    if (status === 401) {
      toast.error('Unauthorized. Please login again.');
    } else if (status === 403) {
      toast.error('Access Denied');
    }
    // Don't show toast for 400, 404, 500 - let components handle fallback silently
  } else if (error.request) {
    // Request was made but no response received
    console.error('❌ No response from server');
    console.error('Request was sent to:', error.config?.baseURL + error.config?.url);
    console.error('This usually means:');
    console.error('  1. Backend is not running');
    console.error('  2. Backend is on wrong port');
    console.error('  3. CORS is blocking the request');
    console.error('  4. Network connectivity issue');
    console.error('XMLHttpRequest details:', error.request);
    // Don't show toast - let components use demo data fallback
  } else {
    // Something else went wrong
    console.error('❌ Request setup error:', error.message);
    toast.error('An unexpected error occurred.');
  }
};

// API Methods
export const api = {
  // Health check
  async healthCheck() {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { status: 'error', ready: false };
    }
  },

  // Test API connectivity
  async testConnection() {
    try {
      const response = await apiClient.get('/test');
      console.log('✅ API Connection Test:', response.data);
      return { success: true, ...response.data };
    } catch (error: any) {
      console.error('❌ API Connection Test Failed:', error);
      const message = error.response?.data?.message || error.message || 'Unknown error';
      return { 
        success: false, 
        error: message,
        details: error.code || 'CONNECTION_ERROR'
      };
    }
  },

  // Medicines
  medicines: {
    async getAll() {
      const response = await apiClient.get('/medicines');
      return response.data;
    },
    
    async search(query: string) {
      const response = await apiClient.get(`/medicines/search`, {
        params: { q: query }
      });
      return response.data;
    },
    
    async getById(id: string) {
      const response = await apiClient.get(`/medicines/${id}`);
      return response.data;
    },
    
    async create(medicine: any) {
      const response = await apiClient.post('/medicines', medicine);
      return response.data;
    },
    
    async update(id: string, medicine: any) {
      const response = await apiClient.put(`/medicines/${id}`, medicine);
      return response.data;
    },
    
    async delete(id: string) {
      const response = await apiClient.delete(`/medicines/${id}`);
      return response.data;
    }
  },

  // Inventory
  inventory: {
    async getAll() {
      const response = await apiClient.get('/inventory');
      return response.data;
    },
    
    async getById(id: string) {
      const response = await apiClient.get(`/inventory/${id}`);
      return response.data;
    },
    
    async updateStock(id: string, data: any) {
      const response = await apiClient.put(`/inventory/${id}/stock`, data);
      return response.data;
    },
    
    async getLowStock(threshold: number = 10) {
      const response = await apiClient.get(`/inventory/low-stock`, {
        params: { threshold }
      });
      return response.data;
    },

    async getLowStockAlerts() {
      const response = await apiClient.get('/inventory/alerts/low-stock');
      return response.data;
    },

    async restock(id: string, data: { quantity: number; notes?: string }) {
      const response = await apiClient.put(`/inventory/${id}/restock`, data);
      return response.data;
    },

    async adjust(id: string, data: { newStock: number; reason?: string }) {
      const response = await apiClient.put(`/inventory/${id}/adjust`, data);
      return response.data;
    }
  },

  // Invoices/Billing
  invoices: {
    async getAll() {
      const response = await apiClient.get('/invoices');
      return response.data;
    },
    
    async getAvailableMedicines() {
      const response = await apiClient.get('/invoices/available-medicines');
      return response.data;
    },
    
    async finalize(invoice: any) {
      const response = await apiClient.post('/invoices/finalize', invoice);
      return response.data;
    },
    
    async getById(id: string) {
      const response = await apiClient.get(`/invoices/${id}`);
      return response.data;
    }
  }
};

// WebSocket/SSE Manager with REST fallback
export class RealtimeManager {
  private eventSource: EventSource | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isUsingFallback = false;
  private callbacks: Map<string, Function> = new Map();
  private reconnectAttempts = 0;
  private reconnectDelay = 3000; // 3 seconds
  private shouldReconnect = true; // Flag to control reconnection
  
  constructor(private endpoint: string) {
    console.log('🔧 RealtimeManager created for:', endpoint);
  }
  
  connect(onUpdate: (data: any) => void, onError?: (error: any) => void) {
    console.log('🔌 Attempting SSE connection to:', this.endpoint);
    this.shouldReconnect = true;
    
    // First, immediately start polling as backup
    console.log('🔄 Starting polling immediately as backup');
    this.startPolling(onUpdate);
    
    try {
      // Build absolute URL for EventSource
      const fullUrl = this.endpoint.startsWith('http') 
        ? this.endpoint 
        : `${window.location.origin}${this.endpoint}`;
      
      console.log('🔗 Full SSE URL:', fullUrl);
      this.eventSource = new EventSource(fullUrl);
      
      this.eventSource.onopen = () => {
        console.log('✅ SSE Connected - realtime updates active');
        this.isUsingFallback = false;
        this.reconnectAttempts = 0;
        // Stop polling since SSE is working
        if (this.pollingInterval) {
          console.log('🛑 Stopping polling - SSE is active');
          clearInterval(this.pollingInterval);
          this.pollingInterval = null;
        }
        if (this.reconnectAttempts === 0) {
          toast.success('Real-time updates connected', { duration: 2000 });
        } else {
          toast.success('Reconnected to real-time updates', { duration: 2000 });
        }
      };
      
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📡 SSE Message received:', data.type || 'update');
          onUpdate(data);
        } catch (error) {
          console.error('❌ Failed to parse SSE message:', error);
        }
      };
      
      this.eventSource.onerror = (error) => {
        console.error('❌ SSE Error:', error);
        
        // Restart polling if not already running
        if (!this.pollingInterval) {
          console.log('🔄 SSE error - ensuring polling is active');
          this.startPolling(onUpdate);
        }
        
        // Only reconnect if we should (not manually disconnected)
        if (!this.shouldReconnect) {
          console.log('🛑 Manual disconnect - not reconnecting');
          return;
        }
        
        // Reconnection attempts with exponential backoff
        this.reconnectAttempts++;
        const backoffDelay = Math.min(this.reconnectDelay * Math.min(this.reconnectAttempts, 5), 15000); // Max 15s
        console.log(`🔄 Will reconnect SSE in ${backoffDelay/1000}s (attempt ${this.reconnectAttempts})...`);
        
        this.reconnectTimeout = setTimeout(() => {
          if (this.shouldReconnect) {
            console.log(`🔄 Reconnecting SSE now (attempt ${this.reconnectAttempts})...`);
            if (this.eventSource) {
              this.eventSource.close();
            }
            this.connect(onUpdate, onError);
          }
        }, backoffDelay);
        
        if (onError) onError(error);
      };
    } catch (error) {
      console.error('❌ Failed to create SSE connection:', error);
      // Polling is already started above, so just log
      console.log('📡 Continuing with polling fallback');
    }
  }
  
  private startPolling(onUpdate: (data: any) => void) {
    if (this.pollingInterval) {
      console.log('🔄 Polling already active');
      return; // Already polling
    }
    
    this.isUsingFallback = true;
    console.log('🔄 Starting REST polling (every 5 seconds)');
    
    // Do initial fetch immediately
    const fetchData = async () => {
      try {
        console.log('📡 Polling: Fetching inventory data...');
        const response = await api.inventory.getAll();
        if (response.success && response.data) {
          console.log(`📡 Polling: Received ${response.data.length} items`);
          onUpdate({
            type: 'inventory-update',
            data: response.data,
            source: 'polling',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('❌ Polling error:', error);
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Poll every 5 seconds
    this.pollingInterval = setInterval(fetchData, 5000);
  }
  
  disconnect(resetFlag = true) {
    console.log('🔌 Disconnecting realtime connection');
    
    if (resetFlag) {
      this.shouldReconnect = false; // Stop auto-reconnection
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (resetFlag) {
      this.isUsingFallback = false;
      this.reconnectAttempts = 0;
    }
  }
  
  isConnected() {
    return this.eventSource?.readyState === EventSource.OPEN || this.isUsingFallback;
  }
  
  getStatus() {
    return {
      connected: this.isConnected(),
      usingFallback: this.isUsingFallback,
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.eventSource?.readyState
    };
  }
}

// Global singleton instance for inventory updates
// This ensures all components share the same connection
let globalRealtimeManager: RealtimeManager | null = null;

export const getGlobalRealtimeManager = (): RealtimeManager => {
  if (!globalRealtimeManager) {
    console.log('🌍 Creating global RealtimeManager singleton');
    // Use relative URL to leverage Vite proxy
    globalRealtimeManager = new RealtimeManager('/api/realtime/inventory');
  }
  return globalRealtimeManager;
};

export const disconnectGlobalRealtime = () => {
  if (globalRealtimeManager) {
    console.log('🌍 Disconnecting global RealtimeManager');
    globalRealtimeManager.disconnect();
    globalRealtimeManager = null;
  }
};

export default apiClient;
