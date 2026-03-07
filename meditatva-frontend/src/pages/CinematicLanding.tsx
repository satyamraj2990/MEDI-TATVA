import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock,
  MapPin,
  Moon,
  Shield,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

// Theme tokens with true dual-theme values (not inverted), WCAG AA aligned
const TOKENS = {
  light: {
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    muted: "#EEF2F6",
    text: "#0C1120",
    textSubtle: "#475569",
    accent: "#2563EB",
    accentSoft: "#E0EAFF",
    border: "#E2E8F0",
  },
  dark: {
    bg: "#0B1220",
    surface: "#10182B",
    muted: "#131E33",
    text: "#E5E7EB",
    textSubtle: "#9CA3AF",
    accent: "#7DB5FF",
    accentSoft: "#12315C",
    border: "#1F2937",
  },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" as const },
  },
};

const cardHover = {
  rest: { y: 0, scale: 1, transition: { duration: 0.2 } },
  hover: { y: -6, scale: 1.01, transition: { duration: 0.25 } },
};

// Theme toggle removed - permanently dark theme

const CinematicLanding = () => {
  const { theme } = useTheme();
  const resolvedTheme = useMemo(() => {
    if (theme === "system" && typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  }, [theme]);

  const isDark = resolvedTheme === "dark";
  const t = isDark ? TOKENS.dark : TOKENS.light;

  const features = [
    { icon: Bot, title: "AI Medicine Search", copy: "Find the right medicine fast." },
    { icon: MapPin, title: "Nearby Pharmacies", copy: "See verified stores around you." },
    { icon: Shield, title: "Verified Information", copy: "Medical-grade guidance, not marketing." },
    { icon: Clock, title: "24/7 Availability", copy: "Any hour, any urgency." },
  ];

  const steps = [
    "Search a medicine",
    "Discover nearby pharmacies",
    "Get instant assistance",
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: t.bg, color: t.text }}>
      {/* Ambient background */}
      <div className="fixed inset-0 -z-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(circle at 18% 18%, rgba(80,140,255,0.22), transparent 40%), radial-gradient(circle at 82% 12%, rgba(124,106,255,0.18), transparent 40%), radial-gradient(circle at 50% 78%, rgba(37,99,235,0.16), transparent 46%), #0B1220"
              : "radial-gradient(circle at 18% 18%, rgba(80,140,255,0.12), transparent 40%), radial-gradient(circle at 82% 12%, rgba(124,106,255,0.1), transparent 40%), radial-gradient(circle at 50% 78%, rgba(37,99,235,0.08), transparent 46%), #F8FAFC",
          }}
        />
        <motion.div
          className="absolute inset-x-0 top-[-10%] h-[55%]"
          style={{
            background: isDark
              ? "radial-gradient(900px at 50% 0%, rgba(109,161,255,0.28), transparent 60%)"
              : "radial-gradient(900px at 50% 0%, rgba(80,140,255,0.16), transparent 60%)",
            filter: "blur(42px)",
          }}
          animate={{ opacity: [0.75, 0.95, 0.75], scale: [1, 1.03, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-md dark:border-slate-800/70 dark:bg-[#0B1220]/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 via-sky-500 to-indigo-500 shadow-lg shadow-blue-500/25" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">MediTatva</p>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Calm. Clinical. Certain.</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300 md:flex">
            <a href="#home" className="hover:text-slate-900 dark:hover:text-white">Home</a>
            <a href="#problem" className="hover:text-slate-900 dark:hover:text-white">Why</a>
            <a href="#solution" className="hover:text-slate-900 dark:hover:text-white">How</a>
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white">Features</a>
            <a href="#trust" className="hover:text-slate-900 dark:hover:text-white">Trust</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative isolate overflow-hidden">
        <div className="mx-auto flex min-h-[92vh] max-w-6xl flex-col items-center px-6 pt-24 pb-24 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ borderColor: t.border, color: t.textSubtle }}
          >
            <Sparkles className="h-4 w-4" /> Healthcare, film-grade calm
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="max-w-5xl text-4xl leading-tight text-slate-900 dark:text-slate-50 sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Healthcare. Without the Waiting.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-6 max-w-3xl text-lg text-slate-600 dark:text-slate-300"
          >
            AI-powered access to medicines and nearby pharmacies—when you need it most.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              to="/login?role=patient"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500 px-7 text-base font-semibold text-white shadow-[0_25px_80px_-40px_rgba(37,99,235,0.75)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Find Medicines <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login?role=pharmacy"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border px-7 text-base font-semibold transition hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-100 dark:hover:border-blue-400 dark:hover:text-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              For Pharmacies <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Chapter: The Problem */}
      <section id="problem" className="relative border-t border-slate-200/60 bg-white/70 dark:border-slate-800/60 dark:bg-[#0B1220]/70">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-end">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              custom={0}
              className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-slate-50"
            >
              When you need medicine, time matters.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              custom={1}
              className="text-lg text-slate-600 dark:text-slate-300"
            >
              We remove the wait, the doubt, and the noise—so care happens at the speed of need.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Chapter: The Solution */}
      <section id="solution" className="relative overflow-hidden border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">The MediTatva way</p>
              <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Instant, guided, nearby.</h3>
              <p className="text-lg text-slate-600 dark:text-slate-300">Three calm steps that keep control in your hands.</p>
            </div>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <motion.div
                  key={step}
                  variants={cardHover}
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                  className="flex items-start gap-4 rounded-2xl border p-5"
                  style={{ backgroundColor: t.surface, borderColor: t.border }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 dark:from-blue-500 dark:to-indigo-400">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{step}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Clarity, no clutter. Guidance, not guesswork.</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chapter: Features (subtle cards) */}
      <section id="features" className="relative border-t border-slate-200/60 bg-white/75 dark:border-slate-800/60 dark:bg-[#0B1220]/75">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">What matters</p>
            <h3 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 dark:text-slate-50">Built for trust, not flash.</h3>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">Line icons, soft borders, slow fade.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {features.map(({ icon: Icon, title, copy }) => (
              <motion.div
                key={title}
                variants={cardHover}
                initial="rest"
                whileHover="hover"
                animate="rest"
                className="group relative overflow-hidden rounded-2xl border p-6 shadow-[0_22px_70px_-48px_rgba(0,0,0,0.6)]"
                style={{ backgroundColor: t.surface, borderColor: t.border }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: t.muted }}>
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-200" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h4>
                </div>
                <p className="mt-3 text-base text-slate-600 dark:text-slate-300">{copy}</p>
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.35 }}
                  style={{ background: "radial-gradient(900px at 10% 10%, rgba(37,99,235,0.12), transparent 55%)" }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust language (no testimonials) */}
      <section id="trust" className="relative border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Trust</p>
              <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Privacy-first. Medical-grade. Indian-context aware.</h3>
              <p className="text-lg text-slate-600 dark:text-slate-300">No gimmicks. No hype. Just secure, reliable assistance when it matters.</p>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 rounded-2xl border p-4" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-200 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Privacy-first design</p>
                  <p>Data stays protected with strict controls and encryption.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border p-4" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-200 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Medical-grade information</p>
                  <p>Verified content tuned for Indian healthcare needs.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border p-4" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-200 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Secure & reliable</p>
                  <p>Always-on uptime mindset; assistance without delay.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard preview (blurred hint) */}
      <section className="relative border-t border-slate-200/60 bg-white/75 dark:border-slate-800/60 dark:bg-[#0B1220]/75">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Product signal</p>
              <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">The platform is real—and ready.</h3>
              <p className="text-lg text-slate-600 dark:text-slate-300">Blurred previews hint at the dashboard without overwhelming the narrative.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { theme: "Dark view", bg: "linear-gradient(135deg, rgba(16,24,43,0.9), rgba(55,65,81,0.8))" },
                { theme: "Light view", bg: "linear-gradient(135deg, rgba(248,250,252,0.95), rgba(226,232,240,0.9))" },
              ].map((item) => (
                <div
                  key={item.theme}
                  className="relative h-36 overflow-hidden rounded-2xl border"
                  style={{ borderColor: t.border, background: item.bg }}
                >
                  <div className="absolute inset-0 backdrop-blur-md" />
                  <div className="absolute left-4 top-4 text-sm font-semibold text-white drop-shadow-sm">{item.theme}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-slate-200/70 bg-white/82 dark:border-slate-800/70 dark:bg-[#0B1220]/82">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">MediTatva</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Calm, clinical, and certain.</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Privacy-first. No unnecessary noise.</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <a href="mailto:hello@meditatva.com" className="hover:text-slate-900 dark:hover:text-white">hello@meditatva.com</a>
              <span aria-hidden className="text-slate-400">•</span>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy</a>
              <span aria-hidden className="text-slate-400">•</span>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">Terms</a>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <Shield className="h-4 w-4" /> Built for Indian healthcare
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CinematicLanding;
