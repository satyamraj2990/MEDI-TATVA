import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from "recharts";
import {
  Package, Users, TrendingUp, MessageCircle, ArrowUp, Pill,
  AlertCircle, Sparkles, AlertTriangle
} from "lucide-react";

// Mock Data
const statsData = {
  totalMedicines: { value: 1245, change: 12 },
  activePatients: { value: 342, change: 8 },
  monthlyRevenue: { value: 48.5, change: 23 },
  chatRequests: { value: 28, new: 3 }
};

const inventoryAlerts = [
  { id: 1, name: "Ibuprofen 400mg", current: 5, threshold: 20, status: "CRITICAL" },
  { id: 2, name: "Amoxicillin 250mg", current: 15, threshold: 50, status: "WARNING" },
  { id: 3, name: "Cetirizine 10mg", current: 8, threshold: 30, status: "CRITICAL" },
  { id: 4, name: "Paracetamol 500mg", current: 25, threshold: 100, status: "WARNING" },
];

const salesData = [
  { month: "Jan", revenue: 45000, orders: 320 },
  { month: "Feb", revenue: 52000, orders: 380 },
  { month: "Mar", revenue: 48000, orders: 340 },
  { month: "Apr", revenue: 61000, orders: 420 },
  { month: "May", revenue: 55000, orders: 390 },
  { month: "Jun", revenue: 67000, orders: 460 },
];

const topMedicines = [
  { name: "Paracetamol", sales: 1240, revenue: 15500 },
  { name: "Azithromycin", sales: 890, revenue: 24800 },
  { name: "Cetirizine", sales: 750, revenue: 9200 },
  { name: "Amoxicillin", sales: 680, revenue: 18400 },
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.05 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export const AnalyticsTab = memo(() => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4 sm:space-y-5 lg:space-y-6"
      style={{ filter: 'none', WebkitFilter: 'none' }}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <motion.div variants={cardVariants}>
          <Card
            className="p-3 sm:p-4 lg:p-5 relative overflow-hidden group cursor-pointer bg-white/95 dark:bg-white/5 backdrop-blur-xl border-gray-200/50 dark:border-white/10 hover:border-cyan-500/30 hover:shadow-xl dark:hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 font-semibold">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {statsData.totalMedicines.change}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{statsData.totalMedicines.value}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Medicines</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card
            className="p-5 relative overflow-hidden group cursor-pointer bg-white/95 dark:bg-white/5 backdrop-blur-xl border-gray-200/50 dark:border-white/10 hover:border-emerald-500/30 hover:shadow-xl dark:hover:shadow-[0_0_40px_rgba(34,197,94,0.3)] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 font-semibold">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {statsData.activePatients.change}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{statsData.activePatients.value}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Patients</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card
            className="p-5 relative overflow-hidden group cursor-pointer bg-white/95 dark:bg-white/5 backdrop-blur-xl border-gray-200/50 dark:border-white/10 hover:border-amber-500/30 hover:shadow-xl dark:hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 font-semibold">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {statsData.monthlyRevenue.change}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">₹{statsData.monthlyRevenue.value}K</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Monthly Revenue</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card
            className="p-5 relative overflow-hidden group cursor-pointer bg-white/95 dark:bg-white/5 backdrop-blur-xl border-gray-200/50 dark:border-white/10 hover:border-cyan-500/30 hover:shadow-xl dark:hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                {statsData.chatRequests.new > 0 && (
                  <Badge className="bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/30 font-semibold">
                    {statsData.chatRequests.new} New
                  </Badge>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{statsData.chatRequests.value}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Chat Requests</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={cardVariants}>
          <Card
            className="p-6 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-gray-200/50 dark:border-white/10 shadow-xl dark:shadow-2xl"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B6CA8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4FC3F7" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="month" stroke="#5A6A85" />
                <YAxis stroke="#5A6A85" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid rgba(27, 108, 168, 0.2)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1B6CA8"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card
            className="p-6 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-gray-200/50 dark:border-white/10 shadow-xl dark:shadow-2xl"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
              Top Selling Medicines
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topMedicines}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="name" stroke="#5A6A85" />
                <YAxis stroke="#5A6A85" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid rgba(27, 108, 168, 0.2)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
                  {topMedicines.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#1B6CA8" : "#4FC3F7"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Inventory Alerts - Enhanced with AI Insights Theme */}
      <motion.div variants={cardVariants}>
        <Card
          className="p-6 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-amber-500/30 dark:border-amber-500/20 shadow-[0_0_60px_rgba(245,158,11,0.4)]"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {inventoryAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                  alert.status === "CRITICAL"
                    ? "bg-gradient-to-br from-red-500/20 via-orange-500/20 to-amber-500/20 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                    : "bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                } backdrop-blur-md`}
                whileHover={{ scale: 1.02 }}
                animate={{
                  boxShadow: alert.status === "CRITICAL" 
                    ? [
                        "0 0 30px rgba(239,68,68,0.3)",
                        "0 0 40px rgba(239,68,68,0.5)",
                        "0 0 30px rgba(239,68,68,0.3)",
                      ]
                    : undefined
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      alert.status === "CRITICAL"
                        ? "bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/50"
                        : "bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/50"
                    }`}
                  >
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-white">{alert.name}</p>
                    <p className="text-sm text-white/90 font-medium">
                      <span className="text-white font-bold">{alert.current}</span> units | Threshold: {alert.threshold}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    alert.status === "CRITICAL"
                      ? "bg-red-500/30 text-white border-red-400/50 font-bold text-sm px-3 py-1 shadow-lg"
                      : "bg-amber-500/30 text-white border-amber-400/50 font-bold text-sm px-3 py-1 shadow-lg"
                  }
                >
                  ⚠️ {alert.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
});

AnalyticsTab.displayName = "AnalyticsTab";
