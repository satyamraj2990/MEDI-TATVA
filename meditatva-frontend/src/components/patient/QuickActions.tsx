import { motion } from "framer-motion";
import { Camera, Search, Calendar, MessageSquare, FileBarChart, Phone, Mic, Video } from "lucide-react";

interface QuickAction {
  icon: any;
  label: string;
  description: string;
  gradient: string;
  onClick: () => void;
}

interface QuickActionsProps {
  onScanClick: () => void;
  onFindMedicineClick: () => void;
  onAppointmentClick: () => void;
  onAIAssistantClick: () => void;
  onReportAnalyzerClick: () => void;
  onVoiceCallClick: () => void;
  onVoiceChatClick: () => void;
  onConferenceCallClick: () => void;
}

export const QuickActions = ({
  onScanClick,
  onFindMedicineClick,
  onAppointmentClick,
  onAIAssistantClick,
  onReportAnalyzerClick,
  onVoiceCallClick,
  onVoiceChatClick,
  onConferenceCallClick
}: QuickActionsProps) => {
  const actions: QuickAction[] = [
    {
      icon: Camera,
      label: "Scan Prescription",
      description: "Upload & analyze",
      gradient: "from-pink-500 via-rose-500 to-pink-600",
      onClick: onScanClick
    },
    {
      icon: Search,
      label: "Find Medicine",
      description: "Search nearby",
      gradient: "from-cyan-500 via-teal-500 to-cyan-600",
      onClick: onFindMedicineClick
    },
    {
      icon: Calendar,
      label: "Book Appointment",
      description: "See doctors",
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      onClick: onAppointmentClick
    },
    {
      icon: MessageSquare,
      label: "AI Assistant",
      description: "Get health advice",
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
      onClick: onAIAssistantClick
    },
    {
      icon: FileBarChart,
      label: "Medical Reports",
      description: "Upload & analyze",
      gradient: "from-sky-500 via-blue-500 to-indigo-500",
      onClick: onReportAnalyzerClick
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={index}
              onClick={action.onClick}
              className={`relative overflow-hidden rounded-2xl p-6 text-white transition-all hover:scale-105 bg-gradient-to-br ${action.gradient} shadow-lg hover:shadow-xl`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="relative z-10">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-base mb-1">{action.label}</h4>
                <p className="text-xs text-white/80">{action.description}</p>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
            </motion.button>
          );
        })}
      </div>

      {/* Voice/Call Saarthi Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.button
          onClick={onVoiceChatClick}
          className="relative overflow-hidden rounded-xl p-5 text-white bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-white/20">
              <Mic className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-sm">Voice Chat</h4>
              <p className="text-xs text-white/80">Talk to AI Saarthi</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={onVoiceCallClick}
          className="relative overflow-hidden rounded-xl p-5 text-white bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-white/20">
              <Phone className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-sm">Call Saarthi</h4>
              <p className="text-xs text-white/80">Voice call support</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={onConferenceCallClick}
          className="relative overflow-hidden rounded-xl p-5 text-white bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-white/20">
              <Video className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-sm">Conference Call</h4>
              <p className="text-xs text-white/80">Multi-party consult</p>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};
