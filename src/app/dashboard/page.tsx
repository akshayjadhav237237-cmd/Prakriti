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
  Edit2,
  Sun,
  CloudSun,
  CloudLightning,
  Cloud
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

// Envelope Card Subcomponent for Isolated 3D Tilt Rendering
interface EnvelopeCardProps {
  id: string;
  name: string;
  spent: number;
  max: number;
  icon: React.ComponentType<any>;
  color: string;
  desc: string;
  shouldReduceMotion: boolean;
  getEnvelopeDetails: (spent: number, max: number) => {
    remaining: number;
    percent: number;
    remainingPercent: number;
    colorClass: string;
    textClass: string;
    status: string;
  };
}

function EnvelopeCard({ id, name, spent, max, icon: Icon, color, desc, shouldReduceMotion, getEnvelopeDetails }: EnvelopeCardProps) {
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const details = getEnvelopeDetails(spent, max);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Max rotation 10 degrees
    const rotateX = -(y / (rect.height / 2)) * 10;
    const rotateY = (x / (rect.width / 2)) * 10;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  let iconBgColor = "bg-emerald-500/10 text-emerald-500";
  let barColor = "bg-emerald-500";

  if (id === "transport") {
    iconBgColor = "bg-blue-500/10 text-blue-500";
    barColor = "bg-blue-500";
  } else if (id === "food") {
    iconBgColor = "bg-green-500/10 text-green-500";
    barColor = "bg-green-500";
  } else if (id === "energy") {
    iconBgColor = "bg-amber-500/10 text-amber-500";
    barColor = "bg-amber-500";
  } else if (id === "lifestyle") {
    iconBgColor = "bg-purple-500/10 text-purple-500";
    barColor = "bg-purple-500";
  }

  if (details.status === "Warning") {
    barColor = "bg-amber-500";
  } else if (details.status === "Critical") {
    barColor = "bg-red-500";
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: "transform 0.1s ease-out" }}
      className="card-premium p-6 flex flex-col justify-between h-full relative overflow-hidden transition-all duration-300 border border-border/80 hover:border-primary/40 shadow-lg group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base text-foreground">{name}</h4>
            <p className="text-xs text-foreground/50">{desc}</p>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 text-[10px] font-bold border rounded-full uppercase tracking-wider ${details.textClass}`}>
          {details.status}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {spent.toFixed(1)}
          </span>
          <span className="text-xs font-semibold text-foreground/50 ml-1.5">kg CO₂ spent</span>
        </div>

        <div className="space-y-1.5">
          {/* 8px progress bar */}
          <div className="h-2 w-full bg-background border border-border/60 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-500`}
              style={{ width: `${Math.min(100, (spent / max) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-foreground/50">
            <span>Spent: {spent.toFixed(1)} kg</span>
            <span>Allocated: {max.toFixed(1)} kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Arjun");
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

  // Master Progress Bar load animation state
  const [masterBarLoaded, setMasterBarLoaded] = useState(false);

  // Canopy Parallax Coordinates
  const [canopyCoordinates, setCanopyCoordinates] = useState({ x: 0, y: 0 });

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
      setUserName(user.name || "Arjun");
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

      // Trigger animation for progress bar
      const pTimer = setTimeout(() => setMasterBarLoaded(true), 150);

      // Listen for custom state changes
      const handleStateChange = () => {
        const uId = localStorage.getItem("prakriti_user_id") || "demo-user-arjun";
        loadDashboardData(uId);
      };
      window.addEventListener("prakriti_state_changed", handleStateChange);
      return () => {
        window.removeEventListener("prakriti_state_changed", handleStateChange);
        clearTimeout(pTimer);
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
    
    let colorClass = "bg-emerald-500"; 
    let textClass = "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
    let status = "Healthy";

    if (spent > max) {
      if (spent <= max * 1.3) {
        colorClass = "bg-amber-500";
        textClass = "text-amber-500 border-amber-500/20 bg-amber-500/5";
        status = "Warning";
      } else {
        colorClass = "bg-red-500";
        textClass = "text-red-400 border-red-500/20 bg-red-500/5";
        status = "Critical";
      }
    } else if (remainingPercent < 20) {
      colorClass = "bg-red-500";
      textClass = "text-red-400 border-red-500/20 bg-red-500/5";
      status = "Critical";
    } else if (remainingPercent <= 50) {
      colorClass = "bg-amber-500";
      textClass = "text-amber-500 border-amber-500/20 bg-amber-500/5";
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

  const getCO2WeatherDetails = () => {
    const ratio = totalBudgetMax > 0 ? (totalBudgetSpent / totalBudgetMax) : 0;
    let icon = <Sun className="w-5 h-5 text-emerald-400 animate-pulse" />;
    let statusText = "Sunny / Low Impact";
    let bgClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    let desc = "Atmosphere is clean and clear.";
    let colorIndicator = "text-emerald-400";
    
    if (ratio > 1.2) {
      icon = <CloudLightning className="w-5 h-5 text-red-400 animate-bounce" />;
      statusText = "Severe Storm";
      bgClass = "bg-red-500/15 border-red-500/30 text-red-400";
      desc = "Critical emissions overhead.";
      colorIndicator = "text-red-400";
    } else if (ratio > 1.0) {
      icon = <Cloud className="w-5 h-5 text-rose-400 animate-pulse" />;
      statusText = "Cloudy / Over Limit";
      bgClass = "bg-rose-500/10 border-rose-500/30 text-rose-400";
      desc = "Over your weekly limit.";
      colorIndicator = "text-rose-400";
    } else if (ratio > 0.8) {
      icon = <CloudSun className="w-5 h-5 text-amber-400 animate-bounce" />;
      statusText = "Overcast";
      bgClass = "bg-amber-500/10 border-amber-500/30 text-amber-400";
      desc = "Approaching weekly budget limit.";
      colorIndicator = "text-amber-400";
    } else if (ratio > 0.5) {
      icon = <CloudSun className="w-5 h-5 text-sky-400" />;
      statusText = "Partly Cloudy";
      bgClass = "bg-sky-500/10 border-sky-500/30 text-sky-400";
      desc = "Moderate carbon accumulation.";
      colorIndicator = "text-sky-400";
    }
    
    return { icon, statusText, bgClass, desc, colorIndicator };
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
  const totalRemainingPercent = totalBudgetMax > 0 ? (((totalBudgetMax - totalBudgetSpent) / totalBudgetMax) * 100) : 0;

  // Goal calculations
  const goalDiff = totalBudgetSpent - reductionGoal;
  const goalPercent = Math.round(Math.abs((goalDiff / reductionGoal) * 100));
  const isBelowGoal = totalBudgetSpent <= reductionGoal;

  // Regional Benchmarks
  const benchmarks = [
    { name: 'You', value: userMonthlyKg, fill: '#10b981' },
    { name: '1.5°C Target', value: 167, fill: '#0d9488' },
    { name: 'India National', value: 183, fill: '#f59e0b' },
    { name: 'India Urban', value: 290, fill: '#ea580c' },
    { name: 'Global Avg', value: 392, fill: '#e11d48' },
  ];

  // Circular progress math for adventure timer
  const radius = 20;
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

  // Energy Circular Progress math
  const energyRadius = 20;
  const energyCircumference = 2 * Math.PI * energyRadius;
  const energyStrokeDashoffset = energyCircumference - (companionEnergy / 100) * energyCircumference;

  // Parallax Event Handlers
  const handleCanopyMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Set coordinates (moving opposite to cursor offset)
    setCanopyCoordinates({
      x: -x / 20,
      y: -y / 20
    });
  };

  const handleCanopyMouseLeave = () => {
    setCanopyCoordinates({ x: 0, y: 0 });
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Styles block to handle card-premium definition dynamically */}
      <style dangerouslySetInnerHTML={{ __html: `
        .card-premium {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease-out;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .card-premium:hover {
          box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.08), 0 8px 12px -8px rgba(0, 0, 0, 0.04);
        }
      `}} />

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

      {/* PAGE HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Good morning, {userName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-foreground/50 mt-1.5 flex items-center flex-wrap gap-x-2 gap-y-1">
            <span className="font-semibold text-foreground/70">Monday Cycle: {getMondayDate()}</span>
            <span className="text-foreground/30">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              {city}
            </span>
            <span className="text-foreground/30">•</span>
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-warm fill-warm/20" />
              <span className="font-semibold">{pebbles} Pebbles</span>
            </span>
          </p>
        </div>

        {/* Weather-style CO2 Badge */}
        {(() => {
          const weather = getCO2WeatherDetails();
          return (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-lg ${weather.bgClass} max-w-sm w-full md:w-80`}>
              <div className="p-2.5 rounded-xl bg-background/40 flex items-center justify-center flex-shrink-0">
                {weather.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Carbon Climate</span>
                  <span className={`text-[11px] font-bold ${weather.colorIndicator}`}>{weather.statusText}</span>
                </div>
                <p className="text-[10px] text-foreground/75 truncate mt-0.5">{weather.desc}</p>
                <div className="text-[11px] font-mono mt-1 text-foreground/90 font-bold flex justify-between">
                  <span>Spent: {totalBudgetSpent.toFixed(1)} kg</span>
                  <span className="opacity-50">Limit: {totalBudgetMax.toFixed(0)} kg</span>
                </div>
              </div>
            </div>
          );
        })()}
      </header>

      {/* MASTER Segmented Progress Bar */}
      <section className="card-premium p-6 border border-border/80 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-500" />
              Master Carbon Allocation
            </h3>
            <p className="text-xs text-foreground/50">Overall progress relative to total weekly carbon envelopes</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-background/60 border border-border/60 px-3 py-1.5 rounded-xl">
              <span className="text-foreground/40 mr-1.5 uppercase text-[10px]">Total Spent:</span>
              <span className="font-bold text-foreground">{totalBudgetSpent.toFixed(1)} kg</span>
            </div>
            <div className="bg-background/60 border border-border/60 px-3 py-1.5 rounded-xl">
              <span className="text-foreground/40 mr-1.5 uppercase text-[10px]">Budget Limit:</span>
              <span className="font-bold text-foreground">{totalBudgetMax.toFixed(0)} kg</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Master Segmented Progress Bar - Loads from 0% to Target */}
          <div className="h-5 w-full bg-background/50 border border-border/80 rounded-full flex overflow-hidden p-0.5 relative">
            {envelopes.map((env) => {
              const details = getEnvelopeDetails(env.spent, env.max);
              const segmentWidth = totalBudgetMax > 0 ? ((env.max / totalBudgetMax) * 100) : 0;
              const innerWidth = env.max > 0 ? ((env.spent / env.max) * 100) : 0;
              const Icon = env.icon;

              return (
                <div 
                  key={env.id} 
                  className="h-full border-r border-background/20 last:border-0 relative group flex-1"
                  style={{ 
                    width: masterBarLoaded ? `${segmentWidth}%` : "0%", 
                    transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' 
                  }}
                >
                  {/* Spent Fill */}
                  <div 
                    className={`h-full rounded-full ${details.colorClass} opacity-90 transition-all`}
                    style={{ 
                      width: masterBarLoaded ? `${Math.min(100, innerWidth)}%` : "0%", 
                      transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s' 
                    }}
                  />
                  {/* Hover Highlight Overlay */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                  
                  {/* Customized Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-56 p-3 bg-slate-900/95 border border-emerald-500/30 rounded-xl shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform scale-95 group-hover:scale-100 origin-bottom flex flex-col gap-1.5 text-xs text-white">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="font-bold flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-emerald-400" />
                        {env.name}
                      </span>
                      <span className={`px-1.5 py-0.25 text-[9px] font-bold border rounded-md uppercase tracking-wider ${details.textClass}`}>
                        {details.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Allocation:</span>
                      <span className="font-semibold font-mono text-white/95">{env.max.toFixed(1)} kg ({Math.round(segmentWidth)}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Spent:</span>
                      <span className="font-semibold font-mono text-white/95">{env.spent.toFixed(1)} kg ({Math.round(innerWidth)}%)</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-1.5">
                      <span className="text-white/60">Remaining:</span>
                      <span className="font-semibold font-mono text-emerald-400">{(env.max - env.spent).toFixed(1)} kg</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95" />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs">
            {envelopes.map((env) => {
              let labelColor = "text-emerald-500";
              if (env.id === "transport") labelColor = "text-blue-500";
              else if (env.id === "food") labelColor = "text-green-500";
              else if (env.id === "energy") labelColor = "text-amber-500";
              else if (env.id === "lifestyle") labelColor = "text-purple-500";

              return (
                <div key={env.id} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full bg-current ${labelColor}`} />
                  <span className="text-foreground/75 font-medium">{env.name}:</span>
                  <span className="font-mono text-foreground/50 font-semibold">{env.spent.toFixed(1)} / {env.max.toFixed(0)} kg</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* YOUR CARBON ENVELOPES */}
      <section className="space-y-4">
        <h2 className="text-base sm:text-lg font-black tracking-wider text-green-600 uppercase">
          YOUR CARBON ENVELOPES
        </h2>
        {/* Responsive: Stacks vertically on mobile, 2x2 grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {envelopes.map((env) => (
            <EnvelopeCard 
              key={env.id}
              id={env.id}
              name={env.name}
              spent={env.spent}
              max={env.max}
              icon={env.icon}
              color={env.color}
              desc={env.desc}
              shouldReduceMotion={shouldReduceMotion ?? false}
              getEnvelopeDetails={getEnvelopeDetails}
            />
          ))}
        </div>
      </section>

      {/* Goal Tracking & Regional Benchmarks (Charts wrapped in card-premium) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Goal Tracker */}
        <section aria-label="Reduction Goal Tracker" className="card-premium p-6 shadow-xl space-y-6 flex flex-col justify-between relative overflow-hidden">
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
                    <AreaChart 
                      data={trendData}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                        stroke="#10b981" 
                        strokeWidth={2}
                        fill="url(#trendGrad)"
                        dot={{ fill: '#10b981', r: 4 }}
                        animationDuration={800}
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
        <section aria-label="Regional Benchmarks" className="card-premium p-6 shadow-xl space-y-5 flex flex-col justify-between relative overflow-hidden">
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
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={800}>
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

      {/* Prakriti Companion card */}
      <section className="card-premium overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-border/80 shadow-xl gap-0">
        
        {/* Parallax Canopy Viewport - Crops height on mobile */}
        <div 
          onMouseMove={handleCanopyMouseMove}
          onMouseLeave={handleCanopyMouseLeave}
          className="lg:col-span-7 h-56 sm:h-72 lg:h-96 relative misty-shola-bg border-b lg:border-b-0 lg:border-r border-border overflow-hidden"
        >
          {/* Layer 1: Sky / Deep Background */}
          <div 
            className="absolute inset-0 z-0 bg-gradient-to-t from-[#0b1329] to-[#050814]"
            style={{ 
              transform: `translate3d(${-canopyCoordinates.x * 0.2}px, ${-canopyCoordinates.y * 0.2}px, 0)`,
              transition: 'transform 0.25s ease-out'
            }}
          >
            {/* Stars or moon in background */}
            <div className="absolute top-8 left-8 w-2 h-2 bg-yellow-100 rounded-full opacity-60 animate-pulse" />
            <div className="absolute top-16 right-12 w-1 h-1 bg-white rounded-full opacity-80" />
            <div className="absolute top-6 right-24 w-1.5 h-1.5 bg-yellow-200 rounded-full opacity-40 animate-pulse" />
            
            {/* Distant Mountains */}
            <svg className="absolute bottom-0 w-full h-[55%] opacity-25 text-[#14233c] fill-current" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,80 L80,30 L160,70 L240,25 L320,65 L400,30 L400,100 L0,100 Z" />
            </svg>
          </div>

          {/* Layer 2: Mid Hills & Forest */}
          <div 
            className="absolute inset-0 z-1 pointer-events-none"
            style={{ 
              transform: `translate3d(${-canopyCoordinates.x * 0.1}px, ${-canopyCoordinates.y * 0.1}px, 0)`,
              transition: 'transform 0.2s ease-out'
            }}
          >
            <svg className="absolute bottom-0 w-full h-[45%] opacity-35 text-[#0a2620] fill-current" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,90 L60,50 L140,80 L220,45 L300,75 L400,40 L400,100 L0,100 Z" />
            </svg>
            {!shouldReduceMotion && (
              <div className="absolute bottom-4 left-[-10%] w-[120%] h-12 bg-white/5 blur-md rounded-full mist-slow" />
            )}
          </div>

          {/* Layer 3: Closer Canopy Layer */}
          <div 
            className="absolute inset-0 z-2 pointer-events-none flex flex-col justify-end"
            style={{ 
              transform: `translate3d(${canopyCoordinates.x * 0.2}px, ${canopyCoordinates.y * 0.2}px, 0)`,
              transition: 'transform 0.18s ease-out'
            }}
          >
            <svg className="w-full h-[30%] opacity-60 text-[#071813] fill-current" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,95 L100,75 L200,90 L300,70 L400,95 L400,100 L0,100 Z" />
            </svg>
          </div>

          {/* Layer 4: Close Hanging Vines / Canopy Branch */}
          <div 
            className="absolute inset-0 z-3 pointer-events-none"
            style={{ 
              transform: `translate3d(${canopyCoordinates.x * 0.4}px, ${canopyCoordinates.y * 0.4}px, 0)`,
              transition: 'transform 0.12s ease-out'
            }}
          >
            {/* The Main Branch Chiku sits on */}
            <svg className="absolute bottom-1 left-0 w-full h-10 text-[#1e140a] fill-current opacity-95" viewBox="0 0 400 20" preserveAspectRatio="none">
              <path d="M0,5 Q100,12 250,5 T400,12 L400,20 L0,20 Z" />
            </svg>
            
            {/* Hanging leaves/vines overlay */}
            <div className="absolute top-0 left-0 right-0 flex justify-between px-10 opacity-30">
              <Leaf className="w-8 h-8 text-emerald-800 rotate-180" />
              <Leaf className="w-10 h-10 text-emerald-950 rotate-90" />
              <Leaf className="w-6 h-6 text-green-900 rotate-45" />
            </div>
          </div>

          {/* Mist / Atmospheric Layer */}
          {!shouldReduceMotion && (
            <div className="absolute bottom-1 right-[-20%] w-[100%] h-8 bg-white/5 blur-sm rounded-full mist-fast z-4 pointer-events-none" />
          )}

          {/* Macaque Sprite (Moving opposite to cursor coordinates) */}
          <div 
            className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10"
            style={{ 
              transform: `translate3d(${canopyCoordinates.x}px, ${canopyCoordinates.y}px, 0)`,
              transition: 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
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
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/50 font-medium">Status</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${adventureActive ? "bg-accent/15 text-accent border border-accent/20" : "bg-primary/10 text-primary border border-primary/20"}`}>
                  {adventureStatus}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-border/40 pt-2 text-xs">
                <span className="text-foreground/50 font-medium">Companion Stage</span>
                <span className="font-semibold text-foreground/90 capitalize">{companionStage}</span>
              </div>

              <div className="flex justify-between items-center border-t border-border/40 pt-2 text-xs">
                <span className="text-foreground/50 font-medium">Pebbles Balance</span>
                <span className="font-bold text-warm">{pebbles} Pebbles</span>
              </div>

              {/* Energy Circular Progress Ring */}
              <div className="flex items-center gap-4 border-t border-border/40 pt-3">
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="24" 
                      cy="24" 
                      r={energyRadius} 
                      className="text-border fill-none" 
                      strokeWidth="3.5" 
                    />
                    <motion.circle 
                      cx="24" 
                      cy="24" 
                      r={energyRadius} 
                      className="text-emerald-500 fill-none"
                      strokeWidth="3.5" 
                      strokeDasharray={energyCircumference}
                      strokeDashoffset={energyStrokeDashoffset}
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: energyCircumference }}
                      animate={{ strokeDashoffset: energyStrokeDashoffset }}
                      transition={{ duration: 0.8 }}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold font-mono">
                    {companionEnergy}%
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-foreground/50 block font-semibold uppercase tracking-wider text-[9px]">Macaque Energy</span>
                  <p className="text-foreground/80 font-medium leading-normal mt-0.5">
                    {companionEnergy >= 80 
                      ? "Bursting with vitality!"
                      : companionEnergy >= 40 
                        ? "Rested. Ready to explore." 
                        : "Exhausted. Let them rest."}
                  </p>
                </div>
              </div>

              {/* Adventure Active Timer Progress Ring */}
              <div className="flex items-center gap-4 border-t border-border/40 pt-3">
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="24" 
                      cy="24" 
                      r={radius} 
                      className="text-border fill-none" 
                      strokeWidth="3.5" 
                    />
                    <motion.circle 
                      cx="24" 
                      cy="24" 
                      r={radius} 
                      className={`${adventureActive ? "text-accent" : "text-primary"} fill-none`}
                      strokeWidth="3.5" 
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-bold font-mono">
                    {activeAdventure && activeAdventure.completed && !activeAdventure.claimed 
                      ? "Done!" 
                      : adventureActive 
                        ? `${timeLeft}s` 
                        : "Idle"}
                  </span>
                </div>

                <div className="text-xs space-y-0.5 text-foreground/75 flex-1">
                  {activeAdventure && activeAdventure.completed && !activeAdventure.claimed ? (
                    <>
                      <p className={`font-semibold text-accent ${shouldReduceMotion ? "" : "animate-pulse"}`}>Adventure Complete!</p>
                      <p className="text-[11px] text-foreground/50 font-normal">Chiku found a pouch of pebbles.</p>
                    </>
                  ) : adventureActive ? (
                    <>
                      <p className="font-semibold text-accent font-medium">Exploring forest...</p>
                      <p className="text-[11px] text-foreground/50">Collecting Shola seed pods...</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-primary font-medium">Ready for Adventure</p>
                      <p className="text-[11px] text-foreground/50">Send Chiku to gather Pebbles.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            {activeAdventure && activeAdventure.completed && !activeAdventure.claimed ? (
              <button
                onClick={claimReward}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all bg-gradient-to-r from-amber-500 to-yellow-400 text-background hover:brightness-110 active:scale-[0.98] shadow-lg hover:shadow-amber-500/25 min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${shouldReduceMotion ? "" : "animate-pulse"}`}
              >
                <span>Claim Adventure Reward (+{activeAdventure.reward_pebbles} Pebbles)</span>
                <Sparkles className="w-4 h-4 fill-current text-background animate-spin" />
              </button>
            ) : (
              <button
                onClick={startAdventure}
                disabled={adventureActive}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${
                  adventureActive 
                    ? "bg-border text-foreground/30 cursor-not-allowed" 
                    : "bg-gradient-to-r from-emerald-600 to-teal-500 text-background hover:brightness-110 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
                }`}
              >
                <span>{adventureActive ? `Chiku is exploring (${timeLeft}s remaining)...` : "Send Chiku on adventure"}</span>
                {!adventureActive && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS - Compressed for Mobile Grid (2 Columns on Mobile, 4 on Desktop) */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Receipt Scanner */}
          <button 
            onClick={() => router.push("/scan")}
            aria-label="Open Receipt Scanner"
            className="group bg-surface hover:bg-surface/80 border border-border hover:border-primary/50 rounded-xl p-4 sm:p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-md hover:shadow-primary/5 flex flex-col justify-between h-36 sm:h-40 w-full text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[44px]"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <ScanLine className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-foreground/90 group-hover:text-primary transition-colors truncate">Receipt Scanner</h4>
                <p className="text-[10px] sm:text-xs text-foreground/50 mt-0.5 line-clamp-2 leading-tight">Scan transport or grocery bills to calculate footprint.</p>
              </div>
            </div>
            <div className="flex items-center text-[9px] sm:text-[10px] font-bold text-primary group-hover:underline uppercase tracking-wider">
              <span>Open Scanner</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1" />
            </div>
          </button>

          {/* 2. Log Footprint */}
          <button 
            onClick={() => router.push("/log")}
            aria-label="Open manual activity logger"
            className="group bg-surface hover:bg-surface/80 border border-border hover:border-primary/50 rounded-xl p-4 sm:p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-md hover:shadow-primary/5 flex flex-col justify-between h-36 sm:h-40 w-full text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[44px]"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-foreground/90 group-hover:text-primary transition-colors truncate">Log Footprint</h4>
                <p className="text-[10px] sm:text-xs text-foreground/50 mt-0.5 line-clamp-2 leading-tight">Manually enter a vehicle ride, flight, or diet item.</p>
              </div>
            </div>
            <div className="flex items-center text-[9px] sm:text-[10px] font-bold text-primary group-hover:underline uppercase tracking-wider">
              <span>Log Entry</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1" />
            </div>
          </button>

          {/* 3. Insights */}
          <button 
            onClick={() => router.push("/insights")}
            aria-label="Open AI coach insights and intention settings"
            className="group bg-surface hover:bg-surface/80 border border-border hover:border-primary/50 rounded-xl p-4 sm:p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-md hover:shadow-primary/5 flex flex-col justify-between h-36 sm:h-40 w-full text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[44px]"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-foreground/90 group-hover:text-primary transition-colors truncate">Insights & Path</h4>
                <p className="text-[10px] sm:text-xs text-foreground/50 mt-0.5 line-clamp-2 leading-tight">Compare your weekly averages against target trajectory.</p>
              </div>
            </div>
            <div className="flex items-center text-[9px] sm:text-[10px] font-bold text-primary group-hover:underline uppercase tracking-wider">
              <span>View Analytics</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1" />
            </div>
          </button>

          {/* 4. Budget */}
          <button 
            onClick={() => router.push("/budget")}
            aria-label="Open carbon budget envelope management"
            className="group bg-surface hover:bg-surface/80 border border-border hover:border-primary/50 rounded-xl p-4 sm:p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-md hover:shadow-primary/5 flex flex-col justify-between h-36 sm:h-40 w-full text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[44px]"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-foreground/90 group-hover:text-primary transition-colors truncate">Carbon Budget</h4>
                <p className="text-[10px] sm:text-xs text-foreground/50 mt-0.5 line-clamp-2 leading-tight">Allocate carbon envelopes and modify weekly carbon targets.</p>
              </div>
            </div>
            <div className="flex items-center text-[9px] sm:text-[10px] font-bold text-primary group-hover:underline uppercase tracking-wider">
              <span>Manage Budget</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1" />
            </div>
          </button>

        </div>
      </section>
    </div>
  );
}
