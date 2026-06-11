"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { 
  ScanLine, 
  FileSpreadsheet, 
  TrendingUp, 
  PiggyBank, 
  MapPin, 
  Coins, 
  Compass, 
  Calendar,
  Sparkles,
  ArrowRight,
  Leaf,
  Flame,
  Apple,
  Lightbulb,
  Gamepad2,
  Edit2
} from "lucide-react";
import { BudgetEnvelope } from "@/lib/db";
import { 
  dbService, 
  getWeekString, 
  getOffsetDateString,
  WeeklyBudget, 
  DailyLog, 
  Adventure, 
  User 
} from "@/core/supabase";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  AreaChart,
  Area 
} from "recharts";
import confetti from "canvas-confetti";

type EnvelopeKey = "transport" | "food" | "energy" | "lifestyle";

export default function Dashboard() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [userId, setUserId] = useState<string | null>(null);
  const [city, setCity] = useState<string>("Mumbai");
  const [pebbles, setPebbles] = useState<number>(50);
  const [budget, setBudget] = useState<BudgetEnvelope>({
    transport: 12,
    food: 8,
    energy: 14,
    lifestyle: 4.46,
    transport_spent: 2.31,
    food_spent: 10.4,
    energy_spent: 12.05,
    lifestyle_spent: 10,
  });

  // Companion & Footprint states
  const [companionStage, setCompanionStage] = useState<string>("baby");
  const [companionEnergy, setCompanionEnergy] = useState<number>(45);
  const [userMonthlyKg, setUserMonthlyKg] = useState<number>(112.8);

  // Goal Tracker & Sparkline state
  const [reductionGoal, setReductionGoal] = useState<number>(38.46);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [goalInput, setGoalInput] = useState<string>("38.46");
  const [sparklineData, setSparklineData] = useState<Array<{ name: string; co2: number }>>([]);
  const [trendData, setTrendData] = useState<Array<{ week: string; co2: number }>>([]);

  // Adventure State
  const [activeAdventure, setActiveAdventure] = useState<Adventure | null>(null);
  const [adventureActive, setAdventureActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(30); 
  const [adventureStatus, setAdventureStatus] = useState<string>("Resting in the canopy");
  const [rewardClaimed, setRewardClaimed] = useState<string | null>(null);

  // Get current Monday date
  const getMondayDate = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const seedArjunMumbaiDemoData = () => {
    const today = new Date();
    
    // Helper to format date relative to today
    const getRelativeDateString = (offsetDays: number) => {
      const d = new Date(today);
      d.setDate(today.getDate() + offsetDays);
      return d.toISOString().split("T")[0];
    };

    // Helper to get current week's Monday
    const getCurrentMonday = () => {
      const d = new Date(today);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      return monday.toISOString().split("T")[0];
    };

    const DEMO_DATA = {
      user: {
        id: 'demo-user-arjun',
        name: 'Arjun',
        city: 'Mumbai',
        transport_mode: 'petrol_scooter',
        diet_type: 'non_veg'
      },
      weekly_budget: {
        transport_kg: 12,
        food_kg: 8,
        energy_kg: 14,
        lifestyle_kg: 4.46,
        week_of: getCurrentMonday()
      },
      daily_logs: [
        { date: getRelativeDateString(-6), envelope: 'transport', activity: 'Petrol Scooter 15km', co2_kg: 0.5 },
        { date: getRelativeDateString(-6), envelope: 'food', activity: 'Swiggy Order', co2_kg: 1.8 },
        { date: getRelativeDateString(-5), envelope: 'energy', activity: 'AC 4hrs (3-star)', co2_kg: 4.26 },
        { date: getRelativeDateString(-5), envelope: 'transport', activity: 'Ola Cab 8km', co2_kg: 1.19 },
        { date: getRelativeDateString(-4), envelope: 'food', activity: 'Mutton Biryani', co2_kg: 5.0 },
        { date: getRelativeDateString(-4), envelope: 'transport', activity: 'Mumbai Local 12km', co2_kg: 0.077 },
        { date: getRelativeDateString(-3), envelope: 'lifestyle', activity: 'Blinkit Order', co2_kg: 10 },
        { date: getRelativeDateString(-3), envelope: 'energy', activity: 'AC 6hrs (3-star)', co2_kg: 6.39 },
        { date: getRelativeDateString(-2), envelope: 'food', activity: 'Veg Thali', co2_kg: 1.5 },
        { date: getRelativeDateString(-2), envelope: 'transport', activity: 'CNG Auto 5km', co2_kg: 0.54 },
        { date: getRelativeDateString(-1), envelope: 'food', activity: 'Zomato Order', co2_kg: 2.1 },
        { date: getRelativeDateString(-1), envelope: 'energy', activity: 'AC 3hrs (5-star)', co2_kg: 1.4 },
      ],
      ecosystem: {
        energy: 45,
        pebbles: 50,
        stage: 'baby'
      }
    };

    // Save to localStorage
    localStorage.setItem("prakriti_user_id", DEMO_DATA.user.id);
    
    const userProfile = {
      ...DEMO_DATA.user,
      pet_type: "Lion-Tailed Macaque",
      pet_stage: DEMO_DATA.ecosystem.stage,
      pebbles_balance: DEMO_DATA.ecosystem.pebbles,
      pebbles: DEMO_DATA.ecosystem.pebbles,
      weekly_budgets_completed: 0,
      weeklyBudgetsCompleted: 0,
      created_at: new Date().toISOString()
    };
    localStorage.setItem("prakriti_user", JSON.stringify(userProfile));

    const budgets = [
      {
        id: "budget-demo-week",
        user_id: DEMO_DATA.user.id,
        userId: DEMO_DATA.user.id,
        week_of: DEMO_DATA.weekly_budget.week_of,
        weekOf: DEMO_DATA.weekly_budget.week_of,
        transport_kg: DEMO_DATA.weekly_budget.transport_kg,
        transport: DEMO_DATA.weekly_budget.transport_kg,
        food_kg: DEMO_DATA.weekly_budget.food_kg,
        food: DEMO_DATA.weekly_budget.food_kg,
        energy_kg: DEMO_DATA.weekly_budget.energy_kg,
        energy: DEMO_DATA.weekly_budget.energy_kg,
        lifestyle_kg: DEMO_DATA.weekly_budget.lifestyle_kg,
        lifestyle: DEMO_DATA.weekly_budget.lifestyle_kg,
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem("prakriti_weekly_budgets", JSON.stringify(budgets));

    const dailyLogsMapped = DEMO_DATA.daily_logs.map((log, i) => ({
      id: `log-demo-${i}`,
      user_id: DEMO_DATA.user.id,
      date: log.date,
      envelope: log.envelope,
      activity: log.activity,
      co2_kg: log.co2_kg,
      source: "manual" as const,
      created_at: new Date(log.date).toISOString()
    }));
    localStorage.setItem("prakriti_daily_logs", JSON.stringify(dailyLogsMapped));

    // Save ecosystem state
    localStorage.setItem("prakriti_ecosystem", JSON.stringify(DEMO_DATA.ecosystem));
    
    localStorage.setItem("prakriti_demo_mode", "true");
    localStorage.setItem("prakriti_city", DEMO_DATA.user.city);
    localStorage.setItem("prakriti_pebbles", DEMO_DATA.ecosystem.pebbles.toString());

    const weeklyTrend = [
      { week: 'May 19', co2: 42.3 },
      { week: 'May 26', co2: 38.1 },
      { week: 'Jun 2',  co2: 35.6 },
      { week: 'Jun 9',  co2: 34.8 },
    ];
    localStorage.setItem('prakriti_weekly_trend', JSON.stringify(weeklyTrend));

    window.dispatchEvent(new Event("prakriti_state_changed"));
  };

  const loadDashboardData = async (uid: string) => {
    const week = getWeekString();
    
    // 1. Get User Details
    const user = await dbService.getCurrentUser();
    if (user) {
      setCity(user.city);
      setPebbles(user.pebbles_balance);
      localStorage.setItem("prakriti_city", user.city);
      localStorage.setItem("prakriti_pebbles", user.pebbles_balance.toString());
    }

    // Load custom goal
    const storedGoal = localStorage.getItem("prakriti_co2_goal");
    if (storedGoal) {
      const parsed = parseFloat(storedGoal);
      if (!isNaN(parsed) && parsed > 0) {
        setReductionGoal(parsed);
        setGoalInput(storedGoal);
      }
    }

    // 2. Load Budget & Daily Logs for Spent calculations
    const userBudget = await dbService.getWeeklyBudget(uid, week);
    const logs = await dbService.getDailyLogs(uid);
    const spentMap = { transport: 0, food: 0, energy: 0, lifestyle: 0 };
    
    logs.forEach((log) => {
      const logDate = new Date(log.created_at || log.date);
      if (getWeekString(logDate) === week || uid === "demo-user-arjun") {
        if (log.envelope in spentMap) {
          spentMap[log.envelope as EnvelopeKey] += log.co2_kg;
        }
      }
    });

    if (userBudget) {
      setBudget({
        transport: userBudget.transport || 12.0,
        food: userBudget.food || 8.0,
        energy: userBudget.energy || 14.0,
        lifestyle: userBudget.lifestyle || 4.46,
        transport_spent: Number(spentMap.transport.toFixed(2)),
        food_spent: Number(spentMap.food.toFixed(2)),
        energy_spent: Number(spentMap.energy.toFixed(2)),
        lifestyle_spent: Number(spentMap.lifestyle.toFixed(2)),
      });
    }

    // Calculate userMonthlyKg as the sum of all daily_logs co2_kg from the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last30DaysLogs = logs.filter(log => {
      const logDate = new Date(log.date || log.created_at);
      return logDate >= thirtyDaysAgo && logDate <= now;
    });
    
    let monthlySum = last30DaysLogs.reduce((acc, curr) => acc + curr.co2_kg, 0);
    if (uid === "demo-user-arjun") {
      monthlySum = 26.05 * 4.33; // ~113 kg/month
    }
    setUserMonthlyKg(Number(monthlySum.toFixed(1)));

    // Load companion/ecosystem state
    const ecoStr = localStorage.getItem("prakriti_ecosystem");
    if (ecoStr) {
      try {
        const eco = JSON.parse(ecoStr);
        setCompanionStage(eco.stage || "baby");
        setCompanionEnergy(eco.energy !== undefined ? eco.energy : 45);
        if (eco.pebbles !== undefined) {
          setPebbles(eco.pebbles);
        }
      } catch (e) {
        console.error("Failed to parse ecosystem state:", e);
      }
    } else if (user) {
      setCompanionStage(user.pet_stage || "baby");
      setCompanionEnergy(45);
    }

    // 3. Load Sparkline history trend (last 4 weeks)
    const currentWeekStr = getWeekString();
    const w1Str = getOffsetDateString(-1, 0);
    const w2Str = getOffsetDateString(-2, 0);
    const w3Str = getOffsetDateString(-3, 0);

    const weekTotals = {
      [w3Str]: 0,
      [w2Str]: 0,
      [w1Str]: 0,
      [currentWeekStr]: 0
    };

    logs.forEach((log) => {
      const logWeek = getWeekString(new Date(log.date || log.created_at));
      if (logWeek in weekTotals) {
        weekTotals[logWeek] += log.co2_kg;
      }
    });

    setSparklineData([
      { name: "3 Wks Ago", co2: Number(weekTotals[w3Str].toFixed(1)) },
      { name: "2 Wks Ago", co2: Number(weekTotals[w2Str].toFixed(1)) },
      { name: "Last Week", co2: Number(weekTotals[w1Str].toFixed(1)) },
      { name: "This Week", co2: Number(weekTotals[currentWeekStr].toFixed(1)) }
    ]);

    // Load historical trendData from localStorage
    if (typeof window !== "undefined") {
      const trendStr = localStorage.getItem("prakriti_weekly_trend");
      if (trendStr) {
        try {
          setTrendData(JSON.parse(trendStr));
        } catch (e) {
          console.error("Failed to parse weekly trend:", e);
        }
      }
    }

    // 4. Load Active Adventure
    const adventures = await dbService.getAdventures(uid);
    const active = adventures.find(a => !a.claimed);
    if (active) {
      setActiveAdventure(active);
      setAdventureActive(true);
      
      if (active.completed && !active.claimed) {
        setTimeLeft(0);
        setAdventureStatus("Completed (Ready to Claim!)");
      } else {
        const returnsTime = new Date(active.returns_at).getTime();
        const diff = Math.max(0, Math.floor((returnsTime - Date.now()) / 1000));
        setTimeLeft(diff);
        setAdventureStatus("Exploring the Ghats");
      }
    } else {
      setActiveAdventure(null);
      setAdventureActive(false);
      setAdventureStatus("Resting in the canopy");
      setTimeLeft(0);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("prakriti_user_id");
      const isDemoMode = localStorage.getItem("prakriti_demo_mode") === "true";
      
      if (!storedUserId || isDemoMode) {
        seedArjunMumbaiDemoData();
      }

      const activeUserId = localStorage.getItem("prakriti_user_id") || "demo-user-arjun";
      setUserId(activeUserId);
      loadDashboardData(activeUserId);

      // Listen for custom state changes
      const handleStateChange = () => {
        const uId = localStorage.getItem("prakriti_user_id") || "demo-user-arjun";
        loadDashboardData(uId);
      };
      window.addEventListener("prakriti_state_changed", handleStateChange);
      return () => {
        window.removeEventListener("prakriti_state_changed", handleStateChange);
      };
    }
  }, [router]);

  // Timer loop for adventure
  useEffect(() => {
    if (!activeAdventure || activeAdventure.claimed) return;

    const tick = async () => {
      const returnsTime = new Date(activeAdventure.returns_at).getTime();
      const diff = Math.max(0, Math.floor((returnsTime - Date.now()) / 1000));
      setTimeLeft(diff);
      
      if (diff === 0 && !activeAdventure.completed) {
        setActiveAdventure(prev => prev ? { ...prev, completed: true } : null);
        setAdventureStatus("Completed (Ready to Claim!)");
        
        if (userId) {
          const adventures = await dbService.getAdventures(userId);
          const idx = adventures.findIndex((a) => a.id === activeAdventure.id);
          if (idx >= 0) {
            adventures[idx].completed = true;
            if (dbService.isDemoMode()) {
              const mockStorage = typeof window !== "undefined" ? window.localStorage : { setItem() {}, getItem() {} };
              mockStorage.setItem("prakriti_adventures", JSON.stringify(adventures));
            }
          }
        }
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeAdventure, userId]);

  const startAdventure = async () => {
    if (!userId || adventureActive) return;

    const durationSeconds = 30; 
    const startedAt = new Date().toISOString();
    const returnsAt = new Date(Date.now() + durationSeconds * 1000).toISOString();
    const reward = 25; 

    const newAdv = await dbService.startAdventure(userId, startedAt, returnsAt, reward);
    setActiveAdventure(newAdv);
    setAdventureActive(true);
    setAdventureStatus("Exploring the Ghats");
    setTimeLeft(durationSeconds);
    setTotalDuration(durationSeconds);

    window.dispatchEvent(new Event("prakriti_state_changed"));
  };

  const claimReward = async () => {
    if (!activeAdventure) return;
    const res = await dbService.claimAdventureReward(activeAdventure.id);
    if (res) {
      setPebbles(res.updatedUser.pebbles_balance);
      setRewardClaimed(`Chiku returned from the Ghats and brought back ${activeAdventure.reward_pebbles} pebbles!`);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });
      
      localStorage.setItem("prakriti_pebbles", res.updatedUser.pebbles_balance.toString());
      window.dispatchEvent(new Event("prakriti_state_changed"));

      setActiveAdventure(null);
      setAdventureActive(false);
      setAdventureStatus("Resting in the canopy");
      setTimeLeft(0);
      
      setTimeout(() => {
        setRewardClaimed(null);
      }, 6000);
    }
  };

  const handleSaveGoal = () => {
    const parsed = parseFloat(goalInput);
    if (!isNaN(parsed) && parsed > 0) {
      setReductionGoal(parsed);
      localStorage.setItem("prakriti_co2_goal", parsed.toString());
      setIsEditingGoal(false);
      confetti({
        particleCount: 40,
        spread: 40,
        origin: { y: 0.9 }
      });
    }
  };

  // Envelope percentage utilities
  const getEnvelopeDetails = (spent: number, max: number) => {
    const remaining = Math.max(0, max - spent);
    const remainingPercent = spent >= max ? 0 : (remaining / max) * 100;
    
    let colorClass = "bg-primary"; 
    let textClass = "text-primary border-primary/20";
    let status = "Healthy";

    if (spent > max) {
      if (spent <= max * 1.3) {
        colorClass = "bg-amber-500";
        textClass = "text-amber-500 border-amber-500/20";
        status = "Warning";
      } else {
        colorClass = "bg-red-500";
        textClass = "text-red-400 border-red-500/20";
        status = "Critical";
      }
    } else if (remainingPercent < 20) {
      colorClass = "bg-red-500";
      textClass = "text-red-400 border-red-500/20";
      status = "Critical";
    } else if (remainingPercent <= 50) {
      colorClass = "bg-amber-500";
      textClass = "text-amber-500 border-amber-500/20";
      status = "Warning";
    }

    return {
      remaining,
      percent: (spent / max) * 100,
      remainingPercent,
      colorClass,
      textClass,
      status
    };
  };

  const envelopes = [
    { 
      id: "transport", 
      name: "Transport", 
      spent: budget.transport_spent, 
      max: budget.transport, 
      icon: Flame, 
      color: "from-blue-500 to-indigo-500",
      desc: "Commutes & travel"
    },
    { 
      id: "food", 
      name: "Food", 
      spent: budget.food_spent, 
      max: budget.food, 
      icon: Apple, 
      color: "from-green-500 to-emerald-500",
      desc: "Dietary choices"
    },
    { 
      id: "energy", 
      name: "Energy", 
      spent: budget.energy_spent, 
      max: budget.energy, 
      icon: Lightbulb, 
      color: "from-yellow-500 to-amber-500",
      desc: "Grid & cooking fuels"
    },
    { 
      id: "lifestyle", 
      name: "Lifestyle", 
      spent: budget.lifestyle_spent, 
      max: budget.lifestyle, 
      icon: Gamepad2, 
      color: "from-purple-500 to-pink-500",
      desc: "Purchases & activities"
    },
  ];

  // Calculate total budget metrics
  const totalBudgetMax = envelopes.reduce((acc, curr) => acc + curr.max, 0);
  const totalBudgetSpent = envelopes.reduce((acc, curr) => acc + curr.spent, 0);
  const totalRemainingPercent = ((totalBudgetMax - totalBudgetSpent) / totalBudgetMax) * 100;

  // Goal calculations
  const goalDiff = totalBudgetSpent - reductionGoal;
  const goalPercent = Math.round(Math.abs((goalDiff / reductionGoal) * 100));
  const isBelowGoal = totalBudgetSpent <= reductionGoal;

  // Regional Benchmarks
  const benchmarks = [
    { name: 'You', value: userMonthlyKg, fill: '#4ade80' },
    { name: '1.5°C Target', value: 167, fill: '#86efac' },
    { name: 'India National', value: 183, fill: '#fbbf24' },
    { name: 'India Urban', value: 290, fill: '#f97316' },
    { name: 'Global Avg', value: 392, fill: '#ef4444' },
  ];

  // Circular progress math
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  let progressPercent = 100;
  if (adventureActive && activeAdventure) {
    const start = new Date(activeAdventure.started_at).getTime();
    const end = new Date(activeAdventure.returns_at).getTime();
    const total = end - start;
    if (total > 0) {
      progressPercent = (timeLeft * 1000 / total) * 100;
    }
  }
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Alert banner for adventure reward */}
      {rewardClaimed && (
        <div 
          role="alert"
          className="bg-primary/10 border-2 border-primary/30 p-4 rounded-xl flex items-center space-x-3 text-sm text-primary animate-fade-in"
        >
          <Sparkles className="w-5 h-5 text-warm animate-spin" />
          <span className="font-medium">{rewardClaimed}</span>
        </div>
      )}

      {/* TOP SECTION: Weekly Carbon Budget Bar */}
      <section className="bg-surface border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        {!shouldReduceMotion && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-foreground/60 text-xs font-semibold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Weekly Budget Cycle</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Week of {getMondayDate()}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-xs px-2 py-0.5 rounded bg-background border border-border/80 text-foreground/70 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-primary" />
                <span>{city}</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-background border border-border/80 text-foreground/70 flex items-center space-x-1">
                <Coins className="w-3 h-3 text-warm fill-warm/20" />
                <span>{pebbles} Pebbles</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-background border border-border/80 rounded-xl px-4 py-2.5">
            <div>
              <span className="block text-[10px] text-foreground/50 uppercase tracking-widest font-mono">Spent / Budget</span>
              <span className="text-sm font-bold text-foreground/90">
                {totalBudgetSpent.toFixed(1)} / {totalBudgetMax.toFixed(0)} <span className="text-xs text-foreground/60 font-normal">kg CO₂</span>
              </span>
            </div>
            <div className="h-6 w-[1px] bg-border" />
            <div>
              <span className="block text-[10px] text-foreground/50 uppercase tracking-widest font-mono">Remaining</span>
              <span className={`text-sm font-extrabold ${totalRemainingPercent > 50 ? "text-primary" : totalRemainingPercent >= 20 ? "text-warm" : "text-red-400"}`}>
                {(totalBudgetMax - totalBudgetSpent).toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>

        {/* Master Segmented Progress Bar */}
        <div className="space-y-4">
          <div className="h-4 w-full bg-background border border-border/80 rounded-full flex overflow-hidden p-0.5">
            {envelopes.map((env) => {
              const details = getEnvelopeDetails(env.spent, env.max);
              const segmentWidth = (env.max / totalBudgetMax) * 100;
              const innerWidth = (env.spent / env.max) * 100;

              return (
                <div 
                  key={env.id} 
                  className="h-full border-r border-background/25 last:border-0 relative"
                  style={{ width: `${segmentWidth}%` }}
                >
                  <div 
                    className={`h-full rounded-sm ${details.colorClass} opacity-85 transition-all duration-500`}
                    style={{ width: `${Math.min(100, innerWidth)}%` }}
                  />
                  <div className="absolute inset-0 bg-surface/20 hover:bg-transparent transition-colors pointer-events-none" />
                </div>
              );
            })}
          </div>

          {/* Individual envelopes display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            {envelopes.map((env) => {
              const details = getEnvelopeDetails(env.spent, env.max);
              const Icon = env.icon;
              return (
                <div 
                  key={env.id}
                  className="bg-background/40 border border-border/60 hover:border-border rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-surface text-foreground/80">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground/90">{env.name}</h3>
                        <span className="text-[10px] text-foreground/50">{env.desc}</span>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-md uppercase tracking-wider ${details.textClass}`}>
                      {details.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-foreground/60">
                      <span>Spent: <strong className="text-foreground/90 font-sans">{env.spent.toFixed(1)}</strong></span>
                      <span>Allocated: <strong className="text-foreground/90 font-sans">{env.max}</strong></span>
                    </div>
                    <div className="h-1.5 bg-background rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${details.colorClass} transition-all duration-500`}
                        style={{ width: `${Math.min(100, (env.spent / env.max) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEW SECTION: Goal Tracking & Regional Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Goal Tracker */}
        <section aria-label="Reduction Goal Tracker" className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-base text-foreground">Weekly Reduction Goal</h3>
              </div>

              {!isEditingGoal ? (
                <button
                  onClick={() => setIsEditingGoal(true)}
                  aria-label="Edit weekly target"
                  className="p-1.5 hover:bg-background border border-transparent hover:border-border rounded-lg text-foreground/60 hover:text-primary transition-all focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    aria-label="New target CO2 limit per week"
                    className="w-20 px-2 py-1 text-xs bg-background border border-border focus:border-primary rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 text-foreground font-semibold font-mono"
                  />
                  <button
                    onClick={handleSaveGoal}
                    className="px-2.5 py-1 text-[11px] font-bold bg-primary text-background rounded-md hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[32px] min-w-[48px]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingGoal(false);
                      setGoalInput(reductionGoal.toString());
                    }}
                    className="px-2 py-1 text-[11px] font-medium hover:bg-background border border-border rounded-md text-foreground/60 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[32px]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="bg-background border border-border/70 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/50">Current Goal Target</span>
                <span className="font-bold font-mono text-foreground/90">{reductionGoal.toFixed(2)} kg CO₂e / week</span>
              </div>

              <div className="space-y-1.5">
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isBelowGoal ? "bg-primary" : "bg-red-500"}`}
                    style={{ width: `${Math.min(100, (totalBudgetSpent / reductionGoal) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-foreground/60 mt-2 font-medium">
                  {isBelowGoal ? (
                    <span>🎉 You&apos;re <strong className="text-primary">{goalPercent}% below</strong> your target this week. Excellent!</span>
                  ) : (
                    <span>⚠️ You&apos;re <strong className="text-red-400">{goalPercent}% above</strong> your target this week. Consider public transit.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Sparkline History Trend */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-foreground/50 uppercase tracking-widest block">Last 4 Weeks Trend</span>
                <span className="text-xs font-medium text-emerald-500">↓ 18% reduction over 4 weeks 🌿</span>
              </div>
              <div className="w-full h-40">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="week" 
                        tick={{ fill: 'var(--foreground)', fontSize: 11 }}
                      />
                      <YAxis 
                        tick={{ fill: 'var(--foreground)', fontSize: 11 }}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip
                        formatter={(v) => [`${v} kg`, 'CO₂']}
                        contentStyle={{
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--foreground)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="co2" 
                        stroke="#4ade80" 
                        strokeWidth={2}
                        fill="url(#trendGrad)"
                        dot={{ fill: '#4ade80', r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full bg-background/30 border border-border/40 rounded-xl flex items-center justify-center">
                    <span className="text-xs text-foreground/40 font-mono">Aggregating history...</span>
                  </div>
                )}
              </div>

              {/* Sparkline Accessible Fallback */}
              <table className="sr-only">
                <caption>Historical Weekly Carbon Footprint (Last 4 Weeks)</caption>
                <thead>
                  <tr>
                    <th scope="col">Week</th>
                    <th scope="col">CO₂ Footprint (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((d, i) => (
                    <tr key={i}>
                      <td>{d.week}</td>
                      <td>{d.co2} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Card 2: Regional Benchmarks Compare Card */}
        <section aria-label="Regional Benchmarks" className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-5 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Leaf className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Global & Regional Benchmarks</h3>
            </div>
            
            <p className="text-xs text-foreground/60">
              Comparing your estimated monthly footprint (<strong className="text-foreground font-bold">{userMonthlyKg} kg</strong>) against international averages.
            </p>

            {/* Horizontal Bar Chart */}
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={benchmarks}
                  margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                >
                  <XAxis 
                    type="number" 
                    tickFormatter={(v) => `${v}`}
                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} kg CO₂/month`, 'Footprint']}
                    contentStyle={{ 
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {benchmarks.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center mt-2 opacity-60">
              Sources: CEA India, WRI, IPCC AR6, Paris Agreement
            </p>

            {/* Benchmarks Accessible Fallback */}
            <table className="sr-only">
              <caption>Monthly Carbon Footprint Benchmark Comparisons</caption>
              <thead>
                <tr>
                  <th scope="col">Benchmark Category</th>
                  <th scope="col">Monthly CO₂ (kg)</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((d, i) => (
                  <tr key={i}>
                    <td>{d.name}</td>
                    <td>{d.value} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* MIDDLE SECTION: Prakriti Companion card */}
      <section className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12">
        {/* Parallax Canopy Viewport */}
        <div className="lg:col-span-7 h-64 sm:h-80 lg:h-96 relative misty-shola-bg border-b lg:border-b-0 lg:border-r border-border">
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#080d16] to-[#0d1424]">
            <svg className="absolute bottom-0 w-full h-[60%] opacity-20 text-[#162740] fill-current" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,80 L80,30 L160,70 L240,25 L320,65 L400,30 L400,100 L0,100 Z" />
            </svg>
          </div>

          <div className="absolute inset-0 z-1 pointer-events-none">
            <svg className="absolute bottom-0 w-full h-[50%] opacity-35 text-[#0f3027] fill-current" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,90 L60,50 L140,80 L220,45 L300,75 L400,40 L400,100 L0,100 Z" />
            </svg>
            {!shouldReduceMotion && (
              <div className="absolute bottom-4 left-[-10%] w-[120%] h-12 bg-white/5 blur-md rounded-full mist-slow" />
            )}
          </div>

          <div className="absolute inset-0 z-2 pointer-events-none flex flex-col justify-end">
            <svg className="w-full h-[35%] opacity-70 text-[#091b15] fill-current" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,95 L100,75 L200,90 L300,70 L400,95 L400,100 L0,100 Z" />
            </svg>
            <svg className="absolute bottom-2 left-0 w-full h-8 text-[#2e1d0c] fill-current opacity-90" viewBox="0 0 400 20" preserveAspectRatio="none">
              <path d="M0,5 Q100,12 250,5 T400,12 L400,20 L0,20 Z" />
            </svg>
          </div>

          {!shouldReduceMotion && (
            <div className="absolute bottom-1 right-[-20%] w-[100%] h-8 bg-white/5 blur-sm rounded-full mist-fast z-3" />
          )}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-4 flex flex-col items-center">
            <motion.svg 
              width="140" 
              height="140" 
              viewBox="0 0 200 200" 
              className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
              animate={shouldReduceMotion ? {} : { 
                y: adventureActive ? [0, -4, 0] : [0, -2, 0],
                rotate: adventureActive ? [0, 1, -1, 0] : [0, 0.5, -0.5, 0]
              }}
              transition={shouldReduceMotion ? {} : { 
                repeat: Infinity, 
                duration: adventureActive ? 2 : 4, 
                ease: "easeInOut" 
              }}
            >
              <path 
                d="M 125 150 C 160 160, 180 130, 175 90 C 170 70, 185 60, 190 70" 
                stroke="#181c22" 
                strokeWidth="7" 
                strokeLinecap="round"
                fill="none" 
              />
              <circle cx="190" cy="70" r="7" fill="#8a95a5" />
              <ellipse cx="75" cy="165" rx="14" ry="8" fill="#11141a" />
              <ellipse cx="125" cy="165" rx="14" ry="8" fill="#11141a" />
              <ellipse cx="100" cy="135" rx="36" ry="42" fill="#181c22" />
              <path d="M 80 115 Q 100 130 120 115 Q 110 145 100 145 Q 90 145 80 115 Z" fill="#6b7280" opacity="0.3" />
              <path d="M 68 120 C 60 135, 75 160, 85 160" stroke="#181c22" strokeWidth="12" strokeLinecap="round" fill="none" />
              <path d="M 132 120 C 140 135, 125 160, 115 160" stroke="#181c22" strokeWidth="12" strokeLinecap="round" fill="none" />
              <path 
                d="M 100 35 C 50 35, 40 110, 100 115 C 160 110, 150 35, 100 35 Z" 
                fill="#d1d5db" 
                stroke="#9ca3af"
                strokeWidth="1.5"
              />
              <path d="M 80 43 C 58 45, 52 90, 85 102" stroke="#f3f4f6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
              <path d="M 120 43 C 142 45, 148 90, 115 102" stroke="#f3f4f6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
              <ellipse cx="100" cy="78" rx="26" ry="24" fill="#0d1117" />
              <ellipse cx="70" cy="75" rx="7" ry="9" fill="#181c22" />
              <ellipse cx="70" cy="75" rx="4" ry="5" fill="#2d3748" />
              <ellipse cx="130" cy="75" rx="7" ry="9" fill="#181c22" />
              <ellipse cx="130" cy="75" rx="4" ry="5" fill="#2d3748" />
              <circle cx="89" cy="74" r="7" fill="#fbbf24" opacity="0.9" />
              <circle cx="111" cy="74" r="7" fill="#fbbf24" opacity="0.9" />
              <circle cx="89" cy="74" r="4.5" fill="#000" />
              <circle cx="111" cy="74" r="4.5" fill="#000" />
              <circle cx="87" cy="72" r="1.5" fill="#fff" />
              <circle cx="109" cy="72" r="1.5" fill="#fff" />
              <path d="M 78 66 Q 89 62 100 66 Q 111 62 122 66" stroke="#222" strokeWidth="2.5" fill="none" />
              <path d="M 94 82 L 100 87 L 106 82 Z" fill="#2d3748" />
              <circle cx="97" cy="85" r="0.8" fill="#111" />
              <circle cx="103" cy="85" r="0.8" fill="#111" />
              <path 
                d="M 94 92 Q 100 95 106 92" 
                stroke="#4a5568" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                fill="none" 
              />
              <ellipse cx="80" cy="83" rx="4" ry="2" fill="#ef4444" opacity="0.4" />
              <ellipse cx="120" cy="83" rx="4" ry="2" fill="#ef4444" opacity="0.4" />
            </motion.svg>

            <div className="absolute top-2 left-2 flex space-x-1">
              <Leaf className="w-4 h-4 text-emerald-500 fill-current opacity-70 rotate-45" />
              <Leaf className="w-5 h-5 text-green-600 fill-current opacity-60 rotate-12" />
            </div>
          </div>
          
          <div className="absolute top-4 left-4 bg-background/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/60 text-xs flex items-center space-x-1.5">
            <Compass className={`w-3.5 h-3.5 text-primary ${shouldReduceMotion ? "" : "animate-spin"}`} />
            <span className="font-medium text-foreground/80">Western Ghats Canopy: Nilgiri Range</span>
          </div>
        </div>

        {/* Companion Action Controls */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full uppercase tracking-wider">
                Companion
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground mt-2 flex items-center space-x-2">
                <span>Chiku the Macaque</span>
                <span className="text-xs text-foreground/50 font-normal font-mono">(Lion-Tailed Macaque)</span>
              </h3>
            </div>

            <div className="bg-background border border-border/80 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-foreground/50">Status</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${adventureActive ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                  {adventureStatus}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-border/40 pt-2 text-xs">
                <span className="text-foreground/50">Companion Stage</span>
                <span className="font-semibold text-foreground/90 capitalize">{companionStage}</span>
              </div>

              <div className="flex justify-between items-center border-t border-border/40 pt-2 text-xs">
                <span className="text-foreground/50">Energy</span>
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-foreground/90">{companionEnergy}%</span>
                  <div className="w-12 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${companionEnergy}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-border/40 pt-2 text-xs">
                <span className="text-foreground/50">Pebbles Balance</span>
                <span className="font-semibold text-warm">{pebbles} Pebbles</span>
              </div>

              <div className="flex items-center space-x-4 border-t border-border/40 pt-2">
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="32" 
                      cy="32" 
                      r={radius} 
                      className="text-border fill-none" 
                      strokeWidth="4" 
                    />
                    <motion.circle 
                      cx="32" 
                      cy="32" 
                      r={radius} 
                      className={`${adventureActive ? "text-accent" : "text-primary"} fill-none`}
                      strokeWidth="4" 
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold font-mono">
                    {activeAdventure && activeAdventure.completed && !activeAdventure.claimed 
                      ? "Done!" 
                      : adventureActive 
                        ? `${timeLeft}s` 
                        : "Idle"}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-foreground/75">
                  {activeAdventure && activeAdventure.completed && !activeAdventure.claimed ? (
                    <>
                      <p className={`font-semibold text-accent ${shouldReduceMotion ? "" : "animate-pulse"}`}>Adventure Completed!</p>
                      <p className="text-foreground/50">Chiku has returned from the Shola forest with a harvest of pebbles.</p>
                    </>
                  ) : adventureActive ? (
                    <>
                      <p className="font-semibold text-accent">Gathering seeds...</p>
                      <p className="text-foreground/50">Chiku is wandering around the Shola forest looking for flora samples.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-primary">Fully Rested</p>
                      <p className="text-foreground/50">Ready to go on a new exploration to collect Pebbles and plant seeds.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {activeAdventure && activeAdventure.completed && !activeAdventure.claimed ? (
            <button
              onClick={claimReward}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all bg-accent text-background hover:brightness-110 active:scale-[0.98] shadow-lg shadow-accent/20 min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${shouldReduceMotion ? "" : "animate-pulse"}`}
            >
              <span>Claim Adventure Reward (+{activeAdventure.reward_pebbles} Pebbles)</span>
              <Sparkles className="w-4 h-4 fill-current text-background" />
            </button>
          ) : (
            <button
              onClick={startAdventure}
              disabled={adventureActive}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                adventureActive 
                  ? "bg-border text-foreground/30 cursor-not-allowed" 
                  : "bg-primary text-background hover:brightness-110 active:scale-[0.98] shadow-lg shadow-primary/10"
              }`}
            >
              <span>{adventureActive ? `Chiku is exploring (${timeLeft}s remaining)...` : "Send Chiku on adventure"}</span>
              {!adventureActive && <ArrowRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </section>

      {/* BOTTOM SECTION: Quick Action Grid */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Receipt Scanner */}
          <button 
            onClick={() => router.push("/scan")}
            aria-label="Open Receipt Scanner"
            className="group bg-surface hover:bg-surface/80 border border-border hover:border-primary/50 rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-md hover:shadow-primary/5 flex flex-col justify-between h-40 w-full text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[44px]"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors">Receipt Scanner</h4>
                <p className="text-xs text-foreground/50 mt-1">Scan transport or grocery bills to calculate carbon footprint using Gemini.</p>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-bold text-primary group-hover:underline uppercase tracking-wider">
              <span>Open Scanner</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>

          {/* 2. Log Footprint */}
          <button 
            onClick={() => router.push("/log")}
            aria-label="Open manual activity logger"
            className="group bg-surface hover:bg-surface/80 border border-border hover:border-primary/50 rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-md hover:shadow-primary/5 flex flex-col justify-between h-40 w-full text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[44px]"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors">Log Footprint</h4>
                <p className="text-xs text-foreground/50 mt-1">Manually enter a vehicle ride, flight, electricity bill, or diet item.</p>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-bold text-primary group-hover:underline uppercase tracking-wider">
              <span>Log Entry</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>

          {/* 3. Insights */}
          <button 
            onClick={() => router.push("/insights")}
            aria-label="Open AI coach insights and intention settings"
            className="group bg-surface hover:bg-surface/80 border border-border hover:border-primary/50 rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-md hover:shadow-primary/5 flex flex-col justify-between h-40 w-full text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[44px]"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors">Insights & Path</h4>
                <p className="text-xs text-foreground/50 mt-1">Compare your weekly averages against India&apos;s target trajectory.</p>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-bold text-primary group-hover:underline uppercase tracking-wider">
              <span>View Analytics</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>

          {/* 4. Budget */}
          <button 
            onClick={() => router.push("/budget")}
            aria-label="Open carbon budget envelope management"
            className="group bg-surface hover:bg-surface/80 border border-border hover:border-primary/50 rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-md hover:shadow-primary/5 flex flex-col justify-between h-40 w-full text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[44px]"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors">Carbon Budget</h4>
                <p className="text-xs text-foreground/50 mt-1">Allocate carbon envelopes and modify weekly carbon targets.</p>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-bold text-primary group-hover:underline uppercase tracking-wider">
              <span>Manage Budget</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>

        </div>
      </section>
    </div>
  );
}
