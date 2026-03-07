import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  ArrowLeft,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "pharmacy";
  
  const [role, setRole] = useState<"patient" | "pharmacy">(initialRole as "patient" | "pharmacy");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validCredentials = {
    patient: { email: "patient@meditatva.com", password: "patient123" },
    pharmacy: { email: "pharmacy@meditatva.com", password: "pharmacy123" },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      email === validCredentials[role].email &&
      password === validCredentials[role].password
    ) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", role);
      toast.success(`Welcome back!`);
      // Use replace to avoid back button issues
      navigate(role === "patient" ? "/patient/premium" : "/pharmacy/dashboard/order-requests", { replace: true });
    } else {
      toast.error("Invalid credentials. Please try demo access!");
    }
  };

  const useDemoCredentials = () => {
    setEmail(validCredentials[role].email);
    setPassword(validCredentials[role].password);
    toast.success("Demo credentials filled!");
  };


  return (
    <div className="dark relative w-full min-h-screen flex items-center justify-center bg-slate-900 p-4">
      
      {/* Background pattern - dark theme only */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900 opacity-60" />
      
      {/* Navigation Bar - Top */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6">
        {/* Back to Home Button - Clean and Modern */}
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-lg transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Home</span>
        </button>
      </div>
      
      {/* Login Container */}
      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
          
          {/* Brand Badge */}
          <div className="text-center mb-8">
            <div className="inline-block px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
              <span className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">
                MediTatva Healthcare
              </span>
            </div>
            
            {/* Welcome Text */}
            <h2 className="text-4xl font-bold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-400">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-700/50 rounded-xl">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  role === "patient" 
                    ? "bg-emerald-600 text-white shadow-md" 
                    : "text-slate-400 hover:text-white hover:bg-slate-700/30"
                }`}
              >
                <User className="w-4 h-4" />
                Patient
              </button>
              <button
                type="button"
                onClick={() => setRole("pharmacy")}
                className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  role === "pharmacy" 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25" 
                    : "text-slate-400 hover:text-white hover:bg-slate-700/30"
                }`}
              >
                <Building2 className="w-4 h-4" />
                Pharmacy
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="patient@meditatva.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/25 transition-all duration-200"
            >
              Sign in
            </Button>

            {/* Use Demo Credentials */}
            <button
              type="button"
              onClick={useDemoCredentials}
              className="w-full text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Use Demo Credentials
            </button>

            {/* Demo Access Info */}
            <div className="p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
              <p className="text-xs text-slate-400 mb-1 font-semibold">Demo Access:</p>
              <p className="text-sm text-white font-mono">
                {validCredentials[role].email} / {validCredentials[role].password}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
