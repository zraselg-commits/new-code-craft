import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={mounted ? toggle : undefined}
      className="w-10 h-10 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-300 hover:border-primary/40"
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      {mounted ? (isDark ? <Sun size={18} /> : <Moon size={18} />) : <span className="w-[18px] h-[18px]" />}
    </button>
  );
};

export default ThemeToggle;
