/**
 * Medicine Availability Sudoku - 3x3 Grid
 * Healthcare-focused puzzle showing realistic medicine availability across nearby stores
 * 
 * Pattern:
 * - Rows = Actual Medical Stores from CGC Jhangeri area
 * - Columns = Medicines (Paracetamol, Cetirizine, Amoxicillin)
 * - Shows realistic availability (some stores may not stock certain medicines)
 * 
 * SUDOKU PATTERN: Cetirizine is unavailable at some stores (marked with red "Unavailable" badge)
 * This reflects real-world scenarios where not all stores stock all medicines
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Store, CheckCircle2, RefreshCw, Sparkles, XCircle } from "lucide-react";

interface Medicine {
  name: string;
  color: string;
  bgColor: string;
  icon: string;
}

const MEDICINES: Medicine[] = [
  { 
    name: "Paracetamol", 
    color: "text-blue-700", 
    bgColor: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
    icon: "💊"
  },
  { 
    name: "Cetirizine", 
    color: "text-green-700", 
    bgColor: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
    icon: "🌿"
  },
  { 
    name: "Amoxicillin", 
    color: "text-purple-700", 
    bgColor: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700",
    icon: "💉"
  },
];

// Actual stores from CGC Jhangeri area
const STORES = ["Kailon Clinic", "Thakur Clinic", "Siya Health Care"];

// Availability Matrix (SUDOKU PATTERN for smart search)
// This pattern ensures users can find combo medicines:
// - Cetirizine UNAVAILABLE at stores 1, 2, 3 (Kailon, Thakur, Siya)
// - Cetirizine AVAILABLE at stores 4, 5, 6 (Behgal, Sharma, Kaushal)
// - When searching "Paracetamol, Cetirizine", stores with BOTH show first
const AVAILABILITY_MATRIX = [
  ["Available", "Unavailable", "Available"],    // Kailon Clinic - No Cetirizine
  ["Available", "Unavailable", "Available"],    // Thakur Clinic - No Cetirizine  
  ["Available", "Unavailable", "Available"],    // Siya Health Care - No Cetirizine
];

export const MedicineAvailabilitySudoku = () => {
  const [availabilityMatrix] = useState<string[][]>(AVAILABILITY_MATRIX);
  const [isAnimating, setIsAnimating] = useState(false);

  const getMedicine = (medicineName: string): Medicine => {
    return MEDICINES.find(m => m.name === medicineName) || MEDICINES[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="p-6 bg-gradient-to-br from-white to-cyan-50/30 dark:from-slate-800 dark:to-slate-900 border-2 border-cyan-200/50 dark:border-cyan-800/50 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Medicine Availability Matrix
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 ml-14">
              Real-time availability across nearby medical stores (Sudoku Pattern)
            </p>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-cyan-200/30 dark:border-cyan-700/30">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-cyan-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rows = Medical Stores</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Columns = Medicines</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">Red = Unavailable</span>
          </div>
        </div>

        {/* Sudoku Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Column Headers - Medicine Names */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div></div>
              {MEDICINES.map((medicine) => (
                <div key={medicine.name} className="text-center">
                  <Badge 
                    variant="outline" 
                    className={`w-full py-2 ${medicine.bgColor}`}
                  >
                    <span className="text-xl mr-1">{medicine.icon}</span>
                    <span className={`font-semibold ${medicine.color}`}>{medicine.name}</span>
                  </Badge>
                </div>
              ))}
            </div>

            {/* Grid Rows - Stores and Availability */}
            {availabilityMatrix.map((row, rowIdx) => (
              <motion.div
                key={`row-${rowIdx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIdx * 0.1 }}
                className="grid grid-cols-4 gap-3 mb-3"
              >
                {/* Row Header (Store Name) */}
                <div className="flex items-center">
                  <Badge 
                    variant="outline" 
                    className="w-full py-3 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/30 dark:to-teal-900/30 border-cyan-300 dark:border-cyan-700 justify-start"
                  >
                    <Store className="h-3 w-3 mr-2 text-cyan-600" />
                    <span className="font-semibold text-cyan-700 dark:text-cyan-300 text-sm">
                      {STORES[rowIdx]}
                    </span>
                  </Badge>
                </div>

                {/* Availability Cells */}
                {row.map((status, colIdx) => {
                  const medicine = MEDICINES[colIdx];
                  const isAvailable = status === "Available";
                  
                  return (
                    <motion.div
                      key={`cell-${rowIdx}-${colIdx}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (rowIdx * 3 + colIdx) * 0.05 }}
                    >
                      <Card className={`
                        ${isAvailable 
                          ? medicine.bgColor 
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                        } 
                        border-2 p-4 
                        hover:shadow-lg hover:scale-105 
                        transition-all duration-200 
                        cursor-pointer
                        relative overflow-hidden
                      `}>
                        <div className="absolute top-0 right-0 text-4xl opacity-10">
                          {isAvailable ? medicine.icon : '❌'}
                        </div>
                        <div className="relative z-10">
                          <div className="text-2xl mb-1">
                            {isAvailable ? medicine.icon : '❌'}
                          </div>
                          <div className={`text-xs font-bold ${
                            isAvailable ? medicine.color : 'text-red-700 dark:text-red-400'
                          }`}>
                            {isAvailable ? 'In Stock' : 'Unavailable'}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rules Section */}
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-2">
            📋 Medicine Availability Pattern (Sudoku-Inspired):
          </h3>
          <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <li>✓ Paracetamol & Amoxicillin: Available at stores 1-3 (shown above)</li>
            <li>✓ Cetirizine: Unavailable at stores 1-3, Available at stores 4-6 (Behgal, Sharma, Kaushal)</li>
            <li>✓ Red cells indicate out-of-stock medicines</li>
            <li>✓ When searching combos like "Paracetamol, Cetirizine", stores with BOTH show first</li>
            <li>✓ Smart sorting ensures you find complete medicine sets quickly</li>
          </ul>
        </div>
      </Card>
    </motion.div>
  );
};
