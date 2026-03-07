import { memo, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { SmartSidebarLayout } from "@/components/SmartSidebarLayout";
import type { SidebarItem } from "@/components/SmartSidebarLayout";
import {
  Home, Search, MapPin, MessageCircle, Heart, Calendar, 
  User, LogOut, Sparkles, Package, Activity, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SmartPatientLayoutProps {
  children: ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const pulseVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.8, 1, 0.8],
  }
};

export const SmartPatientLayout = memo(({ 
  children, 
  activeSection = "home",
  onSectionChange 
}: SmartPatientLayoutProps) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const menuItems: SidebarItem[] = [
    {
      id: "home",
      icon: Home,
      label: "Home Dashboard",
      gradient: "from-teal-500 to-emerald-400",
    },
    {
      id: "search",
      icon: Search,
      label: "Find Medicine",
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      id: "nearby",
      icon: MapPin,
      label: "Nearby Pharmacies",
      gradient: "from-purple-500 to-pink-400",
      badge: "New",
    },
    {
      id: "orders",
      icon: Package,
      label: "My Orders",
      gradient: "from-orange-500 to-amber-400",
      badge: 3,
    },
    {
      id: "appointments",
      icon: Calendar,
      label: "Appointments",
      gradient: "from-indigo-500 to-blue-400",
    },
    {
      id: "health",
      icon: Heart,
      label: "Health Records",
      gradient: "from-rose-500 to-red-400",
    },
    {
      id: "chat",
      icon: MessageCircle,
      label: "AI Assistant",
      gradient: "from-cyan-500 to-teal-400",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    try { 
      sessionStorage.removeItem("patientLocationData");
      sessionStorage.removeItem("patientLocation");
    } catch (e) { /* ignore */ }
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleItemClick = (id: string) => {
    if (onSectionChange) {
      onSectionChange(id);
    }
    // Scroll to top on section change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sidebarHeader = (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="relative h-12 w-12 rounded-2xl flex items-center justify-center overflow-hidden"
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
            boxShadow: '0 8px 32px rgba(20, 184, 166, 0.4)',
          }}
        >
          <Sparkles className="h-6 w-6 text-white" />
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{
              opacity: [0, 0.5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
            MediTatva
          </h1>
          <p className="text-xs text-gray-500 font-medium dark:text-gray-400">Patient Portal</p>
        </motion.div>
      </div>

      {/* Health Status */}
      <motion.div
        className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Activity className="h-3 w-3 text-emerald-600" />
        <span className="text-xs font-semibold text-emerald-700">Healthy</span>
      </motion.div>
    </motion.div>
  );

  const sidebarFooter = (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      {/* Profile Section */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 ring-2 ring-white ring-offset-2 ring-offset-teal-100">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=patient" />
            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-400 text-white font-bold text-sm">
              PT
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 dark:text-white truncate">Patient User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ID: #12345</p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <Button
        className="w-full group relative overflow-hidden bg-white/60 hover:bg-gradient-to-r hover:from-rose-500 hover:to-red-500 text-rose-600 hover:text-white border-2 border-rose-200 hover:border-rose-500 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-rose-500/30 py-3"
        onClick={handleLogout}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/20 to-rose-500/0"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
        <div className="flex items-center gap-2">
          <motion.div
            className="h-8 w-8 rounded-lg bg-rose-500/10 group-hover:bg-white/20 flex items-center justify-center transition-colors"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <LogOut className="h-4 w-4" />
          </motion.div>
          <span>Logout</span>
        </div>
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#0B1220] relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0B1220]" />
        
        {/* Animated Gradients */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <SmartSidebarLayout
        sidebarItems={menuItems}
        activeItem={activeSection}
        onItemClick={handleItemClick}
        header={sidebarHeader}
        footer={sidebarFooter}
        theme="patient"
      >
        {/* Floating Navbar */}
        <motion.header
          className={`sticky top-2 sm:top-4 mx-2 sm:mx-4 lg:mx-6 mb-4 sm:mb-6 z-20 rounded-xl sm:rounded-2xl transition-all duration-300 ${
            scrolled 
              ? 'bg-gray-900/80 backdrop-blur-xl shadow-xl shadow-cyan-500/10' 
              : 'bg-gray-900/60 backdrop-blur-lg shadow-lg'
          }`}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            border: '1px solid rgba(20, 184, 166, 0.3)',
          }}
        >
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              {/* Section Title */}
              <motion.div
                className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {menuItems.find(item => item.id === activeSection) && (
                  <>
                    <motion.div
                      className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${menuItems.find(item => item.id === activeSection)?.gradient} flex items-center justify-center shrink-0`}
                      whileHover={{ rotate: 5, scale: 1.05 }}
                      style={{
                        boxShadow: '0 8px 24px rgba(20, 184, 166, 0.25)',
                      }}
                    >
                      {(() => {
                        const Icon = menuItems.find(item => item.id === activeSection)?.icon;
                        return Icon ? <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" /> : null;
                      })()}
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">
                        {menuItems.find(item => item.id === activeSection)?.label}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">Your Health, Our Priority</p>
                    </div>
                  </>
                )}
              </motion.div>

              {/* Right Actions */}
              <motion.div
                className="flex items-center gap-1.5 sm:gap-2 lg:gap-3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {/* Notifications */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-8 w-8 sm:h-10 sm:w-10 lg:h-11 lg:w-11 rounded-lg sm:rounded-xl hover:bg-teal-500/10 hover:text-teal-400 p-0 text-gray-400"
                  >
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    <motion.span
                      className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-gradient-to-r from-rose-500 to-red-500 rounded-full border-2 border-gray-900"
                      variants={pulseVariants}
                      animate="animate"
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </Button>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-500" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-300">72 BPM</span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <motion.main
          className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6 lg:pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {children}
        </motion.main>
      </SmartSidebarLayout>
    </div>
  );
});

SmartPatientLayout.displayName = "SmartPatientLayout";
