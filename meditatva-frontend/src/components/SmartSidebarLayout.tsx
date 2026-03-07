import { memo, useState, useEffect, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  id: string;
  icon: LucideIcon;
  label: string;
  badge?: string | number;
  gradient?: string;
  section?: 'main' | 'secondary';
  onClick?: () => void;
}

interface SmartSidebarLayoutProps {
  children: ReactNode;
  sidebarItems: SidebarItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  header?: ReactNode;
  footer?: ReactNode;
  theme?: 'pharmacy' | 'patient';
  sidebarWidth?: string;
  collapsedWidth?: string;
}

const sidebarVariants = {
  open: { 
    x: 0,
    transition: { 
      type: "spring" as const,
      stiffness: 300,
      damping: 30 
    }
  },
  closed: { 
    x: "-100%",
    transition: { 
      type: "spring" as const,
      stiffness: 300,
      damping: 30 
    }
  }
};

const contentVariants = {
  expanded: {
    marginLeft: 0,
    transition: { 
      type: "spring" as const,
      stiffness: 300,
      damping: 30 
    }
  },
  normal: {
    marginLeft: 0,
    transition: { 
      type: "spring" as const,
      stiffness: 300,
      damping: 30 
    }
  }
};

const overlayVariants = {
  visible: { opacity: 1, backdropFilter: "blur(6px)" },
  hidden: { opacity: 0, backdropFilter: "blur(0px)" }
};

export const SmartSidebarLayout = memo(({
  children,
  sidebarItems,
  activeItem,
  onItemClick,
  header,
  footer,
  theme = 'pharmacy',
  sidebarWidth = '280px',
  collapsedWidth = '80px'
}: SmartSidebarLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Persist sidebar state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
    if (savedCollapsed !== null) {
      setSidebarCollapsed(savedCollapsed === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(sidebarOpen));
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarOpen, sidebarCollapsed]);

  // Responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      if (mobile) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else if (tablet) {
        setSidebarOpen(true);
        setSidebarCollapsed(true);
      } else {
        setSidebarOpen(true);
        setSidebarCollapsed(false);
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
        toggleSidebar();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sidebarOpen, isMobile]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(prev => !prev);
    } else if (isTablet) {
      setSidebarCollapsed(prev => !prev);
    } else {
      setSidebarOpen(prev => !prev);
    }
  }, [isMobile, isTablet]);

  const toggleCollapse = useCallback(() => {
    if (!isMobile) {
      setSidebarCollapsed(prev => !prev);
    }
  }, [isMobile]);

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
      primary: 'from-blue-500 to-cyan-400',
      secondary: 'from-purple-500 to-pink-400',
      glow: 'rgba(59, 130, 246, 0.4)',
      border: 'rgba(59, 130, 246, 0.3)',
      bg: 'rgba(17, 24, 39, 0.95)',
    },
    patient: {
      primary: 'from-teal-500 to-emerald-400',
      secondary: 'from-cyan-500 to-blue-400',
      glow: 'rgba(20, 184, 166, 0.4)',
      border: 'rgba(20, 184, 166, 0.3)',
      bg: 'rgba(11, 18, 32, 0.95)',
    }
  };

  const currentTheme = themeColors[theme];
  const currentWidth = sidebarCollapsed ? collapsedWidth : sidebarWidth;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Hamburger Toggle Button - Fixed Top Right */}
      <motion.div
        className="fixed top-4 right-4 z-[100]"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={toggleSidebar}
          size="icon"
          className={cn(
            "h-11 w-11 sm:h-12 sm:w-12 rounded-xl shadow-2xl transition-all duration-300",
            "backdrop-blur-xl border-2"
          )}
          style={{
            background: `linear-gradient(135deg, ${currentTheme.primary})`,
            borderColor: currentTheme.border,
            boxShadow: `0 0 30px ${currentTheme.glow}`,
          }}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {sidebarOpen && isMobile ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            )}
          </motion.div>
        </Button>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={
          isMobile 
            ? (sidebarOpen ? "open" : "closed")
            : "open"
        }
        variants={sidebarVariants}
        className={cn(
          "fixed left-0 top-0 h-screen z-50 flex flex-col",
          "border-r transition-all duration-300",
          isMobile && "shadow-2xl"
        )}
        style={{
          width: isMobile ? sidebarWidth : currentWidth,
          backgroundColor: currentTheme.bg,
          backdropFilter: 'blur(20px)',
          borderColor: currentTheme.border,
          transform: !isMobile && !sidebarOpen ? 'translateX(-100%)' : undefined,
        }}
      >
        {/* Header */}
        {header && (
          <div className="p-4 sm:p-6 border-b" style={{ borderColor: currentTheme.border }}>
            {header}
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 sm:px-3 space-y-1 custom-scrollbar">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const itemGradient = item.gradient || currentTheme.primary;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => handleItemClick(item.id, item.onClick)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl",
                    "transition-all duration-300 group relative overflow-hidden",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    isActive && "shadow-lg"
                  )}
                  style={{
                    background: isActive 
                      ? `linear-gradient(135deg, ${itemGradient})`
                      : 'rgba(255, 255, 255, 0.05)',
                    boxShadow: isActive 
                      ? `0 0 20px ${currentTheme.glow}` 
                      : 'none',
                  }}
                  title={sidebarCollapsed && !isMobile ? item.label : undefined}
                >
                  {/* Hover Gradient Effect */}
                  {!isActive && (
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${itemGradient})`,
                        opacity: 0.1,
                      }}
                    />
                  )}

                  {/* Icon */}
                  <Icon className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 transition-transform duration-300",
                    "group-hover:scale-110",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                  )} />

                  {/* Label */}
                  {(!sidebarCollapsed || isMobile) && (
                    <span className={cn(
                      "flex-1 text-left font-medium text-sm sm:text-base truncate",
                      "transition-colors duration-300",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                    )}>
                      {item.label}
                    </span>
                  )}

                  {/* Badge */}
                  {item.badge && (!sidebarCollapsed || isMobile) && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold",
                        "bg-red-500 text-white"
                      )}
                    >
                      {item.badge}
                    </motion.span>
                  )}

                  {/* Badge Dot (collapsed) */}
                  {item.badge && sidebarCollapsed && !isMobile && (
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t" style={{ borderColor: currentTheme.border }}>
            {footer}
          </div>
        )}

        {/* Collapse Toggle (Desktop/Tablet only) */}
        {!isMobile && (
          <motion.button
            onClick={toggleCollapse}
            className={cn(
              "absolute -right-3 top-1/2 -translate-y-1/2",
              "h-6 w-6 rounded-full flex items-center justify-center",
              "border-2 shadow-lg transition-all duration-300",
              "hover:scale-110 active:scale-95"
            )}
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary})`,
              borderColor: currentTheme.border,
            }}
            whileHover={{ boxShadow: `0 0 20px ${currentTheme.glow}` }}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-white" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-white" />
            )}
          </motion.button>
        )}
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={
          isMobile 
            ? "expanded"
            : (!sidebarOpen ? "expanded" : "normal")
        }
        variants={contentVariants}
        className="transition-all duration-300 min-h-screen"
        style={{
          marginLeft: isMobile || !sidebarOpen ? 0 : currentWidth,
        }}
      >
        {children}
      </motion.main>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${currentTheme.border};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${currentTheme.glow};
        }
      `}</style>
    </div>
  );
});

SmartSidebarLayout.displayName = 'SmartSidebarLayout';
