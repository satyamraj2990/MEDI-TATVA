import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl border border-border hover:border-primary/50 bg-card/50 hover:bg-accent/10 transition-all duration-300 shadow-sm hover:shadow-md"
      aria-label="Toggle Theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-cyan-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// Compact version for tight spaces
export function ThemeToggleCompact() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="group flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:border-primary/50 bg-card/80 hover:bg-accent/10 transition-all duration-300 backdrop-blur-sm shadow-sm"
      aria-label="Toggle Theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500 group-hover:text-amber-600" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-cyan-400 group-hover:text-cyan-500" />
    </button>
  );
}

// Enhanced version with label
export function ThemeToggleWithLabel() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border hover:border-primary/50 bg-card/80 hover:bg-accent/10 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md"
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5">
        <Sun className="absolute inset-0 h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute inset-0 h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-cyan-400" />
      </div>
      <span className="text-sm font-semibold text-foreground">
        {theme === "dark" ? "Dark" : "Light"}
      </span>
    </button>
  );
}
