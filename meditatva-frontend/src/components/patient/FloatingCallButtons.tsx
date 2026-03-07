import { motion } from "framer-motion";
import { Phone, Mic, Video, X } from "lucide-react";
import { useState } from "react";

interface FloatingCallButtonsProps {
  onVoiceCall: () => void;
  onVoiceChat: () => void;
  onConferenceCall: () => void;
}

export const FloatingCallButtons = ({
  onVoiceCall,
  onVoiceChat,
  onConferenceCall
}: FloatingCallButtonsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const buttons = [
    { icon: Phone, label: "Call", onClick: onVoiceCall, gradient: "from-emerald-500 to-teal-600" },
    { icon: Mic, label: "Voice", onClick: onVoiceChat, gradient: "from-purple-500 to-violet-600" },
    { icon: Video, label: "Meet", onClick: onConferenceCall, gradient: "from-orange-500 to-amber-600" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
      {/* Action Buttons */}
      {isExpanded && (
        <>
          {buttons.map((button, index) => {
            const Icon = button.icon;
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  button.onClick();
                  setIsExpanded(false);
                }}
                className={`group flex items-center gap-3 rounded-full bg-gradient-to-r ${button.gradient} px-5 py-3 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105`}
              >
                <span className="text-sm font-medium">{button.label}</span>
                <div className="p-2 rounded-full bg-white/20">
                  <Icon className="h-5 w-5" />
                </div>
              </motion.button>
            );
          })}
        </>
      )}

      {/* Main Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`group relative overflow-hidden rounded-full p-4 shadow-lg transition-all hover:scale-110 ${
          isExpanded
            ? "bg-gray-900 dark:bg-gray-100"
            : "bg-gradient-to-r from-teal-500 to-cyan-600"
        }`}
        whileHover={{ rotate: isExpanded ? 0 : 15 }}
        whileTap={{ scale: 0.9 }}
      >
        {isExpanded ? (
          <X className="h-6 w-6 text-white dark:text-gray-900" />
        ) : (
          <Phone className="h-6 w-6 text-white" />
        )}
        
        {/* Pulse animation when not expanded */}
        {!isExpanded && (
          <span className="absolute inset-0 rounded-full bg-teal-400 opacity-75 animate-ping" />
        )}
      </motion.button>
    </div>
  );
};
