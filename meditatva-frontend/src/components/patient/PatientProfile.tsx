import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export const PatientProfile = () => {
  return (
    <div className="p-6 space-y-4">
      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-16 w-16 border-2 border-teal-500">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav" alt="Aarav Sharma" />
            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white">AS</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">Aarav Sharma</h3>
          <div className="flex gap-2 mt-1">
            <Badge className="bg-teal-500 hover:bg-teal-600 text-white text-xs">
              Premium
            </Badge>
            <Badge variant="outline" className="border-teal-500 text-teal-700 dark:text-teal-500 text-xs">
              Verified
            </Badge>
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-700 dark:text-gray-400">Health Score</span>
          <div className="flex items-center gap-1 text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            <span className="text-lg font-bold">91%</span>
          </div>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-gray-800 rounded-full overflow-hidden">\n          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-1000"
            style={{ width: '91%' }}
          />
        </div>
      </div>
    </div>
  );
};
