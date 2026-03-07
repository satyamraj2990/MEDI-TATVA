import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain, TrendingUp, TrendingDown, Package, AlertTriangle,
  DollarSign, Activity, Zap, MessageCircle, Send, X,
  ArrowUp, ArrowDown, Minus, Calendar, BarChart3, PieChart,
  ShoppingCart, Clock, Sparkles, Target, RefreshCw
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.05 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

// AI-Powered Data
const demandForecast = [
  { medicine: "Paracetamol", current: 45, predicted: 68, change: 51, trend: "up" },
  { medicine: "Cetirizine", current: 32, predicted: 52, change: 62, trend: "up" },
  { medicine: "Ibuprofen", current: 28, predicted: 35, change: 25, trend: "up" },
  { medicine: "Amoxicillin", current: 24, predicted: 18, change: -25, trend: "down" },
  { medicine: "Vitamin C", current: 38, predicted: 42, change: 10, trend: "up" },
];

const stockOptimization = [
  { id: 1, medicine: "Cetirizine 10mg", action: "Restock Now", priority: "high", quantity: 150, reason: "High demand + Low stock" },
  { id: 2, medicine: "Paracetamol 500mg", action: "Restock Soon", priority: "medium", quantity: 100, reason: "Seasonal spike expected" },
  { id: 3, medicine: "Amoxicillin 250mg", action: "Reduce Orders", priority: "low", quantity: -50, reason: "Slow moving inventory" },
  { id: 4, medicine: "Omeprazole 20mg", action: "Optimize Stock", priority: "medium", quantity: 75, reason: "Steady demand pattern" },
];

const purchaseTrends = [
  { combo: "Paracetamol + Cetirizine", frequency: 145, percentage: 28 },
  { combo: "Ibuprofen + Omeprazole", frequency: 98, percentage: 19 },
  { combo: "Vitamin C + Zinc", frequency: 87, percentage: 17 },
  { combo: "Cough Syrup + Lozenges", frequency: 72, percentage: 14 },
  { combo: "Others", frequency: 113, percentage: 22 },
];

const expiryAlerts = [
  { id: 1, medicine: "Azithromycin 500mg", batch: "AZ2401", expiryDate: "2025-11-15", daysLeft: 8, stock: 45, risk: "critical" },
  { id: 2, medicine: "Cetirizine 10mg", batch: "CT2402", expiryDate: "2025-11-25", daysLeft: 18, stock: 28, risk: "high" },
  { id: 3, medicine: "Vitamin D3", batch: "VD2403", expiryDate: "2025-12-10", daysLeft: 33, stock: 62, risk: "medium" },
  { id: 4, medicine: "Paracetamol 650mg", batch: "PC2404", expiryDate: "2025-12-20", daysLeft: 43, stock: 120, risk: "low" },
];

const revenueForecast = [
  { week: "Week 1", actual: 45000, predicted: 47000 },
  { week: "Week 2", actual: 52000, predicted: 54000 },
  { week: "Week 3", actual: 48000, predicted: 51000 },
  { week: "Week 4", actual: 61000, predicted: 65000 },
  { week: "Week 5", predicted: 68000 },
  { week: "Week 6", predicted: 72000 },
];

const healthTrends = [
  { condition: "Cold & Flu", cases: 245, change: 45, medicines: ["Paracetamol", "Cetirizine"] },
  { condition: "Allergies", cases: 178, change: 32, medicines: ["Cetirizine", "Montelukast"] },
  { condition: "Digestive Issues", cases: 142, change: -12, medicines: ["Omeprazole", "Antacids"] },
  { condition: "Pain Relief", cases: 198, change: 18, medicines: ["Ibuprofen", "Diclofenac"] },
];

const trendingMedicines = [
  { name: "Paracetamol", value: 340 },
  { name: "Cetirizine", value: 280 },
  { name: "Ibuprofen", value: 220 },
  { name: "Omeprazole", value: 180 },
  { name: "Others", value: 320 },
];

const COLORS = ['#1B6CA8', '#4FC3F7', '#2ECC71', '#F39C12', '#E74C3C'];

const aiSummary = {
  weeklyChange: 12,
  inventoryTurnover: 8,
  topSeller: "Paracetamol",
  criticalAlerts: 2,
  revenueGrowth: 15,
  optimizationScore: 87,
};

const chatbotResponses: { [key: string]: string } = {
  "painkillers": "Paracetamol is selling most with 340 units this week (↑12%). Ibuprofen follows with 220 units.",
  "expiry": "2 medicines have critical expiry risk: Azithromycin (8 days) and Cetirizine (18 days). Recommend flash sale.",
  "revenue": "Predicted revenue for next week is ₹68,000 (↑11%). Month-end forecast: ₹2.8L (↑15%).",
  "restock": "AI suggests restocking: Cetirizine (150 units - HIGH priority), Paracetamol (100 units - MEDIUM priority).",
  "trending": "Cold & Flu cases up 45% in your area. Stock up on Paracetamol, Cetirizine, and Cough syrups.",
  "slow": "Amoxicillin is slow-moving (-25% demand). Consider reducing next order by 50 units.",
};

export const AIInsightsTab = memo(() => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'ai', text: string }>>([
    { type: 'ai', text: "👋 Hi! I'm your AI Pharmacy Assistant. Ask me about sales, inventory, expiry risks, or trends!" }
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.toLowerCase();
    setChatMessages(prev => [...prev, { type: 'user', text: chatInput }]);

    // Simple AI response matching
    let aiResponse = "I'm analyzing your data... ";
    
    if (userMessage.includes('painkiller') || userMessage.includes('pain')) {
      aiResponse = chatbotResponses.painkillers;
    } else if (userMessage.includes('expiry') || userMessage.includes('expire')) {
      aiResponse = chatbotResponses.expiry;
    } else if (userMessage.includes('revenue') || userMessage.includes('sales')) {
      aiResponse = chatbotResponses.revenue;
    } else if (userMessage.includes('restock') || userMessage.includes('stock')) {
      aiResponse = chatbotResponses.restock;
    } else if (userMessage.includes('trend') || userMessage.includes('area')) {
      aiResponse = chatbotResponses.trending;
    } else if (userMessage.includes('slow')) {
      aiResponse = chatbotResponses.slow;
    } else {
      aiResponse = "I can help you with: Sales trends, Expiry alerts, Revenue forecasts, Restocking suggestions, Health trends in your area, and Slow-moving inventory. What would you like to know?";
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
    }, 500);

    setChatInput("");
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4 sm:space-y-5 lg:space-y-6 relative"
    >
      {/* AI Summary Banner */}
      <motion.div variants={cardVariants}>
        <Card
          className="p-3 sm:p-4 lg:p-6 relative overflow-hidden bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 border-none shadow-[0_0_60px_rgba(34,197,94,0.4)]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">AI-Powered Insights</h2>
                    <p className="text-white/80 text-xs sm:text-sm">Real-time analytics and predictions</p>
                  </div>
                </div>
                <p className="text-white text-sm sm:text-base lg:text-lg leading-relaxed">
                  <strong>{aiSummary.topSeller}</strong> saw a <strong>{aiSummary.weeklyChange}% rise</strong> this week. 
                  Inventory turnover improved by <strong>{aiSummary.inventoryTurnover}%</strong>. 
                  You have <strong>{aiSummary.criticalAlerts} critical alerts</strong> requiring immediate attention.
                </p>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-center px-3 sm:px-6 py-2 sm:py-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{aiSummary.optimizationScore}%</div>
                  <div className="text-white/80 text-xs font-semibold">AI Score</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div variants={cardVariants}>
          <Card className="p-3 sm:p-4 lg:p-5 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-gray-200/50 dark:border-white/10 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#2ECC71] to-[#27AE60] flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Revenue Growth</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{aiSummary.revenueGrowth}%</div>
                <div className="flex items-center gap-1 text-sm text-[#2ECC71] dark:text-emerald-400 mt-1">
                  <ArrowUp className="h-4 w-4" />
                  <span>vs last month</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-5 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-gray-200/50 dark:border-white/10 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#F39C12] to-[#E67E22] flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Expiry Alerts</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{aiSummary.criticalAlerts}</div>
                <div className="text-sm text-[#F39C12] dark:text-amber-400 mt-1">Critical attention needed</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-5 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-gray-200/50 dark:border-white/10 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#1B6CA8] to-[#4FC3F7] flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Turnover Rate</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{aiSummary.inventoryTurnover}%</div>
                <div className="flex items-center gap-1 text-sm text-[#2ECC71] dark:text-emerald-400 mt-1">
                  <ArrowUp className="h-4 w-4" />
                  <span>Improved efficiency</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-5 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-gray-200/50 dark:border-white/10 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#9B59B6] to-[#8E44AD] flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">AI Optimization</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{aiSummary.optimizationScore}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overall score</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales & Demand Prediction */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-gray-200/50 dark:border-white/10 shadow-xl dark:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#1B6CA8] to-[#4FC3F7] flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Demand Forecast</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">AI-predicted next 7 days</p>
                </div>
              </div>
              <Badge className="bg-[#2ECC71]/10 text-[#2ECC71] dark:text-emerald-400 border-[#2ECC71]/30 dark:border-emerald-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
            <div className="space-y-3">
              {demandForecast.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-100/80 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{item.medicine}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Current: {item.current} units</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-lg font-bold text-[#1B6CA8] dark:text-cyan-400">{item.predicted}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Predicted</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                    item.trend === 'up' 
                      ? 'bg-[#2ECC71]/10 text-[#2ECC71] dark:text-emerald-400' 
                      : 'bg-[#E74C3C]/10 text-[#E74C3C]'
                  }`}>
                    {item.trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    <span className="text-sm font-bold">{Math.abs(item.change)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Revenue Forecast Chart */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-emerald-500/30 dark:border-emerald-500/20 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Revenue Forecast</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Actual vs Predicted</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueForecast}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B6CA8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1B6CA8" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2ECC71" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                <XAxis dataKey="week" stroke="#64748b" className="text-xs" />
                <YAxis stroke="#64748b" className="text-xs" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#1B6CA8"
                  strokeWidth={3}
                  fill="url(#actualGradient)"
                  name="Actual Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#2ECC71"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fill="url(#predictedGradient)"
                  name="Predicted Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Stock Optimization & Purchase Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Optimization */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-purple-500/30 dark:border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Stock Optimization</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">AI-recommended actions</p>
                </div>
              </div>
              <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/40 shadow-lg shadow-purple-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
            <div className="space-y-3">
              {stockOptimization.map((item) => (
                <motion.div
                  key={item.id}
                  className="p-4 rounded-xl border-2 hover:shadow-lg transition-all bg-gradient-to-br"
                  style={{
                    borderColor: item.priority === 'high' 
                      ? 'rgba(239, 68, 68, 0.4)'
                      : item.priority === 'medium'
                      ? 'rgba(245, 158, 11, 0.4)'
                      : 'rgba(34, 197, 94, 0.4)',
                    background: item.priority === 'high'
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))'
                      : item.priority === 'medium'
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))'
                      : 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={
                          item.priority === 'high'
                            ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40 font-bold shadow-lg'
                            : item.priority === 'medium'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 font-bold shadow-lg'
                            : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold shadow-lg'
                        }>
                          {item.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{item.action}</span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white">{item.medicine}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${item.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {item.quantity > 0 ? '+' : ''}{item.quantity}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">units</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Purchase Trends Pie Chart */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-cyan-500/30 dark:border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Purchase Trends</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Most bought combinations</p>
                </div>
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/40 shadow-lg shadow-cyan-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RePieChart>
                <Pie
                  data={trendingMedicines}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const total = trendingMedicines.reduce((sum, item) => sum + item.value, 0);
                    const percentage = ((entry.value / total) * 100).toFixed(0);
                    return `${entry.name} ${percentage}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trendingMedicines.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {purchaseTrends.slice(0, 4).map((trend, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gradient-to-br from-gray-100/80 to-gray-50/80 dark:from-white/10 dark:to-white/5 rounded-lg border border-gray-200/50 dark:border-white/10">
                  <div className="h-3 w-3 rounded-full shadow-lg" style={{ background: COLORS[index] }} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{trend.combo}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{trend.frequency} purchases</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Expiry Alerts & Health Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiry Risk Alerts */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-red-500/30 dark:border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/50">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Expiry Risk Alerts</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Medicines expiring soon</p>
                </div>
              </div>
              <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40 font-bold shadow-lg shadow-red-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                URGENT
              </Badge>
            </div>
            <div className="space-y-3">
              {expiryAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-xl border-2"
                  style={{
                    background: alert.risk === 'critical'
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))'
                      : alert.risk === 'high'
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))'
                      : alert.risk === 'medium'
                      ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))'
                      : 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))',
                    borderColor: alert.risk === 'critical'
                        ? 'rgba(239, 68, 68, 0.5)'
                        : alert.risk === 'high'
                        ? 'rgba(245, 158, 11, 0.5)'
                        : alert.risk === 'medium'
                        ? 'rgba(6, 182, 212, 0.5)'
                        : 'rgba(34, 197, 94, 0.5)',
                  }}
                  whileHover={{ x: 4, scale: 1.01 }}
                >
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">{alert.medicine}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Batch: {alert.batch} • Stock: {alert.stock} units</p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 font-bold ${
                      alert.risk === 'critical' ? 'text-red-600 dark:text-red-400' :
                      alert.risk === 'high' ? 'text-amber-600 dark:text-amber-400' :
                      alert.risk === 'medium' ? 'text-cyan-600 dark:text-cyan-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      <Calendar className="h-4 w-4" />
                      <span>{alert.daysLeft} days</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{alert.expiryDate}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Health Trends in Area */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-emerald-500/30 dark:border-emerald-500/20 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Health Trends in Your Area</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Trending conditions & medicines</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/30">
                <Activity className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
            </div>
            <div className="space-y-3">
              {healthTrends.map((trend, index) => (
                <motion.div
                  key={index}
                  className="p-4 rounded-xl bg-gradient-to-br from-gray-100/80 to-gray-50/80 dark:from-white/10 dark:to-white/5 border-2 border-emerald-500/20 dark:border-emerald-500/30 hover:border-emerald-500/40 dark:hover:border-emerald-500/50 transition-all shadow-lg"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">{trend.condition}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{trend.cases} cases reported</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold shadow-md ${
                      trend.change > 0
                        ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40'
                        : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {trend.change > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      <span className="text-sm font-bold">{Math.abs(trend.change)}%</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trend.medicines.map((med, i) => (
                      <Badge key={i} className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 font-medium shadow-md">
                        {med}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* AI Chatbot Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setChatOpen(!chatOpen)}
            size="lg"
            className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] transition-all"
          >
            {chatOpen ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
          </Button>
        </motion.div>
      </motion.div>

      {/* AI Chatbot Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="fixed bottom-28 right-8 w-96 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="overflow-hidden shadow-2xl border-2 border-emerald-500/30 bg-white/5 backdrop-blur-xl">
              <div
                className="p-4 border-b bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 border-b-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">AI Pharmacy Assistant</h3>
                    <p className="text-xs text-white/80">Ask me anything!</p>
                  </div>
                </div>
              </div>

              <div className="h-96 overflow-y-auto p-4 space-y-3 bg-[#F7F9FC]">
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] text-white'
                          : 'bg-white text-[#0A2342] border border-[#4FC3F7]/20'
                      }`}
                    >
                      {msg.type === 'ai' && (
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-4 w-4 text-[#4FC3F7]" />
                          <span className="text-xs font-bold text-[#5A6A85]">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about sales, expiry, trends..."
                    className="flex-1 border-[#4FC3F7]/30 focus:border-[#1B6CA8]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

AIInsightsTab.displayName = "AIInsightsTab";

