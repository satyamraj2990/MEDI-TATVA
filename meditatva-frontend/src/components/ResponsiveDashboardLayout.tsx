import { memo, useState, useEffect, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export interface SidebarItem {
  id: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  badge?: string | number;
  iconBg?: string;
  onClick?: () => void;
}

interface ResponsiveDashboardLayoutProps {
  children: ReactNode;
  sidebarItems: SidebarItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  healthScore?: number;
  theme?: 'pharmacy' | 'patient';
  logoText?: string;
  logoSubtext?: string;
  onLogout?: () => void;
}

export const ResponsiveDashboardLayout = memo(({
  children,
  sidebarItems,
  activeItem,
  onItemClick,
  userName = "User",
  userEmail = "user@gmail.com",
  userAvatar,
  healthScore,
  theme: dashboardTheme = 'patient',
  logoText = "MediTatva",
  logoSubtext = "Premium Health Care",
  onLogout,
}: ResponsiveDashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
      if (mobile && !isMobile) {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sidebarOpen]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(prev => !prev);
    }
  }, [isMobile]);

  const handleItemClick = (id: string, customOnClick?: () => void) => {
    if (customOnClick) {
      customOnClick();
    } else {
      onItemClick(id);
    }
    
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const themeColors = {
    pharmacy: {
      bg: 'from-slate-50 via-blue-50/30 to-indigo-50/20',
      sidebarBg: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
      cardBg: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(241, 245, 249, 0.9)',
      activeBg: 'linear-gradient(135deg, #22c55e, #06b6d4, #3b82f6)',
      textPrimary: theme === 'dark' ? '#ffffff' : '#0f172a',
      textSecondary: theme === 'dark' ? '#cbd5e1' : '#475569',
      border: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 1)',
      accent: '#22c55e',
      logo: 'from-emerald-500 via-cyan-500 to-blue-600',
    },
    patient: {
      bg: 'from-[#0B1220] via-[#111827] to-[#0B1220]',
      sidebarBg: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
      cardBg: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(241, 245, 249, 0.9)',
      activeBg: 'linear-gradient(135deg, #22c55e, #06b6d4, #3b82f6)',
      textPrimary: theme === 'dark' ? '#ffffff' : '#0f172a',
      textSecondary: theme === 'dark' ? '#cbd5e1' : '#475569',
      border: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 1)',
      accent: '#22c55e',
      logo: 'from-emerald-500 via-cyan-500 to-blue-600',
    }
  };

  const currentTheme = themeColors[dashboardTheme];

  return (
    <div 
      className={cn(
        "relative h-screen bg-gradient-to-br transition-colors duration-300 overflow-hidden",
        dashboardTheme === 'pharmacy' 
          ? "from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
          : "from-[#0B1220] via-[#111827] to-[#0B1220]"
      )}
      style={{
        filter: 'none !important',
        WebkitFilter: 'none !important',
        display: 'flex',
        flexDirection: 'column',
      } as React.CSSProperties}
    >
      {/* Top Header Bar - Fixed */}
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-30 border-b transition-colors duration-300 backdrop-blur-xl",
          theme === 'dark'
            ? "bg-gray-900/80 border-white/10"
            : "bg-white/80 border-gray-200/50"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between gap-4">
          {/* Left: Sidebar Toggle */}
          <motion.button
            onClick={toggleSidebar}
            className="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-emerald-500/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={cn(
              "h-6 w-6 text-white transition-transform duration-300",
              sidebarOpen && "rotate-180"
            )} />
          </motion.button>

          {/* Center: Animated Logo */}
          <motion.div
            className="flex-1 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent animate-gradient from-emerald-500 via-cyan-500 to-blue-600">
              {logoText}
            </h1>
          </motion.div>

          {/* Right: Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ThemeToggle />
          </motion.div>
        </div>
      </motion.header>

      {/* Mobile Overlay - Only on Mobile */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40"
            style={{ top: '80px' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Layout Container - Account for fixed header */}
      <div className="flex" style={{ marginTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
        
        {/* Sidebar - Fixed width on Desktop, Overlay on Mobile */}
        <aside
          className={cn(
            "flex flex-col border-r overflow-hidden transition-all duration-300 backdrop-blur-xl",
            isMobile ? "fixed left-0 z-50" : "relative flex-shrink-0",
            isMobile && !sidebarOpen && "border-transparent"
          )}
          style={{
            backgroundColor: currentTheme.sidebarBg,
            borderColor: currentTheme.border,
            boxShadow: isMobile && sidebarOpen ? '2px 0 12px rgba(0,0,0,0.2)' : theme === 'dark' ? '2px 0 20px rgba(34,197,94,0.1)' : 'none',
            height: 'calc(100vh - 80px)',
            top: isMobile ? '80px' : '0',
            width: isMobile ? (sidebarOpen ? '320px' : '0px') : '320px',
          }}
        >
          {/* Sidebar Content - Always show on desktop, conditionally on mobile */}
          {(!isMobile || sidebarOpen) && (
            <>
              {/* Sidebar Header - Responsive Spacing */}
              <div className="p-4 sm:p-6 border-b" style={{ borderColor: currentTheme.border }}>
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <img 
              src="/meditatva-logo.png?v=3"
              alt="MediTatva Logo"
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate" style={{ color: currentTheme.textPrimary }}>{logoText}</h1>
              <p className="text-xs sm:text-sm truncate" style={{ color: currentTheme.textSecondary }}>
                {logoSubtext}
              </p>
            </div>
          </motion.div>

          {/* User Profile Card - Responsive */}
          <motion.div
            className="rounded-2xl p-3 sm:p-4 backdrop-blur-md border"
            style={{ 
              backgroundColor: currentTheme.cardBg,
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226,232,240,0.5)'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-base sm:text-lg ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/30">
                  {userName.substring(0, 2).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 sm:h-4 sm:w-4 bg-emerald-500 rounded-full border-2" style={{ borderColor: currentTheme.sidebarBg }}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: currentTheme.textPrimary }}>{userName}</h3>
                <p className="text-xs sm:text-sm truncate" style={{ color: currentTheme.textSecondary }}>
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Health Score */}
            {healthScore !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: currentTheme.textSecondary }}>
                    Health Score
                  </span>
                  <div className="flex items-center gap-1">
                    <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg font-bold text-emerald-500">{healthScore}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 rounded-full shadow-lg shadow-emerald-500/50"
                    initial={{ width: 0 }}
                    animate={{ width: `${healthScore}%` }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation Items - Responsive Touch Targets */}
        <nav className="flex-1 overflow-y-auto py-3 sm:py-4 px-3 sm:px-4 space-y-1.5 sm:space-y-2 custom-scrollbar">
          {sidebarItems.filter(item => item.id !== 'logout').map((item, index) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item.id, item.onClick)}
                className={cn(
                  "w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 group relative overflow-hidden min-h-[48px] touch-manipulation backdrop-blur-md border",
                  isActive && "shadow-lg shadow-emerald-500/20"
                )}
                style={{
                  background: isActive ? currentTheme.activeBg : currentTheme.cardBg,
                  borderColor: isActive ? 'rgba(34,197,94,0.3)' : 'transparent',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 backdrop-blur-sm"
                  style={{
                    backgroundColor: isActive 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  }}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: isActive ? '#ffffff' : currentTheme.textPrimary }} />
                </div>

                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate" style={{ color: isActive ? '#ffffff' : currentTheme.textPrimary }}>
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="text-xs sm:text-sm truncate" style={{ 
                      color: isActive ? 'rgba(255,255,255,0.8)' : currentTheme.textSecondary 
                    }}>
                      {item.description}
                    </p>
                  )}
                </div>

                {item.badge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"
                  >
                    <span className="text-[10px] sm:text-xs font-bold text-white">
                      {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
                    </span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer - Logout Button - Responsive */}
        <div className="p-3 sm:p-4 border-t" style={{ borderColor: currentTheme.border }}>
          <motion.button
            className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 min-h-[48px] touch-manipulation bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm sm:text-base">Logout</span>
          </motion.button>
        </div>
            </>
          )}
        </aside>

        {/* Main Content - Flex-1 to fill remaining space */}
        <main
          className="flex-1 w-full overflow-y-auto overflow-x-hidden"
          style={{
            filter: 'none !important',
            WebkitFilter: 'none !important',
            backdropFilter: 'none !important',
            WebkitBackdropFilter: 'none !important',
            height: 'calc(100vh - 80px)',
          } as React.CSSProperties}
        >
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Custom Scrollbar & Animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${currentTheme.cardBg};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${currentTheme.accent};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${currentTheme.accent}dd;
        }
      `}</style>
    </div>
  );
});

ResponsiveDashboardLayout.displayName = 'ResponsiveDashboardLayout';
