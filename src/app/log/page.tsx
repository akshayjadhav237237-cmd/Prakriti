"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  dbService, 
  DailyLog, 
  getWeekString, 
  WeeklyBudget 
} from "@/core/supabase";
import { 
  calculateTransportFootprint,
  calculateMealFootprint,
  calculateElectricityFootprint,
  calculateCustomFootprint
} from "@/core/calculators";
import { 
  TRANSPORT_EMISSION_FACTORS, 
  TransportMode,
  MEAL_EMISSION_FACTORS,
  MealType
} from "@/core/constants";
import { 
  Bus, 
  Utensils, 
  Zap, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Flame 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

type ActiveTab = "transport" | "food" | "energy" | "lifestyle";

export default function LogActivityPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("transport");
  
  // Weekly budget and current spent state to display envelope impact
  const [budget, setBudget] = useState<WeeklyBudget | null>(null);
  const [spent, setSpent] = useState<Record<string, number>>({
    transport: 0,
    food: 0,
    energy: 0,
    lifestyle: 0
  });

  // Common Form States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successLog, setSuccessLog] = useState<{
    activity: string;
    co2e: number;
    envelope: string;
    remaining: number;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- TRANSPORT STATE ---
  const [transportMode, setTransportMode] = useState<TransportMode>("petrol_scooter");
  const [transportDistance, setTransportDistance] = useState<number>(10);

  // --- FOOD STATE ---
  const [foodMeal, setFoodMeal] = useState<MealType>("veg_thali");
  const [foodDelivery, setFoodDelivery] = useState<boolean>(false);
  const [diwaliMode, setDiwaliMode] = useState<boolean>(false);

  // --- ENERGY STATE ---
  const [acHours, setAcHours] = useState<number>(0);
  const [acStarRating, setAcStarRating] = useState<number>(3);
  const [dgSetToggle, setDgSetToggle] = useState<boolean>(false);
  const [gridElectricityUnits, setGridElectricityUnits] = useState<number>(0);

  // --- LIFESTYLE STATE ---
  type LifestyleItem = "swiggy" | "clothing" | "shopping" | "flight" | "road_trip";
  const [selectedLifestyle, setSelectedLifestyle] = useState<LifestyleItem>("swiggy");

  const lifestyleItems = {
    swiggy: { name: "Swiggy Order", co2e: 10.0, desc: "Packaging, logistics & cooking footprint" },
    clothing: { name: "New Clothing / Apparel", co2e: 5.0, desc: "Cotton production & retail logistics" },
    shopping: { name: "General Shopping Spree", co2e: 8.0, desc: "Consumer goods manufacturing footprint" },
    flight: { name: "Domestic Flight (One-way)", co2e: 89.0, desc: "Aviation fuel burning per passenger" },
    road_trip: { name: "Weekend Petrol Road Trip", co2e: 15.0, desc: "Long distance highway tailpipe emissions" }
  };

  // Load User, Budget & Spent stats for impact preview
  const loadStats = async (uid: string) => {
    const week = getWeekString();
    
    // Load budget
    const userBudget = await dbService.getWeeklyBudget(uid, week);
    setBudget(userBudget);

    // Load logs to calculate spent
    const logs = await dbService.getDailyLogs();
    const newSpent = { transport: 0, food: 0, energy: 0, lifestyle: 0 };
    logs.forEach((log) => {
      const logDate = new Date(log.created_at);
      if (getWeekString(logDate) === week) {
        if (log.envelope in newSpent) {
          newSpent[log.envelope as keyof typeof newSpent] += log.co2_kg;
        }
      }
    });

    Object.keys(newSpent).forEach((key) => {
      const k = key as keyof typeof newSpent;
      newSpent[k] = Number(newSpent[k].toFixed(2));
    });
    setSpent(newSpent);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUid = localStorage.getItem("prakriti_user_id");
      if (storedUid) {
        setUserId(storedUid);
        loadStats(storedUid);
      } else {
        const demoUid = "arjun_mumbai";
        setUserId(demoUid);
        loadStats(demoUid);
      }
    }
  }, []);

  // Real-time Calculators
  const getCalculatedCO2 = (): number => {
    switch (activeTab) {
      case "transport": {
        const result = calculateTransportFootprint({
          distanceKm: transportDistance,
          mode: transportMode
        });
        return result.co2eKg;
      }
      case "food": {
        let result = calculateMealFootprint({
          mealType: foodMeal,
          hasDelivery: foodDelivery
        }).co2eKg;
        if (diwaliMode) {
          result = result * 1.15; // Diwali mode modifier (+15% carbon)
        }
        return Number(result.toFixed(3));
      }
      case "energy": {
        const kwRating = 1.6 - (0.15 * acStarRating);
        const acKwh = acHours * kwRating;
        const acCo2 = calculateElectricityFootprint({ consumptionKwh: acKwh }).co2eKg;
        const dgCo2 = dgSetToggle ? acHours * 0.5 * 2.7 : 0;
        const gridCo2 = calculateElectricityFootprint({ consumptionKwh: gridElectricityUnits }).co2eKg;
        return Number((acCo2 + dgCo2 + gridCo2).toFixed(3));
      }
      case "lifestyle": {
        const weight = lifestyleItems[selectedLifestyle].co2e;
        return calculateCustomFootprint({ customCo2eKg: weight }).co2eKg;
      }
      default:
        return 0;
    }
  };

  const currentFootprint = getCalculatedCO2();
  const isConfettiActive = currentFootprint > 0 && currentFootprint < 2.0;

  const getActivityName = (): string => {
    switch (activeTab) {
      case "transport":
        const modeLabels: Record<TransportMode, string> = {
          petrol_scooter: "Petrol Scooter Ride",
          electric_scooter: "Electric Scooter Ride",
          cab: "Ola/Uber Cab Ride",
          mumbai_local: "Mumbai Local Train Transit",
          delhi_metro: "Delhi Metro Transit",
          cng_auto: "CNG Auto Ride",
          walk_cycle: "Walk / Cycle"
        };
        return `${modeLabels[transportMode]} (${transportDistance} km)`;
      case "food":
        const mealLabels: Record<MealType, string> = {
          mutton_biryani: "Mutton Biryani Meal",
          chicken: "Chicken Meal",
          veg_thali: "Veg Thali Meal",
          vegan_bowl: "Vegan Salad Bowl"
        };
        const deliverySuffix = foodDelivery ? " (Swiggy Delivery)" : "";
        const diwaliSuffix = diwaliMode ? " 🪔 (Diwali Treat)" : "";
        return `${mealLabels[foodMeal]}${deliverySuffix}${diwaliSuffix}`;
      case "energy":
        let energyParts = [];
        if (acHours > 0) {
          energyParts.push(`AC Cooling (${acHours} hrs, ${acStarRating}★)`);
        }
        if (dgSetToggle && acHours > 0) {
          energyParts.push("Diesel Generator Power");
        }
        if (gridElectricityUnits > 0) {
          energyParts.push(`Grid Electricity (${gridElectricityUnits} units)`);
        }
        return energyParts.length > 0 ? energyParts.join(" + ") : "Electricity/Cooling usage";
      case "lifestyle":
        return lifestyleItems[selectedLifestyle].name;
      default:
        return "Manual Carbon Log";
    }
  };

  const handleLogActivity = async () => {
    if (!userId) return;
    setIsSubmitting(true);

    const co2e = currentFootprint;
    const envelope = activeTab;
    const activityName = getActivityName();
    
    const log: DailyLog = {
      id: Math.random().toString(36).substring(2, 9),
      user_id: userId,
      created_at: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
      envelope: envelope as "transport" | "food" | "energy" | "lifestyle",
      activity: activityName,
      co2_kg: co2e,
      source: "manual"
    };

    try {
      await dbService.addDailyLog(log);

      if (isConfettiActive) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#4ade80", "#86efac", "#fbbf24", "#60a5fa", "#f472b6"]
        });
      }

      await loadStats(userId);
      const envelopeBudget = budget ? (budget[envelope as keyof WeeklyBudget] as number | undefined) ?? 0 : 0;
      const currentSpent = (spent[envelope] ?? 0) + co2e;
      const remaining = Number((envelopeBudget - currentSpent).toFixed(2));

      setSuccessLog({
        activity: activityName,
        co2e: co2e,
        envelope: envelope.toUpperCase(),
        remaining
      });
      
      showToast("Activity logged successfully! 🌿");
    } catch (err) {
      showToast("Failed to log activity. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetForm = () => {
    setSuccessLog(null);
    setTransportDistance(10);
    setFoodDelivery(false);
    setDiwaliMode(false);
    setAcHours(0);
    setGridElectricityUnits(0);
    setDgSetToggle(false);
  };

  const envelopeLabels: Record<ActiveTab, string> = {
    transport: "Transport",
    food: "Food & Meals",
    energy: "Energy & Cooling",
    lifestyle: "Lifestyle & Shopping"
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
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Splash Screen Overlay */}
        <AnimatePresence>
          {successLog && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <div className="w-[90vw] max-w-md bg-surface border border-primary/30 rounded-2xl p-6 md:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-emerald-400"></div>
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-accent uppercase tracking-widest">Activity Logged</span>
                  <h2 className="text-2xl font-extrabold text-foreground">{successLog.activity}</h2>
                  <div className="flex items-center justify-center space-x-2 mt-1">
                    <span className="text-xl font-bold text-warm">{successLog.co2e} kg CO₂e</span>
                    <span className="text-xs text-foreground/40">added to {successLog.envelope.toUpperCase()}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                  <span className="text-xs text-foreground/50 font-medium">Envelope Budget Impact</span>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Weekly Envelope:</span>
                    <span className="font-bold text-foreground">{successLog.envelope.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border/40 pt-2">
                    <span className="text-foreground/60">Budget Remaining:</span>
                    <span className={`font-bold ${successLog.remaining >= 0 ? "text-primary" : "text-red-400"}`}>
                      {successLog.remaining} kg CO₂e
                    </span>
                  </div>
                  {successLog.remaining < 0 && (
                    <p className="text-[10px] text-warm text-left mt-2 flex items-start space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>This envelope is now overspent! Use the Envelope page to shift carbon from Lifestyle.</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleResetForm}
                    className="btn-secondary flex-1 py-3 px-4 text-sm font-bold text-foreground"
                  >
                    Log Another
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="btn-primary flex-1 py-3 px-4 text-sm"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary via-accent to-green-300 bg-clip-text text-transparent tracking-tight">
            Log Activity
          </h1>
          <p className="text-foreground/60 mt-1">
            Manually enter your daily carbon choices to deduct from your budget envelopes.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tab Navigation (Horizontally scrollable tab bar) */}
            <div className="flex bg-surface border border-border rounded-xl p-1 gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide w-full">
              {(["transport", "food", "energy", "lifestyle"] as ActiveTab[]).map((tab) => {
                const Icon = tab === "transport" ? Bus 
                             : tab === "food" ? Utensils 
                             : tab === "energy" ? Zap 
                             : Sparkles;
                const active = activeTab === tab;
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 shrink-0 min-w-[85px] py-3 rounded-lg flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all whitespace-nowrap ${
                      active 
                        ? "bg-primary text-background font-extrabold" 
                        : "text-foreground/60 hover:text-white hover:bg-border/20"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs sm:text-sm capitalize font-semibold">{tab}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Panels */}
            <div className="modern-card p-6 min-h-[350px] flex flex-col justify-between bg-surface">
              <div>
                {/* 1. TRANSPORT TAB */}
                {activeTab === "transport" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white">Transport Details</h3>
                    
                    {/* Mode Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground/50">Select Transit Mode</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {(Object.keys(TRANSPORT_EMISSION_FACTORS) as TransportMode[]).map((mode) => {
                          const isSelected = transportMode === mode;
                          const labels: Record<TransportMode, string> = {
                            petrol_scooter: "Petrol Scooter",
                            electric_scooter: "Electric Scooter",
                            cab: "Cab (Ola/Uber)",
                            mumbai_local: "Mumbai Local",
                            delhi_metro: "Delhi Metro",
                            cng_auto: "CNG Auto",
                            walk_cycle: "Walk / Cycle"
                          };
                          
                          return (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setTransportMode(mode)}
                              className={`p-3 rounded-xl border text-xs text-center font-bold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                                isSelected 
                                  ? "border-primary bg-primary/10 text-primary" 
                                  : "border-border bg-background hover:bg-border/10 text-foreground/70"
                              }`}
                            >
                              <span className="truncate w-full">{labels[mode]}</span>
                              <span className="text-[10px] text-foreground/40 font-normal">
                                {TRANSPORT_EMISSION_FACTORS[mode]} kg/km
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Distance Slider (Full width) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground/50">Distance Traveled</label>
                        <span className="text-sm font-bold text-white">{transportDistance} km</span>
                      </div>
                      <div className="space-y-1">
                        <input
                          type="range"
                          min="1"
                          max="150"
                          value={transportDistance}
                          onChange={(e) => setTransportDistance(parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                        />
                        <div className="flex justify-between text-[10px] text-foreground/40 font-mono">
                          <span>1 km</span>
                          <span>150 km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. FOOD TAB */}
                {activeTab === "food" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white">Meal Details</h3>
                    
                    {/* Meal Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground/50">Select Your Meal</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(Object.keys(MEAL_EMISSION_FACTORS) as MealType[]).map((meal) => {
                          const isSelected = foodMeal === meal;
                          const labels: Record<MealType, string> = {
                            mutton_biryani: "Mutton Biryani",
                            chicken: "Chicken Meal",
                            veg_thali: "Veg Thali",
                            vegan_bowl: "Vegan Bowl"
                          };
                          
                          return (
                            <button
                              key={meal}
                              type="button"
                              onClick={() => setFoodMeal(meal)}
                              className={`p-4 rounded-xl border text-sm text-center font-bold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                                isSelected 
                                  ? "border-primary bg-primary/10 text-primary" 
                                  : "border-border bg-background hover:bg-border/10 text-foreground/70"
                              }`}
                            >
                              <span>{labels[meal]}</span>
                              <span className="text-[11px] text-foreground/40 font-normal">
                                Base: {MEAL_EMISSION_FACTORS[meal]} kg CO₂e
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delivery & Diwali Toggles */}
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border cursor-pointer hover:bg-border/10 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">Ordered via Swiggy / Zomato</span>
                          <span className="text-xs text-foreground/40 mt-0.5">Adds +0.18 kg CO₂e for packaging & delivery rider transport</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={foodDelivery}
                          onChange={(e) => setFoodDelivery(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary bg-border border-border cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-warm/5 to-orange-500/5 border border-warm/30 cursor-pointer hover:from-warm/10 hover:to-orange-500/10 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-warm flex items-center space-x-1.5">
                            <Flame className="w-4 h-4 text-orange-500 animate-pulse fill-current" />
                            <span>🪔 Diwali / Festive Mode</span>
                          </span>
                          <span className="text-xs text-foreground/50 mt-0.5">Adds +15% carbon for festive cooking, ghee & celebrations</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={diwaliMode}
                          onChange={(e) => setDiwaliMode(e.target.checked)}
                          className="w-4 h-4 rounded text-warm focus:ring-warm bg-border border-border cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* 3. ENERGY TAB */}
                {activeTab === "energy" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white">Energy & AC Details</h3>
                    
                    {/* AC Usage Hours (Full width) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground/50">Air Conditioner Run Time</label>
                        <span className="text-sm font-bold text-white">{acHours} hours</span>
                      </div>
                      <div className="space-y-1">
                        <input
                          type="range"
                          min="0"
                          max="24"
                          value={acHours}
                          onChange={(e) => setAcHours(parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                        />
                        <div className="flex justify-between text-[10px] text-foreground/40 font-mono">
                          <span>0h</span>
                          <span>24h</span>
                        </div>
                      </div>
                    </div>

                    {/* AC Star Rating */}
                    <div className={`space-y-2 transition-all ${acHours === 0 ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                      <label className="text-xs font-semibold text-foreground/50 block">AC Efficiency Star Rating</label>
                      <div className="flex items-center space-x-2 bg-background border border-border p-2.5 rounded-xl w-fit">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isActive = acStarRating >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setAcStarRating(star)}
                              className={`p-1 hover:scale-110 transition-transform ${
                                isActive ? "text-warm" : "text-foreground/20"
                              }`}
                            >
                              <Star className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} />
                            </button>
                          );
                        })}
                        <span className="text-xs font-bold text-foreground/60 ml-2">
                          ({acStarRating} Star AC)
                        </span>
                      </div>
                      <p className="text-[10px] text-foreground/40">
                        Higher star ratings reduce the calculated energy consumption.
                      </p>
                    </div>

                    {/* DG Set diesel backup */}
                    <div className={`transition-all ${acHours === 0 ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                      <label className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border cursor-pointer hover:bg-border/10 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">Power Cut: Running on DG Backup</span>
                          <span className="text-xs text-foreground/40 mt-0.5">Adds generator emissions (+1.35 kg CO₂e / hr)</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={dgSetToggle}
                          onChange={(e) => setDgSetToggle(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary bg-border border-border cursor-pointer"
                        />
                      </label>
                    </div>

                    {/* General electricity consumption input (Full width) */}
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-foreground/50">Add General Grid Electricity Units</label>
                          <span className="text-[10px] text-foreground/40">From electric meter / bill (0.71 kg per unit)</span>
                        </div>
                        <span className="text-sm font-bold text-white">{gridElectricityUnits} kWh</span>
                      </div>
                      <div className="space-y-1">
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={gridElectricityUnits}
                          onChange={(e) => setGridElectricityUnits(parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                        />
                        <div className="flex justify-between text-[10px] text-foreground/40 font-mono">
                          <span>0</span>
                          <span>50</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. LIFESTYLE TAB */}
                {activeTab === "lifestyle" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white">Lifestyle & Consumption</h3>
                    
                    {/* Lifestyle Grid */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground/50">Select Quick Log Item</label>
                      <div className="space-y-2.5">
                        {(Object.keys(lifestyleItems) as LifestyleItem[]).map((key) => {
                          const item = lifestyleItems[key];
                          const isSelected = selectedLifestyle === key;
                          
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSelectedLifestyle(key)}
                              className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                                isSelected 
                                  ? "border-primary bg-primary/10" 
                                  : "border-border bg-background hover:bg-border/10"
                              }`}
                            >
                              <div className="space-y-0.5">
                                <span className={`text-sm font-bold ${isSelected ? "text-primary" : "text-white"}`}>
                                  {item.name}
                                </span>
                                <span className="block text-xs text-foreground/40 font-normal">
                                  {item.desc}
                                </span>
                              </div>
                              <span className={`text-base font-extrabold ${isSelected ? "text-primary" : "text-white"}`}>
                                +{item.co2e} kg
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Log Button */}
              <div className="pt-6 border-t border-border/40 mt-6">
                <button
                  type="button"
                  onClick={handleLogActivity}
                  disabled={isSubmitting || currentFootprint === 0}
                  className="btn-primary w-full py-4 px-6 flex items-center justify-center space-x-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Log Activity</span>
                </button>
              </div>
            </div>
          </div>

          {/* Calculator Info / Preview Side */}
          <div className="space-y-6">
            
            {/* Realtime Carbon Gauge */}
            <div className="modern-card p-6 text-center space-y-4 relative overflow-hidden bg-surface">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>
              
              <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest block">
                Calculated Footprint
              </span>

              <div className="py-4 font-mono">
                <div className="text-5xl font-black text-white tracking-tight flex items-center justify-center space-x-1">
                  <span>{currentFootprint}</span>
                </div>
                <span className="text-xs text-foreground/40 font-semibold uppercase block mt-1">
                  Kilograms CO₂e
                </span>
              </div>

              {/* Confetti Indicator */}
              <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isConfettiActive 
                  ? "bg-primary/10 border-primary/30 text-primary animate-pulse" 
                  : "bg-background border-border text-foreground/40"
              }`}>
                <span>🎉</span>
                <span>{isConfettiActive ? "Confetti Active (Under 2kg!)" : "Confetti Locked (≥2kg)"}</span>
              </div>

              <div className="h-px bg-border my-2"></div>

              {/* Realtime impact preview on current envelope */}
              {budget && (
                (() => {
                  const envBudget = (budget[activeTab] as number | undefined) ?? 0;
                  const currentSpent = spent[activeTab] ?? 0;
                  const remaining = envBudget - (currentSpent + currentFootprint);
                  return (
                    <div className="text-left space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground/50 font-medium">Target Envelope:</span>
                        <span className="font-bold text-white capitalize">{envelopeLabels[activeTab]}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground/50 font-medium">Weekly Budget:</span>
                        <span className="font-bold text-foreground/80 font-mono">{envBudget} kg</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground/50 font-medium">Weekly Spent:</span>
                        <span className="font-bold text-foreground/80 font-mono">{currentSpent} kg</span>
                      </div>
                      
                      <div className="border-t border-border/40 pt-2 flex items-center justify-between text-xs">
                        <span className="text-foreground/50 font-medium">Remaining after log:</span>
                        <span className={`font-bold font-mono ${remaining >= 0 ? "text-primary" : "text-red-400"}`}>
                          {remaining.toFixed(2)} kg
                        </span>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Quick Context Tips */}
            <div className="modern-card bg-surface/50 p-5 space-y-3 text-xs text-foreground/60">
              <div className="flex items-center space-x-2 text-white font-bold mb-1">
                <Info className="w-4 h-4 text-accent animate-pulse" />
                <span>Prakriti Logger Guide</span>
              </div>
              <p>
                - Low-carbon transits (like Mumbai Local or Delhi Metro) consume extremely little carbon per passenger-km compared to single cabs.
              </p>
              <p>
                - Food options default to standard Indian portions. Ordering via Swiggy adds a plastic and fuel penalty of 0.18 kg.
              </p>
              <p>
                - Air conditioning calculations dynamically check Star Ratings. 5-star ACs consume ~40% less electricity than 1-star ACs.
              </p>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
