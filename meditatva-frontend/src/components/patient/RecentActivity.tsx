import { ShoppingCart, Calendar, Camera, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const activities = [
  {
    icon: ShoppingCart,
    title: "Ordered Paracetamol 500mg",
    time: "2 hours ago",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
  },
  {
    icon: Calendar,
    title: "Appointment with Dr. Sharma",
    time: "Yesterday",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30"
  },
  {
    icon: Camera,
    title: "Uploaded prescription",
    time: "2 days ago",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-950/30"
  },
  {
    icon: Bell,
    title: "Medicine reminder set",
    time: "3 days ago",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30"
  },
];

export const RecentActivity = () => {
  return (
    <Card className="p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Recent Activity
      </h3>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`p-2 rounded-lg ${activity.color}`}>
              <activity.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                {activity.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};
