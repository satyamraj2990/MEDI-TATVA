import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, Settings, LogOut, Menu, X, Home,
  MapPin, ShoppingCart, BarChart3, Users, Pill,
  Clock, TrendingUp, Download, Filter, ChevronRight,
  Heart, Moon, Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const colors = {
  light: {
    bg: '#FFFFFF',
    bgSecondary: '#F8FAFC',
    bgTertiary: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#64748B',
    border: '#E2E8F0',
    accent: 'from-blue-600 to-purple-600',
  },
  dark: {
    bg: '#0B1220',
    bgSecondary: '#0F172A',
    bgTertiary: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    border: '#334155',
    accent: 'from-blue-500 to-purple-500',
  }
};

interface DashboardContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const DashboardContext = React.createContext<DashboardContextType | null>(null);

const useDashboardTheme = () => {
  const context = React.useContext(DashboardContext);
  if (!context) throw new Error('useDashboardTheme must be used within DashboardProvider');
  return context;
};

// Sidebar Component
const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void; userType: 'patient' | 'pharmacy' }> = ({ isOpen, onClose, userType }) => {
  const { isDark } = useDashboardTheme();
  const theme = isDark ? colors.dark : colors.light;

  const patientMenuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Search, label: 'Find Medicines', badge: '3' },
    { icon: MapPin, label: 'Nearby Pharmacies' },
    { icon: ShoppingCart, label: 'Orders', badge: '2' },
    { icon: Heart, label: 'My Medicines' },
  ];

  const pharmacyMenuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: ShoppingCart, label: 'Orders', badge: '12' },
    { icon: Pill, label: 'Inventory' },
    { icon: Users, label: 'Customers' },
    { icon: BarChart3, label: 'Analytics' },
  ];

  const menuItems = userType === 'patient' ? patientMenuItems : pharmacyMenuItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: theme.bgSecondary,
          borderColor: theme.border,
        }}
        className="fixed left-0 top-0 h-screen w-64 border-r z-40 lg:static lg:translate-x-0 overflow-y-auto"
      >
        <div className="p-6 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/meditatva-logo.png?v=3" 
                alt="MediTatva Logo" 
                className="h-10 w-10 object-contain"
              />
              <span style={{ color: theme.text }} className="font-semibold">
                MediTatva
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1"
              style={{ color: theme.text }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <motion.a
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              href="#"
              style={{
                backgroundColor: item.active ? '#3B82F6' : theme.bgTertiary,
                color: item.active ? '#FFFFFF' : theme.text,
              }}
              className="flex items-center justify-between p-3 rounded-lg hover:opacity-80 transition-opacity group"
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : ''}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span style={{ backgroundColor: '#EF4444' }} className="text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </motion.a>
          ))}
        </nav>

        {/* User Section */}
        <div
          style={{
            backgroundColor: theme.bgTertiary,
            borderColor: theme.border,
          }}
          className="absolute bottom-0 left-0 right-0 p-4 border-t"
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: theme.text }} className="text-sm font-semibold">
                {userType === 'patient' ? 'John Doe' : 'MediCare Pharmacy'}
              </p>
              <p style={{ color: theme.textTertiary }} className="text-xs">
                {userType === 'patient' ? 'Patient' : 'Pharmacy'}
              </p>
            </div>
            <button style={{ color: theme.textSecondary }} className="hover:opacity-100 opacity-70">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

// Top Navigation
const TopNav: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useDashboardTheme();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <motion.header
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.border,
      }}
      className="border-b sticky top-0 z-20"
    >
      <div className="flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2"
            style={{ color: theme.text }}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 max-w-md">
            <div
              style={{
                backgroundColor: theme.bgSecondary,
                borderColor: theme.border,
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border"
            >
              <Search className="w-4 h-4" style={{ color: theme.textTertiary }} />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  backgroundColor: 'transparent',
                  color: theme.text,
                }}
                className="flex-1 outline-none text-sm placeholder-opacity-60"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button
            style={{ color: theme.textSecondary }}
            className="relative p-2 hover:opacity-100 opacity-70 transition-opacity"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>


          {/* Settings */}
          <button
            style={{ color: theme.textSecondary }}
            className="p-2 hover:opacity-100 opacity-70 transition-opacity"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

// Patient Dashboard Content
const PatientDashboardContent: React.FC = () => {
  const { isDark } = useDashboardTheme();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: theme.bgSecondary,
          borderColor: theme.border,
        }}
        className="p-8 rounded-lg border border-dashed"
      >
        <h1 style={{ color: theme.text }} className="text-3xl font-bold mb-2">
          Welcome back, John! 👋
        </h1>
        <p style={{ color: theme.textSecondary }}>
          Here's what's happening with your health today
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Orders', value: '2', icon: ShoppingCart, color: 'from-blue-600 to-blue-400' },
          { label: 'Saved Medicines', value: '12', icon: Pill, color: 'from-purple-600 to-purple-400' },
          { label: 'Nearby Pharmacies', value: '8', icon: MapPin, color: 'from-cyan-600 to-cyan-400' },
          { label: 'Health Score', value: '92%', icon: Heart, color: 'from-pink-600 to-pink-400' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              backgroundColor: theme.bgSecondary,
              borderColor: theme.border,
            }}
            className="p-6 rounded-lg border group cursor-pointer hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <p style={{ color: theme.textSecondary }} className="text-sm font-medium">
                {stat.label}
              </p>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p style={{ color: theme.text }} className="text-2xl font-bold">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: theme.bgSecondary,
          borderColor: theme.border,
        }}
        className="p-6 rounded-lg border"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ color: theme.text }} className="text-xl font-bold">
            Recent Orders
          </h2>
          <Button variant="ghost" size="sm">
            View All <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="space-y-3">
          {[
            { medicine: 'Paracetamol 500mg', pharmacy: 'MediCare Pharmacy', status: 'Delivered', date: '2 days ago' },
            { medicine: 'Vitamin D3 60K', pharmacy: 'Health Plus', status: 'In Transit', date: '5 hours ago' },
          ].map((order, index) => (
            <motion.div
              key={order.medicine}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
              }}
              className="flex items-center justify-between p-4 rounded-lg border hover:border-blue-500 transition-colors"
            >
              <div>
                <p style={{ color: theme.text }} className="font-semibold">
                  {order.medicine}
                </p>
                <p style={{ color: theme.textSecondary }} className="text-sm">
                  {order.pharmacy} • {order.date}
                </p>
              </div>
              <div className="text-right">
                <span
                  style={{
                    backgroundColor: order.status === 'Delivered' ? '#DCFCE7' : '#FEF3C7',
                    color: order.status === 'Delivered' ? '#166534' : '#92400E',
                  }}
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {order.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Pharmacy Dashboard Content
const PharmacyDashboardContent: React.FC = () => {
  const { isDark } = useDashboardTheme();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: theme.bgSecondary,
          borderColor: theme.border,
        }}
        className="p-8 rounded-lg border border-dashed"
      >
        <h1 style={{ color: theme.text }} className="text-3xl font-bold mb-2">
          MediCare Pharmacy
        </h1>
        <p style={{ color: theme.textSecondary }}>
          Manage your pharmacy operations efficiently
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Today\'s Orders', value: '24', icon: ShoppingCart, color: 'from-blue-600 to-blue-400', trend: '+12%' },
          { label: 'Total Revenue', value: '₹12,450', icon: TrendingUp, color: 'from-purple-600 to-purple-400', trend: '+8%' },
          { label: 'Low Stock Items', value: '3', icon: Pill, color: 'from-orange-600 to-orange-400', trend: 'Action needed' },
          { label: 'Active Customers', value: '156', icon: Users, color: 'from-cyan-600 to-cyan-400', trend: '+5' },
        ].map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              backgroundColor: theme.bgSecondary,
              borderColor: theme.border,
            }}
            className="p-6 rounded-lg border group cursor-pointer hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <p style={{ color: theme.textSecondary }} className="text-sm font-medium">
                {kpi.label}
              </p>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p style={{ color: theme.text }} className="text-2xl font-bold">
                {kpi.value}
              </p>
              <span style={{ color: '#10B981' }} className="text-sm font-semibold">
                {kpi.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pending Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: theme.bgSecondary,
          borderColor: theme.border,
        }}
        className="p-6 rounded-lg border"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ color: theme.text }} className="text-xl font-bold">
            Pending Orders
          </h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderColor: theme.border }} className="border-b">
                <th style={{ color: theme.textSecondary }} className="text-left py-3 px-4 font-semibold">Order ID</th>
                <th style={{ color: theme.textSecondary }} className="text-left py-3 px-4 font-semibold">Customer</th>
                <th style={{ color: theme.textSecondary }} className="text-left py-3 px-4 font-semibold">Items</th>
                <th style={{ color: theme.textSecondary }} className="text-left py-3 px-4 font-semibold">Amount</th>
                <th style={{ color: theme.textSecondary }} className="text-left py-3 px-4 font-semibold">Status</th>
                <th style={{ color: theme.textSecondary }} className="text-left py-3 px-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: '#ORD001', customer: 'John Doe', items: '3', amount: '₹2,450', status: 'Pending', time: '5 min ago' },
                { id: '#ORD002', customer: 'Sarah Smith', items: '2', amount: '₹1,200', status: 'Processing', time: '15 min ago' },
                { id: '#ORD003', customer: 'Mike Johnson', items: '5', amount: '₹3,890', status: 'Ready', time: '32 min ago' },
              ].map((order) => (
                <tr
                  key={order.id}
                  style={{ borderColor: theme.border }}
                  className="border-b hover:bg-opacity-50 transition-colors"
                >
                  <td style={{ color: theme.text }} className="py-4 px-4 font-semibold">{order.id}</td>
                  <td style={{ color: theme.text }} className="py-4 px-4">{order.customer}</td>
                  <td style={{ color: theme.textSecondary }} className="py-4 px-4">{order.items} items</td>
                  <td style={{ color: theme.text }} className="py-4 px-4 font-semibold">{order.amount}</td>
                  <td className="py-4 px-4">
                    <span
                      style={{
                        backgroundColor: order.status === 'Ready' ? '#DCFCE7' : order.status === 'Processing' ? '#FEF3C7' : '#FCE7F3',
                        color: order.status === 'Ready' ? '#166534' : order.status === 'Processing' ? '#92400E' : '#831843',
                      }}
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: theme.textSecondary }} className="py-4 px-4">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Dashboard Component
export const Dashboard: React.FC<{ userType?: 'patient' | 'pharmacy' }> = ({ userType = 'patient' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(stored ? stored === 'dark' : prefersDark);
  }, []);

  const theme = isDark ? colors.dark : colors.light;

  return (
    <DashboardContext.Provider value={{ isDark, toggleTheme: () => setIsDark(!isDark) }}>
      <div
        style={{ backgroundColor: theme.bg }}
        className="flex h-screen overflow-hidden"
      >
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userType={userType} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          {/* Page Content */}
          <main
            style={{ backgroundColor: theme.bg }}
            className="flex-1 overflow-y-auto"
          >
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                {userType === 'patient' ? (
                  <PatientDashboardContent key="patient" />
                ) : (
                  <PharmacyDashboardContent key="pharmacy" />
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
};

export default Dashboard;
