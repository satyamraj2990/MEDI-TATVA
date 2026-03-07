import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense, lazy } from "react";

// Simple loading component with timeout protection
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid rgba(6, 182, 212, 0.2)',
        borderTopColor: '#06b6d4',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 16px'
      }}></div>
      <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading page...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  </div>
);

// Lazy load ALL pages with proper error handling
const Index = lazy(() => 
  import("./pages/Index").catch((err) => {
    console.error("Failed to load Index page:", err);
    return import("./pages/SimpleLanding");
  })
);
const CinematicLanding = lazy(() => import("./pages/CinematicLanding"));
const Login = lazy(() => import("./pages/Login"));
const PremiumPatientDashboard = lazy(() => import("./pages/PremiumPatientDashboardNew"));
const AIHealthAssistantPage = lazy(() => import("./pages/AIHealthAssistantPage"));
const MedicalReportAnalyzer = lazy(() => import("./pages/MedicalReportAnalyzer"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Pharmacy dashboard components
const PharmacyDashboardResponsive = lazy(() => 
  import("./pages/PharmacyDashboardResponsive").then(m => ({ default: m.PharmacyDashboardResponsive }))
);
const OrderRequestsTab = lazy(() => 
  import("./pages/pharmacy-tabs/OrderRequestsTab").then(m => ({ default: m.OrderRequestsTab }))
);
const BillingTab = lazy(() => 
  import("./pages/pharmacy-tabs/BillingTab").then(m => ({ default: m.BillingTab }))
);
const InventoryTab = lazy(() => 
  import("./pages/pharmacy-tabs/InventoryTab").then(m => ({ default: m.InventoryTab }))
);
const AnalyticsTab = lazy(() => 
  import("./pages/pharmacy-tabs/AnalyticsTab").then(m => ({ default: m.AnalyticsTab }))
);
const ChatTab = lazy(() => 
  import("./pages/pharmacy-tabs/ChatTab").then(m => ({ default: m.ChatTab }))
);
const AIInsightsTab = lazy(() => 
  import("./pages/pharmacy-tabs/AIInsightsTab").then(m => ({ default: m.AIInsightsTab }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1, // Only retry once to prevent infinite loading
      retryDelay: 1000,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="meditatva-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/cinematic" element={<CinematicLanding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/patient/premium" element={<PremiumPatientDashboard />} />
                <Route path="/ai-assistant" element={<AIHealthAssistantPage />} />
                <Route path="/medical-report-analyzer" element={<MedicalReportAnalyzer />} />
                
                {/* Pharmacy Dashboard with Nested Routes */}
                <Route path="/pharmacy/dashboard" element={<PharmacyDashboardResponsive />}>
                  <Route index element={<OrderRequestsTab />} />
                  <Route path="order-requests" element={<OrderRequestsTab />} />
                  <Route path="billing" element={<BillingTab />} />
                  <Route path="inventory" element={<InventoryTab />} />
                  <Route path="analytics" element={<AnalyticsTab />} />
                  <Route path="chat" element={<ChatTab />} />
                  <Route path="ai" element={<AIInsightsTab />} />
                </Route>
                
                {/* Catch-all for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
