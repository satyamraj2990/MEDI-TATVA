import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { 
  Home, MapPin, Search, ShoppingCart, FolderOpen, 
  Calendar, MessageCircle, Settings, LogOut, FileBarChart,
  Phone, Mic, Video, Bot, Activity
} from "lucide-react";
import { toast } from "sonner";

// Modular Components
import { PatientHeader } from "@/components/patient/PatientHeader";
import { PatientProfile } from "@/components/patient/PatientProfile";
import { PatientSidebarMenu } from "@/components/patient/PatientSidebarMenu";
import { RecentActivity } from "@/components/patient/RecentActivity";
import { QuickActions } from "@/components/patient/QuickActions";
import { FloatingCallButtons } from "@/components/patient/FloatingCallButtons";

// Page Components
import { NearbyMedicalStoresPage } from "@/pages/NearbyMedicalStoresPage";
import { FindMedicineEnhanced } from "@/pages/FindMedicineEnhanced";
import { MedicineOrders } from "@/components/MedicineOrders";
import { MyMedicineCabinetPage } from "@/pages/MyMedicineCabinetPage";
import { AppointmentsSection } from "@/components/AppointmentsSection";
import MedicalReportAnalyzer from "@/pages/MedicalReportAnalyzer";
import { PrescriptionScanner } from "@/components/PrescriptionScanner";
import { Chatbot } from "@/components/Chatbot";
import { VoiceChatSaarthi } from "@/components/VoiceChatSaarthi";
import { MediCallSarthi } from "@/components/MediCallSarthi";
import MediConferenceCall from "@/components/MediConferenceCall";
import { MedicineAnalyser } from "@/components/MedicineAnalyser";

type Section = "home" | "nearby" | "find-medicine" | "medicine-analyser" | "orders" | "cabinet" | "appointments" | "report-analyzer" | "saarthi" | "settings";

const PremiumPatientDashboardInner = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const [showScanner, setShowScanner] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [showMediCallSarthi, setShowMediCallSarthi] = useState(false);
  const [showConferenceCall, setShowConferenceCall] = useState(false);

  // Ensure auth - redirect to login if not authenticated
  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    if (!isAuth || role !== "patient") {
      navigate("/login?role=patient", { replace: true });
    }
  }, [navigate]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: "home" as Section, icon: Home, label: "Dashboard", description: "Overview & stats" },
    { id: "nearby" as Section, icon: MapPin, label: "Nearby Stores", description: "Find pharmacies" },
    { id: "find-medicine" as Section, icon: Search, label: "Find Medicine", description: "Search meds" },
    { id: "medicine-analyser" as Section, icon: Activity, label: "Medicine Analyser", description: "Compare & substitutes" },
    { id: "orders" as Section, icon: ShoppingCart, label: "My Orders", description: "Track orders" },
    { id: "cabinet" as Section, icon: FolderOpen, label: "Cabinet", description: "Prescriptions" },
    { id: "appointments" as Section, icon: Calendar, label: "Appointments", description: "Book & manage" },
    { id: "report-analyzer" as Section, icon: FileBarChart, label: "Report Analyzer", description: "AI analysis" },
    { id: "saarthi" as Section, icon: Bot, label: "Saarthi", description: "AI Voice Hub" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const renderContent = () => {
    if (showScanner) {
      return (
        <div className="max-w-4xl mx-auto">
          <PrescriptionScanner isOpen={showScanner} onClose={() => setShowScanner(false)} />
        </div>
      );
    }

    switch (activeSection) {
      case "home":
        return (
          <div className="space-y-6">
            <RecentActivity />
            <QuickActions
              onScanClick={() => setShowScanner(true)}
              onFindMedicineClick={() => setActiveSection("find-medicine")}
              onAppointmentClick={() => setActiveSection("appointments")}
              onAIAssistantClick={() => setActiveSection("saarthi")}
              onReportAnalyzerClick={() => setActiveSection("report-analyzer")}
              onVoiceCallClick={() => setShowMediCallSarthi(true)}
              onVoiceChatClick={() => setShowVoiceChat(true)}
              onConferenceCallClick={() => setShowConferenceCall(true)}
            />
          </div>
        );
      case "saarthi":
        return (
          <div className="space-y-6 p-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Saarthi - Your AI Health Companion
              </h2>
              <p className="text-slate-700 dark:text-gray-400">
                Choose how you want to interact with your AI assistant
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Call Saarthi Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMediCallSarthi(true)}
                className="cursor-pointer group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Call Saarthi</h3>
                  <p className="text-white/90 text-sm">
                    One-on-one voice call with your AI health assistant
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              </motion.div>

              {/* Conference Saarthi Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowConferenceCall(true)}
                className="cursor-pointer group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Conference Saarthi</h3>
                  <p className="text-white/90 text-sm">
                    Multi-party conference call with family and doctor
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              </motion.div>

              {/* AI Text Assistant Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowChatbot(true)}
                className="cursor-pointer group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">AI Text Assistant</h3>
                  <p className="text-white/90 text-sm">
                    Chat with AI assistant using text messages
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              </motion.div>
            </div>
          </div>
        );
      case "nearby":
        return <NearbyMedicalStoresPage />;
      case "find-medicine":
        return <FindMedicineEnhanced />;
      case "medicine-analyser":
        return <MedicineAnalyser />;
      case "orders":
        return <MedicineOrders />;
      case "cabinet":
        return <MyMedicineCabinetPage />;
      case "appointments":
        return <AppointmentsSection />;
      case "report-analyzer":
        return <MedicalReportAnalyzer />;
      case "settings":
        return <div className="text-center py-12 text-slate-600 dark:text-gray-500">Settings section</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <PatientHeader 
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-72 border-r border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto"
            >
              <PatientProfile />
              
              <div className="py-4">
                <PatientSidebarMenu
                  menuItems={menuItems}
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                  collapsed={false}
                />
              </div>

              {/* Logout Button */}
              <div className="p-4 border-t border-slate-200 dark:border-gray-800">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
      {showVoiceChat && <VoiceChatSaarthi onClose={() => setShowVoiceChat(false)} />}
      {showMediCallSarthi && <MediCallSarthi onClose={() => setShowMediCallSarthi(false)} />}
      {showConferenceCall && <MediConferenceCall />}

      {/* Floating Call Buttons */}
      <FloatingCallButtons
        onVoiceCall={() => setActiveSection("saarthi")}
        onVoiceChat={() => setActiveSection("saarthi")}
        onConferenceCall={() => setActiveSection("saarthi")}
      />
    </div>
  );
};

const PremiumPatientDashboard = () => (
  <ThemeProvider>
    <OrderProvider>
      <PremiumPatientDashboardInner />
    </OrderProvider>
  </ThemeProvider>
);

export default PremiumPatientDashboard;
