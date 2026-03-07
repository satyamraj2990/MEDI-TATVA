// Backup of original App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import CinematicLanding from "./pages/CinematicLanding";
import Login from "./pages/Login";
import PremiumPatientDashboard from "./pages/PremiumPatientDashboardNew";
import AIHealthAssistantPage from "./pages/AIHealthAssistantPage";
import MedicalReportAnalyzer from "./pages/MedicalReportAnalyzer";
import NotFound from "./pages/NotFound";

// Import pharmacy dashboard components directly for faster loading
import { PharmacyDashboardResponsive } from "./pages/PharmacyDashboardResponsive";
import { OrderRequestsTab } from "./pages/pharmacy-tabs/OrderRequestsTab";
import { BillingTab } from "./pages/pharmacy-tabs/BillingTab";
import { InventoryTab } from "./pages/pharmacy-tabs/InventoryTab";
import { AnalyticsTab } from "./pages/pharmacy-tabs/AnalyticsTab";
import { ChatTab } from "./pages/pharmacy-tabs/ChatTab";
import { AIInsightsTab } from "./pages/pharmacy-tabs/AIInsightsTab";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="meditatva-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
