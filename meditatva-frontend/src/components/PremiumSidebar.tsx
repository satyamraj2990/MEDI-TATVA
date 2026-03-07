import { memo, useState, useEffect, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  id: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  badge?: string | number;
  iconBg?: string;
  onClick?: () => void;
}

interface SmartSidebarLayoutProps {
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
}

export const SmartSidebarLayout = memo(({
  children,
  sidebarItems,
  activeItem,
  onItemClick,
  userName = "User",
  userEmail = "user@gmail.com",
  userAvatar,
  healthScore,
  theme = 'patient',
  logoText = "MediTatva",
  logoSubtext = "Premium Health Care"
}: SmartSidebarLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Persist sidebar state
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(sidebarOpen));
  }, [sidebarOpen]);

  // Responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut (Ctrl + B)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleItemClick = (id: string, customOnClick?: () => void) => {
    if (customOnClick) {
      customOnClick();
    } else {
      onItemClick(id);
    }
    
    // Close sidebar on mobile after selection
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const themeColors = {
    pharmacy: {
      bg: '#1a2332',
      cardBg: '#242e42',
      activeBg: '#3b82f6',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      border: '#2d3748',
      accent: '#3b82f6',
    },
    patient: {
      bg: '#1e293b',
      cardBg: '#283244',
      activeBg: '#14b8a6',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      border: '#334155',
      accent: '#14b8a6',
    }
  };

  const currentTheme = themeColors[theme];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Hamburger Toggle Button - Fixed Top Right */}
      <motion.div
        className="fixed top-4 right-4 z-[100]"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          onClick={toggleSidebar}
          size="icon"
          className="h-12 w-12 rounded-2xl shadow-2xl transition-all duration-300 backdrop-blur-xl"
          style={{
            background: currentTheme.accent,
            border: 'none',
          }}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <motion.div
            animate={{ rotate: sidebarOpen && isMobile ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {sidebarOpen && isMobile ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </motion.div>
        </Button>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: (isMobile && !sidebarOpen) || (!isMobile && !sidebarOpen) ? -400 : 0
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30 
        }}
        className="fixed left-0 top-0 h-screen z-50 flex flex-col w-[380px] shadow-2xl"
        style={{
          backgroundColor: currentTheme.bg,
        }}
      >
        {/* Header Section */}
        <div className="p-6 border-b" style={{ borderColor: currentTheme.border }}>
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div 
              className="h-14 w-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: currentTheme.accent }}
            >
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{logoText}</h1>
              <p className="text-sm" style={{ color: currentTheme.textSecondary }}>
                {logoSubtext}
              </p>
            </div>
          </motion.div>

          {/* User Profile Card */}
          <motion.div
            className="rounded-2xl p-4"
            style={{ backgroundColor: currentTheme.cardBg }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Avatar className="h-14 w-14 ring-2 ring-green-500">
                  <AvatarImage src={userAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-bold">
                    {userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Online Status */}
                <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-lg truncate">{userName}</h3>
                <p className="text-sm truncate" style={{ color: currentTheme.textSecondary }}>
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
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg font-bold text-green-500">{healthScore}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${healthScore}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2 custom-scrollbar">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item.id, item.onClick)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  isActive && "shadow-lg"
                )}
                style={{
                  backgroundColor: isActive ? currentTheme.activeBg : currentTheme.cardBg,
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Icon Container */}
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: isActive 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : (item.iconBg || currentTheme.accent + '40'),
                  }}
                >
                  <Icon className={cn(
                    "h-6 w-6 transition-colors duration-300",
                    isActive ? "text-white" : "text-white"
                  )} />
                </div>

                {/* Label & Description */}
                <div className="flex-1 text-left min-w-0">
                  <p className={cn(
                    "font-semibold text-base truncate transition-colors duration-300",
                    isActive ? "text-white" : "text-white group-hover:text-white"
                  )}>
                    {item.label}
                  </p>
                  {item.description && (
                    <p className={cn(
                      "text-sm truncate transition-colors duration-300",
                      isActive ? "text-white/80" : "text-gray-400 group-hover:text-gray-300"
                    )}>
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Badge */}
                {item.badge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"
                  >
                    <span className="text-xs font-bold text-white">
                      {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
                    </span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer - Logout Button */}
        <div className="p-4 border-t" style={{ borderColor: currentTheme.border }}>
          <motion.button
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg"
            style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const logoutItem = sidebarItems.find(item => item.id === 'logout');
              if (logoutItem?.onClick) {
                logoutItem.onClick();
              }
            }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{
          marginLeft: (isMobile || !sidebarOpen) ? 0 : 380,
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30 
        }}
        className="transition-all duration-300 min-h-screen"
      >
        {children}
      </motion.main>

      {/* Custom Scrollbar Styles */}
      <style>{`
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

SmartSidebarLayout.displayName = 'SmartSidebarLayout';

export { SmartSidebarLayout as PremiumSidebar };
