"use client";

import { useEffect, useState, ComponentType } from "react";
import { dbService, WeeklyBudget, DailyLog, getWeekString } from "@/core/supabase";
import { 
  Bus, 
  Utensils, 
  Zap, 
  Sparkles, 
  AlertCircle, 
  TrendingUp, 
  Coins, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type EnvelopeKey = "transport" | "food" | "energy" | "lifestyle";

interface EnvelopeDetails {
  name: string;
  key: EnvelopeKey;
  icon: ComponentType<{ className?: string }>;
  color: string;
  glowColor: string;
  defaultVal: number;
  max: number;
}

const ENVELOPES: EnvelopeDetails[] = [
  { 
    name: "Transport", 
    key: "transport", 
    icon: Bus, 
    color: "from-blue-500 to-indigo-600",
    glowColor: "rgba(59, 130, 246, 0.15)",
    defaultVal: 12.0,
    max: 30.0 
  },
  { 
    name: "Food", 
    key: "food", 
    icon: Utensils, 
    color: "from-emerald-500 to-teal-600",
    glowColor: "rgba(16, 185, 129, 0.15)",
    defaultVal: 8.0,
    max: 30.0 
  },
  { 
    name: "Cooling & Energy", 
    key: "energy", 
    icon: Zap, 
    color: "from-amber-500 to-orange-600",
    glowColor: "rgba(245, 158, 11, 0.15)",
    defaultVal: 14.0,
    max: 30.0 
  },
  { 
    name: "Lifestyle", 
    key: "lifestyle", 
    icon: Sparkles, 
    color: "from-pink-500 to-rose-600",
    glowColor: "rgba(244, 63, 94, 0.15)",
    defaultVal: 4.46,
    max: 20.0 
  }
];

export default function BudgetPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [budget, setBudget] = useState<WeeklyBudget>({
    id: "",
    user_id: "",
    userId: "",
    week_of: getWeekString(),
    weekOf: getWeekString(),
    transport: 12.0,
    transport_kg: 12.0,
    food: 8.0,
    food_kg: 8.0,
    energy: 14.0,
    energy_kg: 14.0,
    lifestyle: 4.46,
    lifestyle_kg: 4.46,
    created_at: new Date().toISOString()
  });
  
  // Real spent values calculated from daily logs
  const [spent, setSpent] = useState<Record<EnvelopeKey, number>>({
    transport: 0,
    food: 0,
    energy: 0,
    lifestyle: 0
  });

  const [expandedCard, setExpandedCard] = useState<EnvelopeKey | null>(null);
  const [userPebbles, setUserPebbles] = useState<number>(150);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load user profile & weekly budget & logs
  const loadBudgetAndLogs = async (uid: string) => {
    const week = getWeekString();
    
    // Load budget
    const userBudget = await dbService.getWeeklyBudget(uid, week);
    if (userBudget) {
      setBudget(userBudget);
    }

    // Load logs to calculate actual spent
    const logs = await dbService.getDailyLogs();
    const newSpent = { transport: 0, food: 0, energy: 0, lifestyle: 0 };
    
    // Sum logs for this week
    logs.forEach((log) => {
      const logDate = new Date(log.created_at);
      if (getWeekString(logDate) === week) {
        if (log.envelope in newSpent) {
          newSpent[log.envelope] += log.co2_kg;
        }
      }
    });

    // Round spent values to 2 decimal places
    Object.keys(newSpent).forEach((key) => {
      newSpent[key as EnvelopeKey] = Number(newSpent[key as EnvelopeKey].toFixed(2));
    });

    setSpent(newSpent);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUid = localStorage.getItem("prakriti_user_id");
      if (storedUid) {
        setUserId(storedUid);
        loadBudgetAndLogs(storedUid);
      } else {
        // Fallback for demo mode
        const demoUid = "arjun_mumbai";
        setUserId(demoUid);
        loadBudgetAndLogs(demoUid);
      }
      
      const storedPebbles = localStorage.getItem("prakriti_pebbles");
      setUserPebbles(storedPebbles ? parseInt(storedPebbles, 10) : 150);
    }
  }, []);

  const totalWeeklyLimit = 38.46;
  const currentTotalAllocated = (budget.transport ?? 0) + (budget.food ?? 0) + (budget.energy ?? 0) + (budget.lifestyle ?? 0);
  const readyToAssign = Number((totalWeeklyLimit - currentTotalAllocated).toFixed(2));

  const handleSliderChange = (envelope: EnvelopeKey, val: number) => {
    setBudget(prev => {
      const updated = {
        ...prev,
        [envelope]: Number(val.toFixed(2)),
        [`${envelope}_kg`]: Number(val.toFixed(2))
      };
      return updated;
    });
  };

  const handleSaveBudget = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await dbService.saveWeeklyBudget(budget);
      setSaveSuccess(true);
      showToast("Budget allocation saved successfully! 🌿");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      showToast("Error saving budget. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reallocate budget from lifestyle to target envelope
  const handleReallocate = async (toEnvelope: EnvelopeKey, amount: number) => {
    const lifestyleVal = budget.lifestyle ?? 0;
    if (lifestyleVal < amount) {
      showToast(`Not enough budget in Lifestyle to reallocate!`);
      return;
    }

    const updatedBudget = {
      ...budget,
      lifestyle: Number((lifestyleVal - amount).toFixed(2)),
      lifestyle_kg: Number((lifestyleVal - amount).toFixed(2)),
      [toEnvelope]: Number(((budget[toEnvelope] ?? 0) + amount).toFixed(2)),
      [`${toEnvelope}_kg`]: Number(((budget[toEnvelope] ?? 0) + amount).toFixed(2))
    };

    setBudget(updatedBudget);
    await dbService.saveWeeklyBudget(updatedBudget);
    showToast(`Shifted ${amount} kg CO2e from Lifestyle to ${toEnvelope.toUpperCase()}! 🔄`);
  };

  // Offset using Pebbles (deduct 50 pebbles, add a negative carbon log to act as an offset)
  const handleOffset = async (envelope: EnvelopeKey) => {
    if (userPebbles < 50) {
      showToast(`Not enough Rainbow Pebbles! You need 50 pebbles to offset.`);
      return;
    }

    if (!userId) return;

    // Deduct pebbles
    const newPebbles = userPebbles - 50;
    setUserPebbles(newPebbles);
    localStorage.setItem("prakriti_pebbles", newPebbles.toString());
    
    // Dispatch state change event to sync navbar
    window.dispatchEvent(new Event("prakriti_state_changed"));

    // Add negative CO2 log to act as offset in that envelope
    const offsetLog: Omit<DailyLog, "id" | "created_at"> = {
      user_id: userId,
      date: new Date().toISOString().split("T")[0],
      envelope: envelope,
      activity: "Western Ghats Carbon Offset (-50 Pebbles)",
      co2_kg: -2.0, // 2kg offset
      source: "manual"
    };

    await dbService.addDailyLog(offsetLog);
    
    // Refresh spent amounts
    await loadBudgetAndLogs(userId);
    showToast(`Offset active! Subtracted 2.0 kg from ${envelope} spent (Used 50 Pebbles) 🪙🌿`);
  };

  // Auto-balance budget to defaults
  const handleAutoBalance = () => {
    setBudget(prev => ({
      ...prev,
      transport: 12.0,
      transport_kg: 12.0,
      food: 8.0,
      food_kg: 8.0,
      energy: 14.0,
      energy_kg: 14.0,
      lifestyle: 4.46,
      lifestyle_kg: 4.46
    }));
    showToast("Reset budget to recommended default allocations!");
  };

  // Equivalence texts matching user request guidelines
  const getEquivalenceText = (key: EnvelopeKey, val: number) => {
    switch (key) {
      case "transport":
        // Base: 12kg -> 359km scooter, 12 Ola rides
        // scooter: 0.0334 kg/km. Ola ride: ~1.0 kg/ride.
        const km = Math.round(val / 0.0334);
        const rides = Math.round(val / 1.0);
        return `At your current pace, this covers ${km} km on your scooter or ${rides} Ola rides`;
      case "food":
        // Base: 8kg -> 8 Swiggy orders, 16 veg thali meals
        // Swiggy order (meal + delivery): ~1.0 kg/order. Veg thali meal: ~0.5 kg/meal.
        const swiggy = Math.round(val / 1.0);
        const thali = Math.round(val / 0.5);
        return `This covers roughly ${swiggy} Swiggy orders or ${thali} veg thali meals`;
      case "energy":
        // Base: 14kg -> 13 hours AC
        // 1.5-ton AC: ~1.077 kg/hour
        const acHours = Math.round(val / 1.077);
        return `Running a 1.5-ton AC for ${acHours} hours this week uses your entire envelope`;
      case "lifestyle":
        // Base: 4.46kg
        const flightPercent = Math.round((val / 89.0) * 100);
        const roadTrips = (val / 15.0).toFixed(1);
        return `This covers ${roadTrips} weekend road trips, or is just ${flightPercent}% of a single domestic flight`;
      default:
        return "";
    }
  };

  // Check if any envelope has overspent (spent >= budget AND budget > 0)
  const overspentEnvelopes = ENVELOPES.filter(env => {
    const bVal = budget[env.key] ?? 0;
    return spent[env.key] >= bVal && bVal > 0;
  });

  // Helper to get spent percentage
  const getSpentPercent = (key: EnvelopeKey) => {
    const bVal = budget[key] ?? 0;
    if (bVal === 0) return 0;
    return Math.min(100, Math.round((spent[key] / bVal) * 100));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16">

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-8 md:px-6">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-surface border border-primary/30 text-primary px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 text-sm"
            >
              <Sparkles className="w-4 h-4 text-warm" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <div className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary via-accent to-green-300 bg-clip-text text-transparent tracking-tight">
              Carbon Envelope Budget
            </h1>
            <p className="text-foreground/60 mt-1">
              YNAB-style carbon management. Give every kilogram of carbon a job.
            </p>
          </div>
          <button
            onClick={handleAutoBalance}
            className="self-center md:self-auto px-3.5 py-2 rounded-xl bg-surface hover:bg-border border border-border text-sm flex items-center space-x-1.5 transition-all active:scale-95 text-foreground/80"
          >
            <RefreshCw className="w-4 h-4 text-accent" />
            <span>Reset to Recommended</span>
          </button>
        </div>

        {/* YNAB Budget Pool Card */}
        <div className="mb-6 rounded-2xl bg-surface border border-border overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-emerald-400"></div>
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-accent uppercase tracking-widest">Weekly Limit</span>
              <div className="flex items-baseline justify-center md:justify-start space-x-2">
                <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                  {totalWeeklyLimit}
                </span>
                <span className="text-lg font-medium text-foreground/50">kg CO₂e</span>
              </div>
              <p className="text-xs text-foreground/40">
                Prakriti limits your budget to align with the 2-ton annual climate target.
              </p>
            </div>

            <div className="h-px md:h-12 w-full md:w-px bg-border"></div>

            <div className="flex flex-col items-center md:items-end justify-center">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-1">
                Ready to Assign
              </span>
              <div className="flex items-center space-x-2">
                <div className={`px-4 py-2 rounded-2xl border text-xl md:text-2xl font-bold flex items-center space-x-2 ${
                  readyToAssign === 0 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : readyToAssign > 0 
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}>
                  <span>{readyToAssign > 0 ? `+${readyToAssign}` : readyToAssign} kg</span>
                </div>
              </div>
              <p className="text-xs text-foreground/40 mt-1.5 text-center md:text-right">
                {readyToAssign === 0 
                  ? "Fully budgeted! Excellent." 
                  : readyToAssign > 0 
                    ? "Distribute the remaining carbon to your envelopes." 
                    : "Over-allocated! Reduce envelope values to balance."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Compassionate Overspend Alerts Area */}
        <AnimatePresence>
          {overspentEnvelopes.map((env) => (
            <motion.div
              key={`alert-${env.key}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-warm/10 border border-warm/30 text-warm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-warm mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Compassionate Overspend Alert: {env.name}
                    </h4>
                    <p className="text-xs text-foreground/80 mt-0.5">
                      Your {env.key} envelope is full (Spent: {spent[env.key]} kg / Budget: {budget[env.key]} kg). Would you like to reallocate carbon or offset?
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleReallocate(env.key, 2.0)}
                    disabled={(budget.lifestyle ?? 0) < 2}
                    className="px-3 py-1.5 rounded-lg bg-surface border border-warm/40 text-xs font-semibold text-white hover:bg-warm/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move 2kg budget from your Lifestyle envelope to cover this"
                  >
                    Re-allocate 2kg
                  </button>
                  <button
                    onClick={() => handleOffset(env.key)}
                    disabled={userPebbles < 50}
                    className="px-3 py-1.5 rounded-lg bg-warm hover:bg-warm/80 text-background text-xs font-bold transition-all flex items-center space-x-1"
                  >
                    <Coins className="w-3.5 h-3.5 fill-current" />
                    <span>Offset (-50 Pebbles)</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Envelopes Container */}
        <div className="space-y-4">
          {ENVELOPES.map((env) => {
            const Icon = env.icon;
            const isExpanded = expandedCard === env.key;
            const value = budget[env.key] ?? 0;
            const hasSpent = spent[env.key];
            const spentPercent = getSpentPercent(env.key);
            
            return (
              <div
                key={env.key}
                className="rounded-xl border border-border bg-surface transition-all overflow-hidden"
                style={{
                  boxShadow: isExpanded ? `0 10px 30px -10px ${env.glowColor}` : "none",
                  borderColor: isExpanded ? "var(--primary)" : "var(--border)"
                }}
              >
                {/* Header (Accordion Toggle Trigger) */}
                <div 
                  onClick={() => setExpandedCard(isExpanded ? null : env.key)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-border/20 transition-colors select-none"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${env.color} flex items-center justify-center text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{env.name}</h3>
                      <p className="text-xs text-foreground/50 mt-0.5">
                        Spent: {hasSpent} kg / Budget: {value} kg
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Spent Progress Mini Bar */}
                    <div className="hidden md:flex flex-col items-end space-y-1">
                      <div className="flex items-center justify-between text-xs w-28">
                        <span className="text-foreground/40">Spent bar</span>
                        <span className={`font-semibold ${spentPercent >= 100 ? "text-warm" : "text-primary"}`}>
                          {spentPercent}%
                        </span>
                      </div>
                      <div className="w-28 h-1.5 bg-background rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            spentPercent >= 100 
                              ? "bg-gradient-to-r from-red-500 to-warm" 
                              : spentPercent >= 80 
                                ? "bg-warm" 
                                : "bg-primary"
                          }`}
                          style={{ width: `${spentPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-white">{value}</span>
                      <span className="text-xs text-foreground/40 block">kg CO₂e</span>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-foreground/40" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-foreground/40" />
                    )}
                  </div>
                </div>

                {/* Collapsible Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-border bg-background/30"
                    >
                      <div className="p-5 space-y-5">
                        {/* Interactive Slider */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground/60">Adjust Envelope Allocation</span>
                            <span className="text-sm font-bold text-primary">{value} kg</span>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-foreground/40">0 kg</span>
                            <input
                              type="range"
                              min="0"
                              max={env.max}
                              step="0.1"
                              value={value}
                              onChange={(e) => handleSliderChange(env.key, parseFloat(e.target.value))}
                              className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                            />
                            <span className="text-xs text-foreground/40">{env.max} kg</span>
                          </div>
                        </div>

                        {/* Equivalence dynamic display */}
                        <div className="p-3.5 rounded-lg bg-surface border border-border/40 text-xs text-foreground/80 flex items-start space-x-2">
                          <TrendingUp className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                          <span>{getEquivalenceText(env.key, value)}</span>
                        </div>

                        {/* Budget breakdown stats */}
                        <div className="grid grid-cols-3 gap-3 pt-1 text-center">
                          <div className="p-2.5 rounded-lg bg-surface/50 border border-border/20">
                            <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Allocated</span>
                            <span className="block text-sm font-bold text-white mt-0.5">{value} kg</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-surface/50 border border-border/20">
                            <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Spent</span>
                            <span className="block text-sm font-bold text-warm mt-0.5">{hasSpent} kg</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-surface/50 border border-border/20">
                            <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Remaining</span>
                            <span className={`block text-sm font-bold mt-0.5 ${value - hasSpent >= 0 ? "text-primary" : "text-red-400"}`}>
                              {(value - hasSpent).toFixed(2)} kg
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Action Button Section */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleSaveBudget}
            disabled={isSaving || readyToAssign !== 0}
            className="w-full sm:flex-1 py-4 px-6 rounded-xl bg-primary hover:bg-primary/95 text-background font-extrabold flex items-center justify-center space-x-2 shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {isSaving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{isSaving ? "Saving Budget..." : saveSuccess ? "Budget Saved!" : "Save My Budget"}</span>
          </button>
        </div>
        
        {readyToAssign !== 0 && (
          <p className="text-xs text-warm mt-2 text-center">
            ⚠️ To save your budget, the &quot;Ready to Assign&quot; carbon pool must be exactly 0 kg (Total: {totalWeeklyLimit} kg).
          </p>
        )}

      </main>
    </div>
  );
}
