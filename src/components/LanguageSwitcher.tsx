import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const langCycle = { en: "bn", bn: "en" } as const;
const langLabel = { en: "বাং", bn: "EN" } as const;

const LanguageSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={mounted ? () => setLang(langCycle[lang as "en" | "bn"] as "en" | "bn") : undefined}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-300"
      aria-label="Switch language"
      suppressHydrationWarning
    >
      <Globe size={14} />
      {mounted ? langLabel[lang as "en" | "bn"] ?? "EN" : <span className="inline-block w-6" />}
    </button>
  );
};

export default LanguageSwitcher;

