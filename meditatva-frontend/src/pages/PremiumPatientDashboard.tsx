import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { MedicalCabinet } from "@/components/MedicalCabinet";
import { AppointmentsSection } from "@/components/AppointmentsSection";
import { MedicineOrders } from "@/components/MedicineOrders";
import { HealthReminders } from "@/components/HealthReminders";
import { Chatbot } from "@/components/Chatbot";
import { VoiceChatSaarthi } from "@/components/VoiceChatSaarthi";
import { MediCallSarthi } from "@/components/MediCallSarthi";
import MediConferenceCall from "@/components/MediConferenceCall";
import SimpleVoiceAssistant from "@/components/SimpleVoiceAssistant";
import { MedicineAnalyser } from "@/components/MedicineAnalyser";
import { NearbyMedicalStoresPage } from "@/pages/NearbyMedicalStoresPage";
import { FindMedicineEnhanced } from "@/pages/FindMedicineEnhanced";
import { MyMedicineCabinetPage } from "@/pages/MyMedicineCabinetPage";
import MedicalReportAnalyzer from "@/pages/MedicalReportAnalyzer";
import { PrescriptionScanner } from "@/components/PrescriptionScanner";
import { MedicineAvailabilitySudoku } from "@/components/MedicineAvailabilitySudoku";
import {
  Home, Calendar, ShoppingCart, Bell, FolderOpen,
  MapPin, MessageCircle, LogOut, Menu, X,
  Pill, Camera, Search, Activity, Heart, ChevronRight,
  Scan, Zap, TrendingUp, Sparkles, Settings, MessageSquare, Mic, Bot, Phone, FileBarChart
} from "lucide-react";
import { toast } from "sonner";

type Section = "home" | "nearby" | "find-medicine" | "medicine-analyser" | "orders" | "cabinet" | "appointments" | "chat" | "report-analyzer" | "settings";

const PremiumPatientDashboardInner = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("nearby");
  // Initialize sidebar as collapsed on mobile, open on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [showMediCallSarthi, setShowMediCallSarthi] = useState(false);
  const [showConferenceCall, setShowConferenceCall] = useState(false);
  const [showSimpleVoice, setShowSimpleVoice] = useState(false);

  // Ensure demo auth for patient
  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    if (!isAuth || role !== "patient") {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "patient");
    }
  }, []);

  // Handle window resize to auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced menu items with new order for Indian healthcare focus
  const menuItems = [
    {
      id: "nearby" as Section,
      icon: MapPin,
      label: "Nearby Stores",
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      description: "Find pharmacies & hospitals",
    },
    {
      id: "find-medicine" as Section,
      icon: Search,
      label: "Find Medicine",
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      description: "Search & locate meds",
    },
    {
      id: "medicine-analyser" as Section,
      icon: Activity,
      label: "Medicine Analyser",
      gradient: "from-purple-500 via-pink-500 to-rose-500",
      description: "Compare & find substitutes",
    },
    {
      id: "orders" as Section,
      icon: ShoppingCart,
      label: "Orders",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      description: "Track & reorder",
    },
    {
      id: "cabinet" as Section,
      icon: FolderOpen,
      label: "Medical Cabinet",
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      description: "Prescriptions & family",
    },
    {
      id: "report-analyzer" as Section,
      icon: FileBarChart,
      label: "Report Analyzer",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      description: "AI-powered health reports",
    },
    {
      id: "appointments" as Section,
      icon: Calendar,
      label: "Appointments",
      gradient: "from-amber-500 via-orange-500 to-rose-500",
      description: "Book & manage visits",
    },
    {
      id: "chat" as Section,
      icon: MessageCircle,
      label: "Chat",
      gradient: "from-teal-400 via-cyan-400 to-blue-400",
      description: "AI Health Assistant",
    },
    {
      id: "settings" as Section,
      icon: Settings,
      label: "Settings",
      gradient: "from-slate-600 via-gray-600 to-zinc-600",
      description: "Profile & preferences",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const quickStats = [
    { label: "Upcoming", value: "3", icon: Calendar, gradient: "from-blue-500 to-cyan-400", change: "+2" },
    { label: "Active Orders", value: "5", icon: ShoppingCart, gradient: "from-green-500 to-emerald-400", change: "+1" },
    { label: "Reminders", value: "12", icon: Bell, gradient: "from-orange-500 to-amber-400", change: "0" },
    { label: "Health Score", value: "91%", icon: Heart, gradient: "from-emerald-500 to-teal-400", change: "+5%" },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden overflow-y-auto transition-colors duration-500">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 bg-[rgb(var(--bg-primary))] transition-colors duration-500" />
      
      {/* Gradient Orbs - Responsive & Theme-aware */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-56 h-56 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Floating Grid Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
           style={{
             backgroundImage: `linear-gradient(rgb(var(--text-primary)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--text-primary)) 1px, transparent 1px)`,
             backgroundSize: "50px 50px",
           }}
      />

      {/* Mobile Menu Overlay */}
      {!sidebarCollapsed && (
        <motion.div
          className="fixed inset-0 bg-black/50 md:hidden"
          style={{ zIndex: 998 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <div className="flex relative z-10">
        {/* Premium Glassmorphism Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            opacity: sidebarCollapsed ? 0 : 1
          }}
          className={`
            h-screen fixed left-0 top-0
            transition-all duration-300 ease-in-out
            ${sidebarCollapsed 
              ? 'hidden md:block md:-translate-x-0 md:w-20 md:opacity-100' 
              : 'block translate-x-0 w-full max-w-[85vw] sm:max-w-[320px]'
            }
          `}
          style={{ zIndex: 999 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`h-full backdrop-blur-sm sm:backdrop-blur-2xl bg-white/90 sm:bg-white/80 dark:bg-slate-950/95 sm:dark:bg-slate-950/90 border-r border-[rgb(var(--border-color))] dark:border-slate-800 shadow-2xl transition-colors duration-500 ${sidebarCollapsed ? 'p-2 md:p-3' : 'p-4 sm:p-6'}`}
            style={{
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.1)",
            }}
          >
            <div className="flex flex-col h-full">
              {/* Logo Section - Fixed at top */}
              <motion.div 
                className="mb-8 flex-shrink-0"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    className="relative h-14 w-14 flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    <img 
                      src="/meditatva-logo.png?v=3" 
                      alt="MediTatva Logo" 
                      className="h-14 w-14 object-contain"
                    />
                  </motion.div>
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        MediTatva
                      </h1>
                      <p className="text-xs font-medium text-[rgb(var(--text-secondary))]">Premium Health Care</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* User Profile Card */}
              {!sidebarCollapsed && (
                <motion.div
                  className="flex-shrink-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-4 mb-6 bg-gradient-to-br from-white/60 to-white/40 dark:from-slate-900/80 dark:to-slate-950/90 backdrop-blur-xl border-2 border-white/20 dark:border-cyan-500/20 shadow-xl dark:shadow-cyan-500/10">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14 ring-4 ring-white/50 dark:ring-cyan-500/30 ring-offset-2 dark:ring-offset-slate-950">
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=patient" />
                          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-lg">
                            JD
                          </AvatarFallback>
                        </Avatar>
                        <motion.div
                          className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[rgb(var(--text-primary))] truncate">Aarav Sharma</p>
                        <p className="text-xs text-[rgb(var(--text-secondary))] truncate">aarav.sharma@gmail.com</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[rgb(var(--border-color))]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">Health Score</span>
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">91%</span>
                        </div>
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                          initial={{ width: 0 }}
                          animate={{ width: "91%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Navigation Menu - Scrollable */}
              <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent hover:scrollbar-thumb-blue-400"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#93C5FD transparent'
                }}
              >
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="relative"
                    >
                      <motion.button
                        onClick={() => {
                          setActiveSection(item.id);
                          // Close sidebar on mobile after selection
                          if (window.innerWidth < 768) {
                            setSidebarCollapsed(true);
                          }
                        }}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden min-h-[48px] touch-manipulation
                          ${isActive 
                            ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-2xl shadow-cyan-500/20 scale-[1.02]' 
                            : 'text-[rgb(var(--text-secondary))] hover:bg-gradient-to-r hover:' + item.gradient + ' hover:bg-opacity-10 hover:shadow-lg hover:shadow-cyan-500/10'
                          }
                        `}
                        whileHover={{ 
                          scale: isActive ? 1.03 : 1.02, 
                          x: 6,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Glowing border effect on hover */}
                        {!isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: `linear-gradient(135deg, transparent, rgba(6, 182, 212, 0.1), transparent)`,
                              boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
                            }}
                          />
                        )}

                        {/* Shimmer Effect for active item */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                          />
                        )}
                        
                        <div className={`
                          h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 relative z-10
                          ${isActive ? 'bg-white/25 shadow-lg' : 'bg-gradient-to-br ' + item.gradient + ' group-hover:scale-110 group-hover:rotate-3'}
                        `}>
                          <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white'} transition-transform duration-300 group-hover:scale-110`} />
                        </div>
                        
                        {!sidebarCollapsed && (
                          <div className="flex-1 text-left relative z-10">
                            <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-[rgb(var(--text-primary))] group-hover:text-cyan-600 dark:group-hover:text-cyan-400'} transition-colors duration-300`}>
                              {item.label}
                            </p>
                            <p className={`text-xs ${isActive ? 'text-white/90' : 'text-[rgb(var(--text-secondary))] group-hover:text-cyan-500/80'} transition-colors duration-300`}>
                              {item.description}
                            </p>
                          </div>
                        )}
                        
                        {!sidebarCollapsed && isActive && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="relative z-10"
                          >
                            <ChevronRight className="h-5 w-5 text-white" />
                          </motion.div>
                        )}
                      </motion.button>

                      {/* Tooltip for collapsed sidebar */}
                      {sidebarCollapsed && (
                        <motion.div
                          className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl"
                          initial={{ opacity: 0, x: -10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                        >
                          {item.label}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </nav>

              {/* Logout Button - Fixed at bottom */}
              <motion.div
                className="mt-6 flex-shrink-0 pt-6 border-t border-[rgb(var(--border-color))]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-xl rounded-2xl h-12 group relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-white/20 to-rose-500/0"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                    <motion.div
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LogOut className="h-5 w-5" />
                    </motion.div>
                    {!sidebarCollapsed && <span className="font-semibold">Logout</span>}
                  </div>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div className={`
          flex-1 w-full transition-all duration-300
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-[280px]'}
        `}>
          {/* Premium Floating Header */}
          <motion.header
            className="sticky top-2 sm:top-4 mx-3 sm:mx-6 mb-4 sm:mb-6 z-30 rounded-2xl sm:rounded-3xl backdrop-blur-sm sm:backdrop-blur-2xl bg-white/90 sm:bg-white/70 dark:bg-slate-950/95 sm:dark:bg-slate-950/85 border-2 border-white/20 dark:border-slate-800/50 shadow-2xl transition-colors duration-500"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
            style={{
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="h-11 w-11 rounded-xl hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-cyan-500/10"
                  >
                    <motion.div
                      animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </motion.div>
                  </Button>

                  <div className="flex items-center gap-3">
                    {menuItems.find(item => item.id === activeSection) && (
                      <>
                        <motion.div
                          className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${menuItems.find(item => item.id === activeSection)?.gradient} flex items-center justify-center shadow-lg`}
                          whileHover={{ rotate: 5, scale: 1.05 }}
                        >
                          {(() => {
                            const Icon = menuItems.find(item => item.id === activeSection)?.icon;
                            return Icon ? <Icon className="h-6 w-6 text-white" /> : null;
                          })()}
                        </motion.div>
                        <div>
                          <p className="text-sm font-bold text-[rgb(var(--text-primary))]">
                            {menuItems.find(item => item.id === activeSection)?.label}
                          </p>
                          <p className="text-xs text-[rgb(var(--text-secondary))]">
                            {menuItems.find(item => item.id === activeSection)?.description}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                  {/* Quick Scan Button */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setShowScanner(true)}
                      className="gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl shadow-lg h-11"
                    >
                      <Camera className="h-4 w-4" />
                      <span className="hidden md:inline font-semibold">Scan</span>
                    </Button>
                  </motion.div>

                  {/* Activity Badge */}
                  <motion.div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Activity className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700 hidden sm:inline">Active</span>
                  </motion.div>

                  {/* Notifications */}
                  <motion.div whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative h-11 w-11 rounded-xl hover:bg-blue-500/10"
                    >
                      <Bell className="h-5 w-5" />
                      <motion.span
                        className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full border-2 border-white dark:border-slate-900"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </Button>
                  </motion.div>

                  {/* Profile Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Avatar className="h-11 w-11 ring-4 ring-cyan-500/30 dark:ring-cyan-400/30 cursor-pointer transition-all duration-300 hover:ring-cyan-500/50">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=aarav" />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-base">
                        AS
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </div>
              </div>

              {/* Simplified Global Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500 transition-all duration-300 group-hover:scale-110" />
                  <Input
                    type="text"
                    placeholder="Search medicines, doctors, stores, or orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 rounded-2xl bg-white/60 dark:bg-slate-900/70 border-2 border-cyan-500/20 dark:border-cyan-400/30 focus:border-cyan-500 dark:focus:border-cyan-400 backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 focus:shadow-xl focus:shadow-cyan-500/20 dark:focus:shadow-cyan-400/30"
                  />
                </div>
              </motion.div>
            </div>
          </motion.header>

          {/* Page Content with Animations */}
          <motion.main
            className="px-6 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <AnimatePresence mode="wait">
              {activeSection === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Welcome Section */}
                  <div>
                    <motion.h2
                      className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Welcome back, John! 👋
                    </motion.h2>
                    <motion.p
                      className="text-[rgb(var(--text-secondary))] mt-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Here's your comprehensive health overview
                    </motion.p>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickStats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.05, y: -5 }}
                        >
                          <Card className="p-6 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-xl border-2 border-white/20 dark:border-slate-700/30 dark:hover:border-cyan-500/40 shadow-xl hover:shadow-2xl dark:shadow-cyan-500/10 transition-all duration-300 relative overflow-hidden group">
                            {/* Glow Effect */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300`} />
                            
                            <div className="relative z-10">
                              <div className="flex items-start justify-between">
                                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg dark:shadow-xl`}>
                                  <Icon className="h-7 w-7 text-white" />
                                </div>
                                <Badge className="bg-white/50 dark:bg-slate-700/50 text-xs font-bold">
                                  {stat.change}
                                </Badge>
                              </div>
                              <div className="mt-4">
                                <p className="text-3xl font-bold text-[rgb(var(--text-primary))]">{stat.value}</p>
                                <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">{stat.label}</p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Recent Activity & Quick Actions Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Appointments */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="p-6 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-xl border-2 border-white/20 dark:border-violet-500/20 shadow-xl dark:shadow-violet-500/10">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-violet-500 dark:text-violet-400" />
                            Recent Appointments
                          </h3>
                          <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                        </div>
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <motion.div
                              key={i}
                              className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all cursor-pointer group"
                              whileHover={{ scale: 1.02, x: 4 }}
                            >
                              <Avatar className="h-12 w-12 ring-2 ring-violet-500/20">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=doctor${i}`} />
                                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                  Dr
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[rgb(var(--text-primary))] truncate">Dr. Sarah Wilson</p>
                                <p className="text-xs text-[rgb(var(--text-secondary))]">Cardiologist • Nov 15, 10:00 AM</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-[rgb(var(--text-secondary))] group-hover:text-violet-500 transition-colors" />
                            </motion.div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>

                    {/* Today's Reminders */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="p-6 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-xl border-2 border-white/20 dark:border-orange-500/20 shadow-xl dark:shadow-orange-500/10">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                            <Bell className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                            Today's Reminders
                          </h3>
                          <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                        </div>
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <motion.div
                              key={i}
                              className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all cursor-pointer group"
                              whileHover={{ scale: 1.02, x: 4 }}
                            >
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                <Pill className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[rgb(var(--text-primary))] truncate">Blood Pressure Medicine</p>
                                <p className="text-xs text-[rgb(var(--text-secondary))]">9:00 AM • Daily</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-[rgb(var(--text-secondary))] group-hover:text-orange-500 transition-colors" />
                            </motion.div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Medicine Availability Sudoku */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8"
                  >
                    <MedicineAvailabilitySudoku />
                  </motion.div>
                </motion.div>
              )}

              {activeSection === 'appointments' && (
                <motion.div
                  key="appointments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <AppointmentsSection />
                </motion.div>
              )}

              {activeSection === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <MedicineOrders />
                </motion.div>
              )}

              {activeSection === 'cabinet' && (
                <motion.div
                  key="cabinet"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <MyMedicineCabinetPage />
                </motion.div>
              )}

              {activeSection === 'report-analyzer' && (
                <motion.div
                  key="report-analyzer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <MedicalReportAnalyzer />
                </motion.div>
              )}

              {activeSection === 'nearby' && (
                <motion.div
                  key="nearby"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <NearbyMedicalStoresPage />
                </motion.div>
              )}

              {activeSection === 'find-medicine' && (
                <motion.div
                  key="find-medicine"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {/* 
                    CRITICAL: Always pass onNavigateToOrders to embedded components
                    This ensures "View My Orders" button switches sections instead of changing routes
                    Without this prop, clicking the button would reload the entire page
                  */}
                  <FindMedicineEnhanced 
                    onNavigateToOrders={() => {
                      setActiveSection('orders'); // Switch to orders section
                      toast.success('Navigating to your orders...');
                    }}
                  />
                </motion.div>
              )}

              {activeSection === 'medicine-analyser' && (
                <motion.div
                  key="medicine-analyser"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <MedicineAnalyser />
                </motion.div>
              )}

              {activeSection === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">AI Saarthi Assistant</h2>
                      <p className="text-[rgb(var(--text-secondary))]">
                        Chat with your AI Saarthi in 10+ languages • Voice & Text Support
                      </p>
                    </div>

                    {/* AI Saarthi Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Medi Call Sarthi - Phone Call Assistant */}
                      <Card 
                        onClick={() => setShowMediCallSarthi(true)}
                        className="p-8 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm border-2 border-cyan-200 dark:border-cyan-700/20 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="text-center space-y-4">
                          <div className="flex justify-center">
                            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                              <Phone className="h-12 w-12 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                              📞 Medi Call Sarthi
                            </h3>
                            <p className="text-[rgb(var(--text-secondary))] mt-2 text-sm">
                              AI Voice Assistant for Phone Calls<br/>
                              10+ Indian Languages • Symptom Analysis
                            </p>
                          </div>
                          <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1">
                            🎙️ Voice Medical Care
                          </Badge>
                        </div>
                      </Card>

                      {/* Simple Voice Assistant - NEW EFFICIENT VERSION */}
                      <Card 
                        onClick={() => setShowSimpleVoice(true)}
                        className="p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 backdrop-blur-sm border-2 border-green-200 dark:border-green-700/20 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="text-center space-y-4">
                          <div className="flex justify-center">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg">
                              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              🎙️ Voice Health Assistant
                            </h3>
                            <p className="text-[rgb(var(--text-secondary))] mt-2 text-sm">
                              Simple • Fast • Free<br/>
                              No Phone Calls • Browser-Based
                            </p>
                          </div>
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1">
                            ⚡ Instant Medical Answers
                          </Badge>
                        </div>
                      </Card>

                      {/* Conference Call - OLD TWILIO VERSION */}
                      <Card 
                        onClick={() => setShowConferenceCall(true)}
                        className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-violet-900/20 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-700/20 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="text-center space-y-4">
                          <div className="flex justify-center">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              👥 Conference Call
                            </h3>
                            <p className="text-[rgb(var(--text-secondary))] mt-2 text-sm">
                              Group Medical Consultation<br/>
                              Multiple People • One AI Assistant
                            </p>
                          </div>
                          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1">
                            🆕 Family Health Together
                          </Badge>
                        </div>
                      </Card>

                      {/* Voice Chat with AI Saarthi */}
                      <Card 
                        onClick={() => setShowVoiceChat(true)}
                        className="p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700/20 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="text-center space-y-4">
                          <div className="flex justify-center">
                            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                              <Mic className="h-12 w-12 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              🎙️ Voice Chat Saarthi
                            </h3>
                            <p className="text-[rgb(var(--text-secondary))] mt-2 text-sm">
                              Talk with your calm wellness guide<br/>
                              Voice-based chat • Meditation-friendly
                            </p>
                          </div>
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                            🎯 Voice-First Experience
                          </Badge>
                        </div>
                      </Card>
                    </div>

                    {/* Features Overview */}
                    <Card className="p-6 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-sm border-2 border-white/20 dark:border-indigo-500/20 shadow-xl">
                      <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                        <Bot className="h-6 w-6 text-indigo-500" />
                        AI Saarthi Features
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">🌐</span>
                          </div>
                          <div>
                            <p className="font-semibold text-[rgb(var(--text-primary))]">10+ Languages</p>
                            <p className="text-sm text-[rgb(var(--text-secondary))]">English, Hindi, Tamil, Telugu, Bengali & more</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">🎙️</span>
                          </div>
                          <div>
                            <p className="font-semibold text-[rgb(var(--text-primary))]">Voice Chat</p>
                            <p className="text-sm text-[rgb(var(--text-secondary))]">Talk naturally with AI Saarthi</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">💊</span>
                          </div>
                          <div>
                            <p className="font-semibold text-[rgb(var(--text-primary))]">Medicine Substitutes</p>
                            <p className="text-sm text-[rgb(var(--text-secondary))]">Find affordable alternatives instantly</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">🩺</span>
                          </div>
                          <div>
                            <p className="font-semibold text-[rgb(var(--text-primary))]">Symptom Analysis</p>
                            <p className="text-sm text-[rgb(var(--text-secondary))]">Get AI-powered health insights</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeSection === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-4xl font-bold text-[rgb(var(--text-primary))] mb-2">Settings</h2>
                    <p className="text-[rgb(var(--text-secondary))]">Manage your account and preferences</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-sm sm:backdrop-blur-xl border-2 border-white/20 dark:border-blue-500/20 shadow-xl dark:shadow-blue-500/10">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                          <Activity className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-[rgb(var(--text-primary))] mb-1">Profile Settings</h3>
                          <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">Update your personal information and contact details</p>
                          <Button size="sm" variant="outline">Edit Profile</Button>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-xl border-2 border-white/20 dark:border-purple-500/20 shadow-xl dark:shadow-purple-500/10">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center flex-shrink-0">
                          <Bell className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-[rgb(var(--text-primary))] mb-1">Notifications</h3>
                          <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">Manage notification preferences and alerts</p>
                          <Button size="sm" variant="outline">Configure</Button>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-xl border-2 border-white/20 dark:border-indigo-500/20 shadow-xl dark:shadow-indigo-500/10">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-400 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-[rgb(var(--text-primary))] mb-1">Appearance</h3>
                          <p className="text-sm text-[rgb(var(--text-secondary))]">Dark mode theme is permanently enabled</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-xl border-2 border-white/20 dark:border-rose-500/20 shadow-xl dark:shadow-rose-500/10">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-400 flex items-center justify-center flex-shrink-0">
                          <ShoppingCart className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-[rgb(var(--text-primary))] mb-1">Privacy & Security</h3>
                          <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">Manage your privacy settings and security options</p>
                          <Button size="sm" variant="outline">Manage</Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        </div>
      </div>

      {/* Prescription Scanner Component */}
      <PrescriptionScanner 
        isOpen={showScanner} 
        onClose={() => setShowScanner(false)} 
      />

      {/* AI Chatbot Modal */}
      {showChatbot && (
        <Chatbot onClose={() => setShowChatbot(false)} />
      )}

      {/* Voice Chat Modal */}
      {showVoiceChat && (
        <VoiceChatSaarthi onClose={() => setShowVoiceChat(false)} />
      )}

      {/* Medi Call Sarthi Modal */}
      {showMediCallSarthi && (
        <MediCallSarthi onClose={() => setShowMediCallSarthi(false)} />
      )}

      {/* Simple Voice Assistant Modal - NEW */}
      {showSimpleVoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🎙️ MediSaarthi Voice Assistant
              </h2>
              <button
                onClick={() => setShowSimpleVoice(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <SimpleVoiceAssistant />
            </div>
          </div>
        </div>
      )}

      {/* Conference Call Modal - OLD */}
      {showConferenceCall && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative max-w-3xl w-full"
          >
            <button
              onClick={() => setShowConferenceCall(false)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <MediConferenceCall />
          </motion.div>
        </div>
      )}

      {/* Voice Chat Saarthi Modal */}
      <AnimatePresence>
        {showVoiceChat && (
          <VoiceChatSaarthi onClose={() => setShowVoiceChat(false)} />
        )}
      </AnimatePresence>

      {/* Medi Call Sarthi Modal */}
      <AnimatePresence>
        {showMediCallSarthi && (
          <MediCallSarthi onClose={() => setShowMediCallSarthi(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Wrap with ThemeProvider and OrderProvider
const PremiumPatientDashboard = () => {
  return (
    <ThemeProvider>
      <OrderProvider>
        <PremiumPatientDashboardInner />
      </OrderProvider>
    </ThemeProvider>
  );
};

export default PremiumPatientDashboard;
