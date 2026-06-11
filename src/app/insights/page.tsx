"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Flame, 
  Utensils, 
  Compass, 
  ArrowRight,
  RefreshCw,
  Info
} from "lucide-react";
import { dbService } from "@/core/supabase";
import confetti from "canvas-confetti";

interface InsightItem {
  title: string;
  body: string;
  co2SavingsKg: number;
  difficulty: "Easy" | "Medium" | "Hard";
  implementationIntention: {
    trigger: string;
    action: string;
  };
  envelope: "transport" | "food" | "energy" | "lifestyle";
}

type SeasonKey = "summer" | "ipl" | "diwali" | "wedding";

interface SeasonalBanner {
  id: SeasonKey;
  title: string;
  icon: string;
  badge: string;
  description: string;
  themeClass: string;
  badgeClass: string;
}

const seasonalBanners: Record<SeasonKey, SeasonalBanner> = {
  summer: {
    id: "summer",
    title: "Summer Cooling Mode",
    icon: "☀️",
    badge: "April - June",
    description: "Regional summer peaks are here! Heavy AC cooling draw is straining power grids in India. Setting your AC temperature to 26°C and pairing with a fan saves up to 20% on cooling carbon footprint.",
    themeClass: "from-cyan-950/60 via-teal-950/20 to-background border-cyan-500/30 text-cyan-200",
    badgeClass: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
  },
  ipl: {
    id: "ipl",
    title: "IPL AC Sharing Mode",
    icon: "🏏",
    badge: "March - May",
    description: "It's IPL match night! Instead of cooling three separate bedrooms, gather friends and family in a single living room. Group-sharing cooling cuts your energy footprint by over 60% tonight.",
    themeClass: "from-blue-950/60 via-indigo-950/20 to-background border-blue-500/30 text-blue-200",
    badgeClass: "bg-blue-500/10 border-blue-500/20 text-blue-300",
  },
  diwali: {
    id: "diwali",
    title: "Diwali Festive Mode",
    icon: "🪔",
    badge: "October - November",
    description: "Happy Festivities! Diwali celebrations bring special treats, ghee preparation, and decorative lights. Watch out for the +15% carbon festive cooking surcharge, and try using LED diya strands.",
    themeClass: "from-amber-950/60 via-orange-950/20 to-background border-amber-500/30 text-amber-200",
    badgeClass: "bg-amber-500/10 border-amber-500/20 text-amber-300",
  },
  wedding: {
    id: "wedding",
    title: "Wedding Season Offset Mode",
    icon: "💍",
    badge: "November - February",
    description: "Wedding season is in full swing! Travel and celebrations increase footprints. Offset the events by renting rather than buying heavy wedding attire, and carpool with friends to the venues.",
    themeClass: "from-fuchsia-950/60 via-pink-950/20 to-background border-fuchsia-500/30 text-fuchsia-200",
    badgeClass: "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-300",
  }
};

export default function InsightsPage() {
  const router = useRouter();
  
  // Loading & State
  const [loading, setLoading] = useState<boolean>(true);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [activeIntentions, setActiveIntentions] = useState<{ trigger: string; action: string }[]>([]);
  const [logsCount, setLogsCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [savingIntentionIndex, setSavingIntentionIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Active Season State
  const [currentSeason, setCurrentSeason] = useState<SeasonKey>("summer");

  // Determine active season based on current date
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth(); // 0 = Jan, 11 = Dec
    
    // Check ranges
    if (month >= 3 && month <= 5) {
      setCurrentSeason("summer"); // Apr - Jun
    } else if (month >= 9 && month <= 10) {
      setCurrentSeason("diwali"); // Oct - Nov
    } else if (month >= 2 && month <= 4) {
      setCurrentSeason("ipl"); // Mar - May (IPL takes precedence over standard summer overlap if needed, but here simple mapping)
    } else if (month >= 10 || month <= 1) {
      setCurrentSeason("wedding"); // Nov - Feb
    } else {
      setCurrentSeason("summer"); // default
    }
  }, []);

  // Fetch data & generate recommendations
  const generateAIRecommendations = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      // 1. Fetch user & logs
      await dbService.getCurrentUser();
      const allLogs = await dbService.getDailyLogs();
      const userIntentions = await dbService.getIntentions();

      // 2. Filter logs for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const last7DaysLogs = allLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= sevenDaysAgo;
      });

      setLogsCount(last7DaysLogs.length);
      setActiveIntentions(
        userIntentions.map(i => ({
          trigger: i.trigger,
          action: i.action
        }))
      );

      // 3. Post logs to our API route
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: last7DaysLogs })
      });

      const resJson = await response.json();
      
      if (resJson.success && resJson.data?.insights) {
        setInsights(resJson.data.insights);
      } else {
        throw new Error(resJson.error || "Failed to fetch insights array");
      }

    } catch (err) {
      console.error("Failed to generate insights:", err);
      setToast("Failed to load insights. Using offline advice.");
      setTimeout(() => setToast(null), 3500);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    generateAIRecommendations();
  }, []);

  // Commit Intention
  const handleSetIntention = async (insight: InsightItem, index: number) => {
    if (savingIntentionIndex !== null) return;
    setSavingIntentionIndex(index);
    
    try {
      const user = await dbService.getCurrentUser();
      const userId = user?.id || "arjun-mumbai-uuid";

      await dbService.createIntention({
        user_id: userId,
        trigger: insight.implementationIntention.trigger,
        action: insight.implementationIntention.action,
        envelope: insight.envelope,
        active: true
      });

      // Award sparkles and confetti
      confetti({
        particleCount: 120,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#4ade80", "#86efac", "#fbbf24", "#60a5fa", "#f472b6"]
      });

      // Update local state
      setActiveIntentions(prev => [
        ...prev,
        {
          trigger: insight.implementationIntention.trigger,
          action: insight.implementationIntention.action
        }
      ]);

      setToast("Commitment saved! Your implementation intention is now active 🌿");
      setTimeout(() => setToast(null), 3000);

    } catch (err) {
      console.error("Error setting intention:", err);
      setToast("Failed to save commitment. Please try again.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSavingIntentionIndex(null);
    }
  };

  const isAlreadySaved = (insight: InsightItem) => {
    return activeIntentions.some(
      item => 
        item.trigger.toLowerCase().trim() === insight.implementationIntention.trigger.toLowerCase().trim() &&
        item.action.toLowerCase().trim() === insight.implementationIntention.action.toLowerCase().trim()
    );
  };

  // Envelope details mapping helper
  const getEnvelopeDetails = (envelope: string) => {
    switch (envelope) {
      case "transport":
        return { label: "Transport", icon: Flame, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
      case "food":
        return { label: "Food", icon: Utensils, color: "text-green-400 bg-green-500/10 border-green-500/20" };
      case "energy":
        return { label: "Energy & AC", icon: Zap, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
      default:
        return { label: "Lifestyle", icon: Sparkles, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "Medium":
        return "text-warm bg-warm/10 border-warm/20";
      case "Hard":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-foreground/60 bg-border/40 border-border";
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-surface border border-primary/30 text-primary px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 text-sm max-w-sm text-center"
          >
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center space-x-1 text-xs text-foreground/60 hover:text-white transition-colors mb-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-accent to-green-300 bg-clip-text text-transparent tracking-tight">
            AI Coach Insights
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            Personalized saving suggestions based on your last 7 days of activity logs.
          </p>
        </div>

        <button
          onClick={() => generateAIRecommendations(true)}
          disabled={loading || isRefreshing}
          className="w-fit self-start sm:self-center py-2 px-4 rounded-xl border border-border bg-surface hover:bg-border/60 text-xs font-bold flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          <span>{isRefreshing ? "Calculating..." : "Refresh Insights"}</span>
        </button>
      </div>

      {/* SEASONAL CONTEXT BANNER */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground/50 uppercase tracking-widest block">
            Seasonal Carbon Modifier
          </span>
          {/* Custom switcher to preview other seasons */}
          <div className="flex space-x-1 bg-surface border border-border p-0.5 rounded-lg text-[10px] font-bold">
            {(Object.keys(seasonalBanners) as SeasonKey[]).map(key => (
              <button
                key={key}
                onClick={() => setCurrentSeason(key)}
                className={`px-2 py-1 rounded-md transition-all ${
                  currentSeason === key 
                    ? "bg-primary text-background font-extrabold" 
                    : "text-foreground/60 hover:text-white"
                }`}
              >
                {seasonalBanners[key].icon} {seasonalBanners[key].id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSeason}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`bg-gradient-to-r ${seasonalBanners[currentSeason].themeClass} border border-border/80 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden`}
          >
            {/* Glowing background highlights */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />

            <div className="flex items-start space-x-4">
              <div className="text-3xl shrink-0 p-3 rounded-xl bg-background/50 border border-border">
                {seasonalBanners[currentSeason].icon}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-white">
                    {seasonalBanners[currentSeason].title}
                  </h3>
                  <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-md uppercase tracking-wider ${seasonalBanners[currentSeason].badgeClass}`}>
                    {seasonalBanners[currentSeason].badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-medium">
                  {seasonalBanners[currentSeason].description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* RECOMMENDATIONS SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Weekly Recommendations</span>
          </h3>
          <span className="text-xs text-foreground/40 font-semibold font-mono">
            Analyzed {logsCount} logs
          </span>
        </div>

        {loading ? (
          /* SKELETON LOADER STATE */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className="bg-surface border border-border/60 rounded-2xl p-6 space-y-6 animate-pulse"
              >
                <div className="flex justify-between items-start">
                  <div className="h-6 w-20 bg-border/80 rounded-md"></div>
                  <div className="h-5 w-16 bg-border/80 rounded-md"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-border/80 rounded-md"></div>
                  <div className="h-4 w-full bg-border/60 rounded-md"></div>
                  <div className="h-4 w-5/6 bg-border/60 rounded-md"></div>
                </div>

                <div className="h-14 w-full bg-background/50 border border-border/40 rounded-xl p-3 space-y-1.5">
                  <div className="h-3.5 w-12 bg-border/80 rounded-md"></div>
                  <div className="h-3 w-4/5 bg-border/60 rounded-md"></div>
                </div>

                <div className="h-10 w-full bg-border/80 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : insights.length === 0 ? (
          /* NO LOGS / MOCK FALLBACK TRIGGER STATE */
          <div className="bg-surface border border-border rounded-2xl p-8 text-center space-y-6 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto animate-bounce">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-extrabold text-white">No Footprint Logs Found</h4>
              <p className="text-xs text-foreground/60">
                You haven&apos;t logged any carbon footprints in the last 7 days! Log an activity or scan a receipt first to get tailored advice.
              </p>
            </div>
            <button
              onClick={() => router.push("/log")}
              className="py-2.5 px-5 bg-primary text-background font-extrabold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2 mx-auto"
            >
              <span>Go to Activity Logger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* INSIGHT CARDS LIST */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight, idx) => {
              const env = getEnvelopeDetails(insight.envelope);
              const EnvIcon = env.icon;
              const saved = isAlreadySaved(insight);
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="bg-surface border border-border hover:border-primary/30 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xl hover:shadow-primary/5 transition-all relative overflow-hidden group"
                >
                  {/* Subtle top border gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/45 to-transparent group-hover:from-primary transition-all"></div>

                  <div className="space-y-4">
                    {/* Badge and Difficulty */}
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center space-x-1 px-2 py-0.5 border rounded-md text-[9px] uppercase font-bold tracking-wider ${env.color}`}>
                        <EnvIcon className="w-3 h-3 shrink-0" />
                        <span>{env.label}</span>
                      </div>

                      <div className={`px-2 py-0.5 border rounded-md text-[9px] uppercase font-bold tracking-wider ${getDifficultyColor(insight.difficulty)}`}>
                        {insight.difficulty}
                      </div>
                    </div>

                    {/* Title & Body */}
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-white text-base sm:text-lg group-hover:text-primary transition-colors leading-tight">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-foreground/70 leading-relaxed font-medium">
                        {insight.body}
                      </p>
                    </div>

                    {/* Green Carbon Badge */}
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold text-primary bg-primary/10 border border-primary/20">
                      <span>🌿 Saves ~{insight.co2SavingsKg} kg CO₂e</span>
                    </div>

                    {/* Implementation Intention Card */}
                    <div className="bg-background/80 border border-border/80 p-3 rounded-xl space-y-1.5">
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-foreground/40 uppercase tracking-widest font-mono">
                        <Info className="w-3 h-3 text-primary shrink-0" />
                        <span>Behavior Commitment</span>
                      </div>
                      <p className="text-xs text-foreground/80 italic font-medium leading-relaxed">
                        &quot;When <strong className="text-warm font-semibold">{insight.implementationIntention.trigger}</strong>, I will <strong className="text-primary font-semibold">{insight.implementationIntention.action}</strong>.&quot;
                      </p>
                    </div>
                  </div>

                  {/* Set Intention Button */}
                  <button
                    onClick={() => handleSetIntention(insight, idx)}
                    disabled={saved || savingIntentionIndex !== null}
                    className={`w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] ${
                      saved 
                        ? "bg-primary/10 border border-primary/20 text-primary cursor-default"
                        : "bg-primary text-background hover:brightness-110 shadow-lg shadow-primary/5"
                    }`}
                  >
                    {saved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 fill-current text-primary text-background" />
                        <span>Commitment Saved ✓</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>{savingIntentionIndex === idx ? "Saving commitment..." : "Set Intention"}</span>
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* FOOTER SECTION: Info & Path Link */}
      <section className="bg-surface/40 border border-border/50 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground/60">
        <div className="flex items-start space-x-3 max-w-xl text-center sm:text-left">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5 mx-auto" />
          <p className="leading-relaxed">
            By setting implementation intentions, you pre-program your brain to select the low-carbon choice automatically in the moment. Saved commitments appear in your dashboard companion check-ins.
          </p>
        </div>
        <button
          onClick={() => router.push("/budget")}
          className="shrink-0 text-primary font-bold hover:underline flex items-center space-x-1"
        >
          <span>Modify Carbon Budgets</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

    </div>
  );
}
