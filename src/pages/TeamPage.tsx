"use client";

import { Github, Linkedin, Twitter, Users, Star, Award, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLangValue } from "@/hooks/useLangValue";
import { useQuery } from "@tanstack/react-query";

interface TeamMember {
  id: string;
  name: string; name_bn?: string;
  role: string; role_bn?: string;
  avatar?: string;
  avatarUrl?: string;
  bio?: string; bio_bn?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
}

const GRADIENT_COLORS = [
  "from-rose-500 to-orange-400",
  "from-violet-500 to-indigo-400",
  "from-emerald-500 to-teal-400",
  "from-sky-500 to-blue-400",
  "from-pink-500 to-fuchsia-400",
  "from-amber-500 to-yellow-400",
];

const TeamPage = () => {
  const { t } = useLanguage();
  const lv = useLangValue();

  // Use public /api/team endpoint (no auth required)
  const { data: members = [], isLoading, isError } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
    queryFn: async () => {
      const r = await fetch("/api/team");
      if (!r.ok) return [];
      return r.json();
    },
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        {/* Decorative blobs */}
        <div className="absolute top-20 left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-[5%] w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/20 text-primary text-xs font-semibold mb-6">
              <Sparkles size={12} />
              <span suppressHydrationWarning>{lv("Meet the Team", "আমাদের টিম")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-4 leading-tight" suppressHydrationWarning>
              {lv("The People Behind", "যাঁরা তৈরি করেন")}{" "}
              <span className="gradient-text">Code Craft BD</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed" suppressHydrationWarning>
              {lv(
                "A passionate team of developers, designers, and marketers building digital solutions for Bangladesh and beyond.",
                "ডেভেলপার, ডিজাইনার ও মার্কেটারদের একটি উৎসাহী দল, যারা বাংলাদেশ ও বিশ্বের জন্য ডিজিটাল সমাধান তৈরি করে।"
              )}
            </p>
          </div>

          {/* Stats row */}
          {!isLoading && members.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8 mt-10 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              {[
                { icon: Users, value: `${members.length}+`, label: lv("Team Members", "টিম সদস্য") },
                { icon: Star, value: "5★", label: lv("Client Rating", "ক্লায়েন্ট রেটিং") },
                { icon: Award, value: "50+", label: lv("Projects Done", "প্রজেক্ট সম্পন্ন") },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-foreground leading-none">{value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5" suppressHydrationWarning>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Team Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4 md:px-6">

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted/40" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-muted/40 rounded w-3/4" />
                    <div className="h-4 bg-muted/30 rounded w-1/2" />
                    <div className="h-3 bg-muted/20 rounded w-full" />
                    <div className="h-3 bg-muted/20 rounded w-5/6" />
                    <div className="flex gap-2 pt-2">
                      {[1,2,3].map(j => <div key={j} className="w-8 h-8 bg-muted/30 rounded-lg" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="text-center py-16">
              <Users size={48} className="mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground" suppressHydrationWarning>
                {lv("Failed to load team members.", "টিম তথ্য লোড হয়নি।")}
              </p>
            </div>
          )}

          {/* Member cards */}
          {!isLoading && members.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {members.map((member, idx) => {
                const gradient = GRADIENT_COLORS[idx % GRADIENT_COLORS.length];
                const initials = member.avatar || member.name?.substring(0, 2).toUpperCase() || "??";
                const name = lv(member.name, member.name_bn);
                const role = lv(member.role, member.role_bn);
                const bio  = lv(member.bio,  member.bio_bn);

                return (
                  <article
                    key={member.id}
                    className="group glass-card rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-border/40 hover:border-primary/30 flex flex-col"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    {/* Avatar area */}
                    <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                      {/* Decorative circles */}
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-black/10 rounded-full" />

                      {member.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.avatarUrl}
                          alt={name}
                          className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="relative z-10 w-24 h-24 rounded-2xl bg-white/25 border-4 border-white/30 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                          <span className="text-3xl font-black text-white tracking-tight">{initials}</span>
                        </div>
                      )}

                      {/* Online indicator */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-white/80 font-medium" suppressHydrationWarning>
                          {lv("Active", "সক্রিয়")}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="mb-3">
                        <h2 className="text-base font-bold text-foreground leading-tight" suppressHydrationWarning>{name}</h2>
                        <p className={`text-xs font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mt-1`} suppressHydrationWarning>
                          {role}
                        </p>
                      </div>

                      {bio && (
                        <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-3" suppressHydrationWarning>
                          {bio}
                        </p>
                      )}

                      {/* Social links */}
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40">
                        {member.github && member.github !== "#" && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-muted transition-all"
                            aria-label={`${name} GitHub`}
                          >
                            <Github size={14} />
                          </a>
                        )}
                        {member.linkedin && member.linkedin !== "#" && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10 transition-all"
                            aria-label={`${name} LinkedIn`}
                          >
                            <Linkedin size={14} />
                          </a>
                        )}
                        {member.twitter && member.twitter !== "#" && (
                          <a
                            href={member.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-[#1DA1F2] hover:border-[#1DA1F2]/40 hover:bg-[#1DA1F2]/10 transition-all"
                            aria-label={`${name} Twitter`}
                          >
                            <Twitter size={14} />
                          </a>
                        )}
                        <div className="ml-auto">
                          <span className="text-[10px] text-muted-foreground/50 px-2 py-1 bg-muted/30 rounded-full" suppressHydrationWarning>
                            {lv("Code Craft BD", "কোড ক্রাফট বিডি")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && members.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground text-lg" suppressHydrationWarning>
                {lv("No team members yet.", "এখনো কোনো টিম সদস্য নেই।")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Join CTA */}
      <section className="pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="glass-card rounded-2xl p-8 md:p-12 text-center border border-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                <Sparkles size={11} />
                <span suppressHydrationWarning>{lv("We're Hiring", "আমরা নিয়োগ দিচ্ছি")}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3" suppressHydrationWarning>
                {lv("Want to join our team?", "আমাদের দলে যোগ দিতে চান?")}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto" suppressHydrationWarning>
                {lv(
                  "We're always looking for talented people. If you're passionate about web development, design, or digital marketing — let's talk.",
                  "আমরা সবসময় প্রতিভাবান মানুষ খুঁজি। ওয়েব ডেভেলপমেন্ট, ডিজাইন বা ডিজিটাল মার্কেটিং-এ আগ্রহী হলে — কথা বলুন।"
                )}
              </p>
              <a
                href="/contact"
                className="btn-primary-glow inline-flex items-center gap-2 px-8 py-3"
                suppressHydrationWarning
              >
                {lv("Get in Touch", "যোগাযোগ করুন")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TeamPage;
