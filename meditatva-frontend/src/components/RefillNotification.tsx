import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Package, 
  Bell, 
  X,
  RefreshCw 
} from "lucide-react";
import { useState } from "react";

interface LowStockMedicine {
  _id: string;
  medicine: {
    _id: string;
    name: string;
    genericName?: string;
    category?: string;
  };
  current_stock: number;
  reorderLevel: number;
}

interface RefillNotificationProps {
  lowStockMedicines: LowStockMedicine[];
  onRefreshAlerts?: () => void;
}

export const RefillNotification = ({ lowStockMedicines, onRefreshAlerts }: RefillNotificationProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isDismissed || lowStockMedicines.length === 0) {
    return null;
  }

  const criticalMedicines = lowStockMedicines.filter(
    med => med.current_stock === 0
  );
  const lowMedicines = lowStockMedicines.filter(
    med => med.current_stock > 0 && med.current_stock <= med.reorderLevel
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4"
      >
        <Alert className="relative overflow-hidden border-0 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 dark:from-teal-600 dark:via-cyan-600 dark:to-blue-700 shadow-2xl">
          {/* Animated background overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          
          <div className="relative flex items-start gap-3 text-white">
            <div className="flex-shrink-0 mt-0.5">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -15, 15, -15, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="bg-white/20 backdrop-blur-sm p-2 rounded-full"
              >
                <Bell className="h-5 w-5 text-yellow-300" />
              </motion.div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-300" />
                  <h4 className="font-bold text-white text-lg">
                    🏥 Medicine Cabinet Refill Alert
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {onRefreshAlerts && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRefreshAlerts}
                      className="h-7 text-xs text-white hover:text-yellow-300 hover:bg-white/20 backdrop-blur-sm"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDismissed(true)}
                    className="h-7 w-7 p-0 text-white hover:text-yellow-300 hover:bg-white/20 backdrop-blur-sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <AlertDescription className="text-white">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Package className="h-4 w-4 text-yellow-300" />
                  <span className="text-white font-semibold">
                    <strong className="text-yellow-300">{lowStockMedicines.length}</strong> medicine(s) need attention
                  </span>
                  {criticalMedicines.length > 0 && (
                    <Badge variant="destructive" className="ml-2 bg-red-600 hover:bg-red-700 border-0 shadow-lg">
                      {criticalMedicines.length} Out of Stock
                    </Badge>
                  )}
                  {lowMedicines.length > 0 && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg font-semibold">
                      {lowMedicines.length} Low Stock
                    </Badge>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-white border-white/30 hover:bg-white/20 hover:text-yellow-300 backdrop-blur-sm mb-2 font-semibold"
                >
                  {isExpanded ? "Hide Details" : "View Details"}
                </Button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-3 max-h-60 overflow-y-auto bg-white/10 backdrop-blur-md rounded-lg p-3">
                        {criticalMedicines.length > 0 && (
                          <div>
                            <h5 className="font-bold text-red-100 mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-300" />
                              Out of Stock ({criticalMedicines.length})
                            </h5>
                            {criticalMedicines.map((med) => (
                              <div
                                key={med._id}
                                className="flex items-center justify-between p-3 bg-white/90 backdrop-blur-sm rounded-lg mb-2 shadow-md"
                              >
                                <div>
                                  <p className="font-bold text-red-900">
                                    {med.medicine.name}
                                  </p>
                                  {med.medicine.genericName && (
                                    <p className="text-xs text-red-700">
                                      {med.medicine.genericName}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="destructive" className="text-xs bg-red-600 shadow-lg">
                                  Stock: 0
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}

                        {lowMedicines.length > 0 && (
                          <div>
                            <h5 className="font-bold text-yellow-100 mb-2 flex items-center gap-2">
                              <Package className="h-4 w-4 text-yellow-300" />
                              Low Stock ({lowMedicines.length})
                            </h5>
                            {lowMedicines.map((med) => (
                              <div
                                key={med._id}
                                className="flex items-center justify-between p-3 bg-white/90 backdrop-blur-sm rounded-lg mb-2 shadow-md"
                              >
                                <div>
                                  <p className="font-bold text-gray-900">
                                    {med.medicine.name}
                                  </p>
                                  {med.medicine.genericName && (
                                    <p className="text-xs text-gray-700">
                                      {med.medicine.genericName}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs border-0 shadow-lg font-semibold"
                                  >
                                    Stock: {med.current_stock}
                                  </Badge>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Reorder: {med.reorderLevel}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};
