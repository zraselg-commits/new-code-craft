import { TrendingUp, Users, FolderKanban, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCountUp } from "@/hooks/useCountUp";
import { useQuery } from "@tanstack/react-query";

const CountUpStat = ({ end, suffix = "", label, icon: Icon, color }: {
  end: number; suffix?: string; label: string; icon: any; color: string;
}) => {
  const { count, ref } = useCountUp(end, 2000);
  return (
    <div ref={ref} className="glass-card p-6 text-center group hover:border-primary/30 transition-all duration-500">
      <Icon className={`mx-auto mb-3 ${color} transition-transform duration-300 group-hover:scale-110`} size={28} />
      <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
        {count}{suffix}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
};

function parseStat(raw: string | undefined, fallbackEnd: number, fallbackSuffix: string) {
  if (!raw) return { end: fallbackEnd, suffix: fallbackSuffix };
  const num = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  const suffix = raw.replace(/[0-9]/g, "").trim();
  return { end: isNaN(num) ? fallbackEnd : num, suffix: suffix || fallbackSuffix };
}

const StatsSection = () => {
  const { t } = useLanguage();

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings-public"],
    queryFn: async () => {
      const r = await fetch("/api/settings-public");
      if (!r.ok) return {};
      return r.json();
    },
    staleTime: 60_000,
  });

  const projStat = parseStat(settings?.statsProjects, 50, "+");
  const cliStat  = parseStat(settings?.statsClients, 30, "+");
  const satStat  = parseStat(settings?.statsSatisfaction, 99, "%");

  const stats = [
    { icon: FolderKanban, end: projStat.end, suffix: projStat.suffix, label: t.statsProjects, color: "text-primary" },
    { icon: Users,        end: cliStat.end,  suffix: cliStat.suffix,  label: t.statsClients,  color: "text-secondary" },
    { icon: TrendingUp,   end: satStat.end,  suffix: satStat.suffix,  label: t.statsSatisfaction, color: "text-primary" },
    { icon: Clock, end: 24, suffix: "/7", label: t.statsSupport, color: "text-secondary" },
  ];

  return (
    <section className="py-10 relative border-y border-border/20">
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
            >
              <CountUpStat {...stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
