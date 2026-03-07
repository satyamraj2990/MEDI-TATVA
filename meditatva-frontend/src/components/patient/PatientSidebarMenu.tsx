import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
}

interface PatientSidebarMenuProps {
  menuItems: MenuItem[];
  activeSection: string;
  setActiveSection: (section: any) => void;
  collapsed: boolean;
}

export const PatientSidebarMenu = ({ 
  menuItems,
  activeSection,
  setActiveSection,
  collapsed 
}: PatientSidebarMenuProps) => {
  return (
    <nav className="space-y-2 px-3">
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        
        return (
          <motion.button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                : 'text-slate-800 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4 }}
          >
            <div className={`p-2 rounded-lg ${
              isActive 
                ? 'bg-white/20' 
                : 'bg-slate-200 dark:bg-gray-800'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            
            {!collapsed && (
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{item.label}</div>
                {!isActive && (
                  <div className="text-xs opacity-60">{item.description}</div>
                )}
              </div>
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};
