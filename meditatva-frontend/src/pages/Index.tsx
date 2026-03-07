import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  MapPin, 
  MessageCircle,
  Bot, 
  Shield, 
  Clock,
  Pill,
  Sparkles,
  ChevronRight,
  Star,
  Quote,
  ArrowRight,
  Heart,
  Activity,
  Zap,
  TrendingUp,
  Camera,
  BarChart3,
  Bell
} from "lucide-react";

const Index = () => {
  const { scrollY } = useScroll();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Patient",
      initials: "PS",
      text: "MediTatva helped me find emergency medicines at 2 AM. The AI search is incredibly fast and accurate!",
      rating: 5,
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "Pharmacy Owner",
      initials: "RK",
      text: "Since joining MediTatva, our pharmacy visibility has increased by 300%. The platform is a game-changer!",
      rating: 5,
      gradient: "from-purple-500 to-pink-600"
    },
    {
      name: "Anita Desai",
      role: "Patient",
      initials: "AD",
      text: "The real-time availability feature saved me hours of calling different pharmacies. Highly recommended!",
      rating: 5,
      gradient: "from-teal-500 to-emerald-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 20;
        const y = (e.clientY - rect.top - rect.height / 2) / 20;
        cursorX.set(x);
        cursorY.set(y);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Enhanced scroll-replay animation variants
  const fadeInUp = {
    hidden: { 
      opacity: 0, 
      y: 16 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut" as const,
        delay: 0.08
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0
      }
    }
  };

  // Advanced 3D card entry variants - replays on each scroll
  const cardVariants = {
    leftEntry: {
      hidden: { 
        opacity: 0, 
        x: -60,
        rotateY: -4,
        z: -28,
        transition: {
          duration: 0
        }
      },
      visible: { 
        opacity: 1, 
        x: 0,
        rotateY: 0,
        z: 28,
        transition: { 
          duration: 0.9,
          ease: "easeOut" as const
        }
      }
    },
    centerEntry: {
      hidden: { 
        opacity: 0, 
        y: 20,
        scale: 0.96,
        z: -28
      },
      visible: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        z: 28,
        transition: { 
          duration: 0.9,
          ease: "easeOut" as const,
          delay: 0.12
        }
      }
    },
    rightEntry: {
      hidden: { 
        opacity: 0, 
        x: 60,
        rotateY: 4,
        z: -28
      },
      visible: { 
        opacity: 1, 
        x: 0,
        rotateY: 0,
        z: 28,
        transition: { 
          duration: 0.9,
          ease: "easeOut" as const,
          delay: 0.24
        }
      }
    },
    mobileEntry: {
      hidden: { 
        opacity: 0, 
        y: 24
      },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.6,
          ease: "easeOut" as const
        }
      }
    }
  };

  // Icon animation variant - plays after card settles
  const iconVariant = {
    hidden: {
      opacity: 0,
      scale: 0.85
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
        delay: 0.4
      }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-slate-950">
      {/* Cosmic Mesh Gradient Background */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Animated Aurora Blobs */}
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[150px]"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[700px] h-[700px] rounded-full opacity-20 blur-[150px]"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full opacity-15 blur-[150px]"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }}
          animate={{
            x: [-50, 50, -50],
            y: [-50, 50, -50],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Subtle professional snow animation layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 35 }).map((_, i) => {
            const size = Math.random() * 3 + 2; // Smaller: 2-5px
            const leftPos = Math.random() * 100;
            const duration = Math.random() * 5 + 8; // Moderate: 8-13 seconds
            const delay = Math.random() * -15;
            const opacity = Math.random() * 0.2 + 0.15; // Very subtle: 0.15-0.35
            const isBlue = Math.random() > 0.7;
            
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${leftPos}%`,
                  top: '-10px',
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: isBlue ? 'rgba(179, 217, 255, 0.5)' : 'rgba(255, 255, 255, 0.6)',
                  opacity: opacity,
                  filter: 'blur(0.8px)',
                  boxShadow: '0 0 4px rgba(255, 255, 255, 0.2)'
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, (Math.random() - 0.5) * 60],
                  rotate: [0, Math.random() * 180]
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: delay
                }}
              />
            );
          })}
        </div>
        
        {/* Animated Gradient Lines */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30"
          animate={{ x: [-1000, 1000] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"
          animate={{ x: [1000, -1000] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Radial Glows - Responsive */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Premium Navigation Bar */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
        style={{
          background: 'rgba(11, 18, 32, 0.8)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Pill className="h-6 w-6 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 blur-md opacity-40" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              MediTatva
            </span>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section - Premium Enterprise Design */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 pt-20 z-10">
        {/* Rotating Ring Animation - Responsive */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-64 h-64 sm:w-96 sm:h-96 md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] rounded-full border border-cyan-500/30" />
          <div className="absolute w-56 h-56 sm:w-80 sm:h-80 md:w-[500px] md:h-[500px] lg:w-[700px] lg:h-[700px] rounded-full border border-blue-500/20" />
          <div className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-[400px] md:h-[400px] lg:w-[600px] lg:h-[600px] rounded-full border border-purple-500/20" />
        </motion.div>

        <motion.div 
          className="container mx-auto text-center relative z-10"
          style={{ opacity }}
        >
          {/* AI-Powered Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/40 backdrop-blur-xl border border-white/10 mb-8"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI-Powered Healthcare
            </span>
          </motion.div>

          {/* 3D Floating Bot Icon */}
          <motion.div
            className="flex justify-center mb-8"
            style={{
              x: cursorXSpring,
              y: cursorYSpring,
            }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5] 
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl border border-cyan-400/30"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Bot className="h-12 w-12 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Main Title with Gradient Stroke - Responsive */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 relative inline-block px-4">
              <span 
                className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
                style={{
                  WebkitTextStroke: '1px rgba(20, 184, 166, 0.3)',
                  paintOrder: 'stroke fill',
                }}
              >
                MediTatva
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                style={{
                  WebkitMaskImage: 'linear-gradient(90deg, transparent, black, transparent)',
                  maskImage: 'linear-gradient(90deg, transparent, black, transparent)',
                }}
              />
            </h1>
          </motion.div>

          <motion.p 
            className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-semibold mb-4 text-white/90 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Find Your Medicines Instantly
          </motion.p>

          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-12 max-w-3xl mx-auto px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Connect with verified pharmacies, search medicines intelligently, and get AI-powered health assistance all in one platform
          </motion.p>

          {/* Premium CTA Buttons with Shimmer Effect */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link to="/login?role=patient" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full group relative overflow-hidden rounded-xl"
              >
                <Button className="relative text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-7 h-auto w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-400/50 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300">
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                    Login as Patient
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </Link>

            <Link to="/login?role=pharmacy" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full group relative overflow-hidden rounded-xl"
              >
                <Button className="relative text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-7 h-auto w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 border border-purple-400/50 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300">
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                    Login as Pharmacy
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Refined Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <span className="text-xs uppercase tracking-wider">Scroll</span>
            <div className="w-5 h-8 border border-current rounded-full flex justify-center p-1">
              <motion.div 
                className="w-1 h-2 bg-current rounded-full"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trust Signals Strip */}
      <section className="py-20 border-y border-white/[0.05] relative z-20 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50K+", label: "Active Users", delay: 0 },
              { value: "98%", label: "AI Accuracy", delay: 0.12 },
              { value: "<2s", label: "Response Time", delay: 0.24 },
              { value: "500+", label: "Partner Pharmacies", delay: 0.36 }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.8, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: stat.delay,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <div className="text-3xl md:text-4xl font-semibold text-white mb-2" style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.5), 0 2px 4px rgba(0,0,0,0.8)' }}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Vibrant Gradient Cards */}
      <section className="py-32 relative z-20 bg-slate-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">
              Core Capabilities
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Clinical-grade tools for patients and healthcare providers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[
              {
                title: "AI Health Assistant",
                desc: "Get instant medical guidance anytime.",
                tag: "AI-Assisted",
                color: "from-blue-500 to-cyan-500",
                icon: Bot,
                img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop"
              },
              {
                title: "Medicine Search",
                desc: "Find any medicine with live availability.",
                tag: "Real-time",
                color: "from-purple-500 to-pink-500",
                icon: Search,
                img: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop"
              },
              {
                title: "Pharmacy Locator",
                desc: "Locate verified pharmacies near you.",
                tag: "Verified",
                color: "from-emerald-500 to-teal-500",
                icon: MapPin,
                img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop"
              },
              {
                title: "Prescription Scanner",
                desc: "Scan prescriptions for instant analysis.",
                tag: "98% Accuracy",
                color: "from-orange-500 to-red-500",
                icon: Camera,
                img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop"
              },
              {
                title: "Business Analytics",
                desc: "Track performance and inventory insights.",
                tag: "Enterprise",
                color: "from-indigo-500 to-purple-500",
                icon: BarChart3,
                img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop"
              },
              {
                title: "Smart Notifications",
                desc: "Stay informed with health updates.",
                tag: "Real-time",
                color: "from-pink-500 to-rose-500",
                icon: Bell,
                img: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&auto=format&fit=crop"
              }
            ].map((feature, index) => {
              const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
              const [isHovered, setIsHovered] = useState(false);

              const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setMousePosition({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                });
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="relative h-full rounded-2xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    {/* Spotlight Effect */}
                    {isHovered && (
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.08), transparent 40%)`
                        }}
                      />
                    )}

                    {/* Image Container with Enhanced Vignette */}
                    <div className="relative h-48 overflow-hidden">
                      <motion.img
                        src={feature.img}
                        alt={feature.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                      />
                      {/* Enhanced multi-layer vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-6 relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                        <span className="text-xs font-semibold text-cyan-400">
                          {feature.tag}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                        {feature.title}
                      </h3>

                      <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                        {feature.desc}
                      </p>

                      <div className="flex items-center gap-2 text-sm font-medium text-cyan-400 group-hover:gap-3 transition-all">
                        <span>Explore</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Border Glow on Hover */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: `linear-gradient(135deg, ${feature.color.replace('from-', 'rgba(').replace(' to-', ', 0.3), rgba(').replace('500', '128, 128, 128')} 0.2))`,
                        filter: 'blur(20px)',
                        transform: 'scale(1.05)'
                      }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Premium Dark Design */}
      <section className="py-32 relative overflow-hidden z-20 bg-slate-950">
        {/* Deep Gradient Mesh Background with Slow Hue Shift */}
        <motion.div 
          className="absolute inset-0"
          animate={{ 
            background: [
              'radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)',
              'radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)',
              'radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div 
          className="container mx-auto px-4 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See what our users have to say about MediTatva
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Card 
                  className="p-12 relative"
                  style={{
                    background: 'rgba(17, 24, 39, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Quote className="absolute top-8 left-8 h-12 w-12 text-cyan-500/20" />
                  
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar with Gradient Border */}
                    <motion.div 
                      className={`relative h-24 w-24 rounded-full p-0.5 bg-gradient-to-br ${testimonials[currentTestimonial].gradient} mb-6 shadow-2xl`}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="h-full w-full rounded-full bg-[#111827] flex items-center justify-center text-2xl font-bold text-white">
                        {testimonials[currentTestimonial].initials}
                      </div>
                    </motion.div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08, duration: 0.3 }}
                        >
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-xl text-gray-300 mb-8 leading-relaxed italic">
                      "{testimonials[currentTestimonial].text}"
                    </p>

                    {/* Author */}
                    <div>
                      <p className="font-bold text-lg text-white mb-1">
                        {testimonials[currentTestimonial].name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {testimonials[currentTestimonial].role}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? "w-12 bg-gradient-to-r from-cyan-500 to-blue-600" 
                      : "w-2 bg-gray-700 hover:bg-gray-600"
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section - Premium Glass + Neon Borders */}
      <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden z-20 bg-slate-950">
        {/* Rotating Ring Background - Responsive */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-64 h-64 sm:w-96 sm:h-96 md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] rounded-full border border-cyan-500/10" />
        </motion.div>
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-48 h-48 sm:w-72 sm:h-72 md:w-[450px] md:h-[450px] lg:w-[600px] lg:h-[600px] rounded-full border border-blue-500/10" />
        </motion.div>

        <motion.div 
          className="container mx-auto px-4 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Card 
            className="p-6 sm:p-8 md:p-12 lg:p-16 text-center relative overflow-hidden"
            style={{
              background: 'rgba(17, 24, 39, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              boxShadow: '0 0 40px rgba(20, 184, 166, 0.1), inset 0 0 40px rgba(20, 184, 166, 0.05)',
            }}
          >
            {/* Light Sweep Animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />

            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block mb-6"
              >
                <Sparkles className="h-16 w-16 text-cyan-400" />
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Join thousands of users who trust MediTatva for their medicine needs
              </p>

              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block"
                >
                  <Button 
                    size="lg"
                    className="text-xl px-12 py-8 h-auto group relative overflow-hidden"
                    style={{
                      background: 'rgba(17, 24, 39, 0.8)',
                      border: '1px solid rgba(20, 184, 166, 0.5)',
                      boxShadow: '0 0 20px rgba(20, 184, 166, 0.2)',
                    }}
                  >
                    {/* Hover Sweep Light */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    
                    <span className="flex items-center gap-3 text-white relative z-10">
                      Get Started Now
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-6 w-6" />
                      </motion.div>
                    </span>
                  </Button>
                </motion.div>
              </Link>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Footer - Premium Dark Navy with Gradient Accents */}
      <footer className="relative py-16 bg-[#0B1220] border-t border-cyan-500/20 z-20">
        {/* Slow Floating Icons Background - Subtle Parallax */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
          <motion.div
            className="absolute top-10 left-10"
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bot className="h-10 w-10 text-cyan-400" />
          </motion.div>
          <motion.div
            className="absolute top-20 right-20"
            animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          >
            <MapPin className="h-10 w-10 text-purple-400" />
          </motion.div>
          <motion.div
            className="absolute bottom-10 left-1/3"
            animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            <MessageCircle className="h-10 w-10 text-pink-400" />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  MediTatva
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your trusted medicine companion, powered by AI.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Quick Links</h4>
              <ul className="space-y-3">
                {["About Us", "Features", "Pricing", "Contact"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors relative group inline-block"
                    >
                      {link}
                      <motion.span 
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Patients */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">For Patients</h4>
              <ul className="space-y-3">
                {["Find Medicines", "Track Orders", "Emergency", "Support"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors relative group inline-block"
                    >
                      {link}
                      <motion.span 
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-600"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Pharmacies */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">For Pharmacies</h4>
              <ul className="space-y-3">
                {["Register", "Dashboard", "Analytics", "Help Center"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors relative group inline-block"
                    >
                      {link}
                      <motion.span 
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-500 to-teal-600"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Copyright with Thin Gradient Separator */}
          <div className="border-t border-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} MediTatva. All rights reserved. Made with{" "}
              <motion.span
                className="inline-block text-pink-500"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                ❤️
              </motion.span>{" "}
              for better healthcare.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
