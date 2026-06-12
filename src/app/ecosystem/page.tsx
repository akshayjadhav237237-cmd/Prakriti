"use client";

import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Unlock, 
  Clock, 
  Sparkles, 
  Coins, 
  Compass, 
  ChevronRight, 
  Settings, 
  AlertTriangle, 
  RotateCcw, 
  Shield, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle, 
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { dbService, User, Adventure } from "@/core/supabase";

interface Species {
  id: string;
  name: string;
  scientificName: string;
  status: "Endangered" | "Critically Endangered" | "Vulnerable";
  statusColor: string;
  requiredBudgets: number;
  habitat: string;
  description: string;
  funFact: string;
  diet: string;
  renderSvg: (isLocked: boolean) => React.ReactNode;
}

export default function EcosystemSanctuary() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeAdventure, setActiveAdventure] = useState<Adventure | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showRewardCard, setShowRewardCard] = useState<boolean>(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [devOpen, setDevOpen] = useState<boolean>(false);
  const [energy, setEnergy] = useState<number>(100);
  const [macaqueInteracted, setMacaqueInteracted] = useState<boolean>(false);

  // Parallax Scroll State & Mouse Position State
  const [scrollY, setScrollY] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    loadDbData();
    
    // Add Scroll Listener
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Add Mouse Move Listener
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const loadDbData = async () => {
    const userData = await dbService.getUser();
    setUser(userData);

    const advList = await dbService.getAdventures();
    const active = advList.find(adv => !adv.claimed);
    if (active) {
      setActiveAdventure(active);
      if (active.completed && !active.claimed) {
        setTimeLeft(0);
        setShowRewardCard(true);
        setEnergy(0);
      } else {
        const returnsTime = new Date(active.returns_at).getTime();
        const diff = Math.max(0, Math.floor((returnsTime - Date.now()) / 1000));
        setTimeLeft(diff);
        setEnergy(Math.round((1 - diff / 21600) * 100)); 
      }
    } else {
      setActiveAdventure(null);
      setTimeLeft(0);
      setShowRewardCard(false);
      setEnergy(100);
    }
  };

  useEffect(() => {
    if (!activeAdventure || activeAdventure.claimed) return;

    const tick = async () => {
      const returnsTime = new Date(activeAdventure.returns_at).getTime();
      const diff = Math.max(0, Math.floor((returnsTime - Date.now()) / 1000));
      setTimeLeft(diff);
      
      const totalDuration = 21600; 
      const elapsed = totalDuration - diff;
      setEnergy(Math.min(99, Math.round((elapsed / totalDuration) * 100)));

      if (diff === 0) {
        if (!activeAdventure.completed) {
          const completed = await dbService.completeAdventure(activeAdventure.id);
          if (completed) {
            setActiveAdventure(completed);
            setShowRewardCard(true);
            setEnergy(100);
          }
        } else {
          setShowRewardCard(true);
          setEnergy(100);
        }
        clearInterval(timer);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeAdventure]);

  const handleStartAdventure = async () => {
    if (!user || activeAdventure) return;

    const durationMs = 6 * 60 * 60 * 1000; 
    const startedAt = new Date().toISOString();
    const returnsAt = new Date(Date.now() + durationMs).toISOString();
    const reward = 50;

    const newAdv = await dbService.startAdventure(user.id, startedAt, returnsAt, reward);
    setActiveAdventure(newAdv);
    setTimeLeft(21600); 
    setEnergy(0);
  };

  const handleClaimReward = async () => {
    if (!activeAdventure) return;

    const result = await dbService.claimAdventureReward(activeAdventure.id);
    if (result) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#8b5cf6", "#fbbf24", "#3b82f6"]
      });

      setUser(result.updatedUser);
      setActiveAdventure(null);
      setShowRewardCard(false);
      setTimeLeft(0);
      setEnergy(100);
    }
  };

  const handleSimulateSpeedup = async () => {
    if (!activeAdventure) return;
    const fastForwardTime = new Date(Date.now() + 5000).toISOString();
    const updated = {
      ...activeAdventure,
      returns_at: fastForwardTime,
      returnsAt: fastForwardTime
    };
    
    if (typeof window !== "undefined") {
      const localAdvs = JSON.parse(localStorage.getItem("prakriti_adventures") || "[]");
      const idx = localAdvs.findIndex((adv: Adventure) => adv.id === activeAdventure.id);
      if (idx >= 0) {
        localAdvs[idx].returns_at = fastForwardTime;
        localAdvs[idx].returnsAt = fastForwardTime;
        localStorage.setItem("prakriti_adventures", JSON.stringify(localAdvs));
      }
    }

    setActiveAdventure(updated);
  };

  const handleSimulateInstant = async () => {
    if (!activeAdventure) return;
    const completedTime = new Date(Date.now() - 1000).toISOString();
    const updated = {
      ...activeAdventure,
      returns_at: completedTime,
      returnsAt: completedTime,
      completed: true
    };

    if (typeof window !== "undefined") {
      const localAdvs = JSON.parse(localStorage.getItem("prakriti_adventures") || "[]");
      const idx = localAdvs.findIndex((adv: Adventure) => adv.id === activeAdventure.id);
      if (idx >= 0) {
        localAdvs[idx].returns_at = completedTime;
        localAdvs[idx].returnsAt = completedTime;
        localAdvs[idx].completed = true;
        localStorage.setItem("prakriti_adventures", JSON.stringify(localAdvs));
      }
    }

    setActiveAdventure(updated);
    setTimeLeft(0);
    setShowRewardCard(true);
    setEnergy(100);
  };

  const handleDevSetBudgets = async (count: number) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      weeklyBudgetsCompleted: Math.max(0, count)
    };
    const saved = await dbService.saveUser(updatedUser);
    setUser(saved);
  };

  const handleDevSetPebbles = async (count: number) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      pebbles: Math.max(0, count)
    };
    const saved = await dbService.saveUser(updatedUser);
    setUser(saved);
  };

  const handleDevReset = async () => {
    const defaultUser = await dbService.resetDemoData();
    setUser(defaultUser);
    setActiveAdventure(null);
    setShowRewardCard(false);
    setTimeLeft(0);
    setEnergy(100);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
          <p className="text-sm font-medium uppercase tracking-widest">Loading Western Ghats Ecosystem...</p>
        </div>
      </div>
    );
  }

  const budgetsCompleted = user?.weeklyBudgetsCompleted || 0;

  const speciesList: Species[] = [
    {
      id: "macaque",
      name: "Lion-Tailed Macaque",
      scientificName: "Macaca silenus",
      status: "Endangered",
      statusColor: "bg-red-500 text-white",
      requiredBudgets: 0,
      habitat: "Rainforest Canopy",
      diet: "Fruits, seeds, and insects",
      description: "One of the rarest and most threatened primates. Highly tree-dwelling, they spend almost their entire lives in the upper layers of evergreen rainforests. They have a striking silver mane and a tufted tail.",
      funFact: "They use up to 17 different vocal calls to communicate through the thick jungle canopy.",
      renderSvg: (isLocked: boolean) => (
        <svg viewBox="0 0 100 100" className={`w-full h-full ${isLocked ? "grayscale contrast-200 brightness-0 opacity-20" : ""}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="macaqueGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#475569" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#macaqueGlow)" />
          <path d="M40,75 C40,50 45,38 50,38 C55,38 60,50 60,75 Z" fill="#111827" />
          <path d="M30,30 C20,18 25,8 40,5 C45,-2 55,-2 60,5 C75,8 80,18 70,30 C75,45 65,55 50,55 C35,55 25,45 30,30 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" />
          <path d="M38,30 C38,18 45,15 50,15 C55,15 62,18 62,30 C62,42 55,46 50,46 C45,46 38,42 38,30 Z" fill="#0f172a" />
          <circle cx="46" cy="27" r="2.5" fill="#f59e0b" />
          <circle cx="46" cy="27" r="1" fill="#000" />
          <circle cx="54" cy="27" r="2.5" fill="#f59e0b" />
          <circle cx="54" cy="27" r="1" fill="#000" />
          <circle cx="42" cy="34" r="2" fill="#f43f5e" opacity="0.4" />
          <circle cx="58" cy="34" r="2" fill="#f43f5e" opacity="0.4" />
          <path d="M40,70 C28,70 20,60 22,50" stroke="#111827" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="22" cy="50" r="4" fill="#f1f5f9" />
          <path d="M47,35 C47,32 53,32 53,35 C53,38 50,40 50,40 C50,40 47,38 47,35 Z" fill="#1e293b" />
        </svg>
      )
    },
    {
      id: "tahr",
      name: "Nilgiri Tahr",
      scientificName: "Nilgiritragus hylocrius",
      status: "Endangered",
      statusColor: "bg-red-500 text-white",
      requiredBudgets: 5,
      habitat: "Montane Grasslands",
      diet: "Grasses and herbs",
      description: "A stocky mountain goat endemic to the high-altitude cliffs and shola-grassland ecosystems. Renowned for their incredible climbing skills on sheer rock faces.",
      funFact: "Adult males develop a distinct light grey 'saddleback' patch on their backs as they mature.",
      renderSvg: (isLocked: boolean) => (
        <svg viewBox="0 0 100 100" className={`w-full h-full ${isLocked ? "grayscale contrast-200 brightness-0 opacity-20" : ""}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="tahrGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#78350f" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#tahrGlow)" />
          <path d="M10,80 L45,65 L90,80 L90,95 L10,95 Z" fill="#475569" />
          <ellipse cx="48" cy="52" rx="16" ry="10" fill="#78350f" />
          {!isLocked && <ellipse cx="48" cy="48" rx="8" ry="4" fill="#d1d5db" opacity="0.6" />}
          <rect x="36" y="52" width="3.5" height="18" fill="#451a03" />
          <rect x="42" y="52" width="3.5" height="18" fill="#78350f" />
          <rect x="52" y="52" width="3.5" height="18" fill="#451a03" />
          <rect x="58" y="52" width="3.5" height="18" fill="#78350f" />
          <path d="M56,52 L66,35 L72,38 L62,56 Z" fill="#78350f" />
          <circle cx="68" cy="35" r="6.5" fill="#78350f" />
          <path d="M68,32 L76,35 L72,40 Z" fill="#78350f" />
          <path d="M65,30 C62,20 54,16 49,18 C54,22 59,26 62,32" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="70" cy="34" r="1" fill="#fbbf24" />
        </svg>
      )
    },
    {
      id: "frog",
      name: "Purple Frog",
      scientificName: "Nasikabatrachus sahyadrensis",
      status: "Endangered",
      statusColor: "bg-purple-600 text-white",
      requiredBudgets: 15,
      habitat: "Underground Burrows",
      diet: "Subterranean Termites",
      description: "A bizarre, bloated purple frog with a small head and a pointed snout. Spends nearly the entire year up to 26 feet underground, surfacing only for two weeks during the monsoon to breed.",
      funFact: "Discovered in 2003, it is considered a 'living fossil' that diverged from other frogs 120 million years ago.",
      renderSvg: (isLocked: boolean) => (
        <svg viewBox="0 0 100 100" className={`w-full h-full ${isLocked ? "grayscale contrast-200 brightness-0 opacity-20" : ""}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="frogGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#frogGlow)" />
          <path d="M15,82 C35,76 65,88 85,82 L85,92 L15,92 Z" fill="#451a03" />
          <circle cx="50" cy="58" r="20" fill="#701a75" />
          <ellipse cx="30" cy="67" rx="8" ry="4.5" fill="#4a044e" />
          <ellipse cx="70" cy="67" rx="8" ry="4.5" fill="#4a044e" />
          <ellipse cx="33" cy="51" rx="6" ry="3.5" fill="#4a044e" transform="rotate(-15 33 51)" />
          <ellipse cx="67" cy="51" rx="6" ry="3.5" fill="#4a044e" transform="rotate(15 67 51)" />
          <path d="M50,33 L37,47 C37,47 44,52 50,52 C56,52 63,47 63,47 Z" fill="#701a75" />
          <circle cx="50" cy="33" r="1.8" fill="#f472b6" />
          <circle cx="44" cy="42" r="1.2" fill="#fbbf24" />
          <circle cx="56" cy="42" r="1.2" fill="#fbbf24" />
          {!isLocked && (
            <>
              <circle cx="45" cy="54" r="1.5" fill="#c084fc" opacity="0.6" />
              <circle cx="55" cy="55" r="2" fill="#c084fc" opacity="0.6" />
              <circle cx="48" cy="66" r="1.5" fill="#c084fc" opacity="0.6" />
              <circle cx="52" cy="62" r="1.2" fill="#c084fc" opacity="0.6" />
            </>
          )}
        </svg>
      )
    },
    {
      id: "civet",
      name: "Malabar Civet",
      scientificName: "Viverra civettina",
      status: "Critically Endangered",
      statusColor: "bg-red-700 text-white font-bold",
      requiredBudgets: 25,
      habitat: "Forest Understory",
      diet: "Small rodents, reptiles, and eggs",
      description: "One of the rarest mammals on Earth. It is nocturnal, highly secretive, and distinguished by dark spots on a grey coat, a dark stripe down the back, and a bushy ringed tail.",
      funFact: "Thought to be extinct until rediscovered in 1987. Today, fewer than 250 mature individuals are estimated to survive.",
      renderSvg: (isLocked: boolean) => (
        <svg viewBox="0 0 100 100" className={`w-full h-full ${isLocked ? "grayscale contrast-200 brightness-0 opacity-20" : ""}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="civetGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#475569" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#civetGlow)" />
          <path d="M15,85 C40,78 65,92 85,82 L85,92 L15,92 Z" fill="#064e3b" />
          <ellipse cx="46" cy="60" rx="18" ry="9" fill="#475569" />
          <rect x="33" y="62" width="3" height="13" fill="#1e293b" />
          <rect x="38" y="62" width="3" height="13" fill="#475569" />
          <rect x="50" y="62" width="3" height="13" fill="#1e293b" />
          <rect x="55" y="62" width="3" height="13" fill="#475569" />
          <path d="M55,60 L65,49 L70,52 L61,64 Z" fill="#475569" />
          <circle cx="67" cy="47" r="6" fill="#475569" />
          <path d="M67,47 L74,47 L71,51 Z" fill="#1e293b" />
          <path d="M63,44 L65,37 L68,42 Z" fill="#475569" />
          <circle cx="69" cy="46" r="0.9" fill="#22c55e" />
          <path d="M28,60 C18,60 14,50 12,56 C10,62 16,66 28,63" fill="#475569" />
          {!isLocked && (
            <>
              <circle cx="37" cy="57" r="1.5" fill="#0f172a" />
              <circle cx="44" cy="55" r="2" fill="#0f172a" />
              <circle cx="51" cy="58" r="1.5" fill="#0f172a" />
              <circle cx="42" cy="62" r="1.5" fill="#0f172a" />
              <path d="M20,59 Q17,56 16,58" stroke="#0f172a" strokeWidth="2" fill="none" />
              <path d="M15,56 Q12,53 12,55" stroke="#f8fafc" strokeWidth="2" fill="none" />
            </>
          )}
        </svg>
      )
    }
  ];

  let nextSpecies: Species | null = null;
  let targetBudgets = 0;
  let percentageToUnlock = 100;

  const lockedSpecies = speciesList.filter(s => budgetsCompleted < s.requiredBudgets);
  if (lockedSpecies.length > 0) {
    const sorted = [...lockedSpecies].sort((a, b) => a.requiredBudgets - b.requiredBudgets);
    nextSpecies = sorted[0];
    targetBudgets = nextSpecies.requiredBudgets;
    
    const unlockedSpecies = speciesList.filter(s => budgetsCompleted >= s.requiredBudgets);
    const lastTarget = unlockedSpecies.length > 0 ? Math.max(...unlockedSpecies.map(s => s.requiredBudgets)) : 0;
    
    const range = targetBudgets - lastTarget;
    const currentInRange = budgetsCompleted - lastTarget;
    percentageToUnlock = Math.min(100, Math.max(0, (currentInRange / range) * 100));
  } else {
    nextSpecies = null;
    targetBudgets = 25;
    percentageToUnlock = 100;
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = activeAdventure 
    ? circumference * (timeLeft / 21600) 
    : circumference;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans scroll-smooth relative">
      <style>{`
        @keyframes macaque-breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.02) translateY(-2px); }
        }
        @keyframes macaque-tail {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(6deg); }
        }
        @keyframes macaque-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.1); }
        }
        .macaque-body {
          animation: macaque-breathe 4.5s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .macaque-tail {
          animation: macaque-tail 3.5s ease-in-out infinite;
          transform-origin: 30% 70%;
        }
        .macaque-eye {
          animation: macaque-blink 6s ease-in-out infinite;
          transform-origin: center;
        }
        .glass-card {
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
        }
        .glass-card-hover:hover {
          background: rgba(20, 30, 55, 0.6);
          border-color: rgba(16, 185, 129, 0.3);
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.1);
        }
      `}</style>

      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <Compass className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Prakriti Sanctuary</span>
            <h2 className="text-md md:text-lg font-bold tracking-tight leading-none text-slate-100 font-serif">Western Ghats</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-full py-1.5 px-4 flex items-center gap-2 shadow-inner backdrop-blur-md">
            <Coins className="w-4.5 h-4.5 text-yellow-400 fill-yellow-400/20 animate-bounce" />
            <span className="text-sm font-extrabold text-emerald-300">
              {user ? user.pebbles : 0} <span className="text-xs text-emerald-400/70 font-normal">Pebbles</span>
            </span>
          </div>

          <button 
            onClick={handleDevReset}
            title="Reset Sanctuary State"
            className="p-2 rounded-full bg-slate-900/60 border border-slate-800 hover:border-red-500/40 hover:bg-red-950/30 text-slate-400 hover:text-red-400 transition-all backdrop-blur-md"
          >
            <RotateCcw className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Parallax Container */}
      <div className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#020617] to-[#011c15]">
        
        {/* Layer 1: Misty Mountains (Far Background) */}
        <div 
          className="absolute inset-0 w-full h-[120%] pointer-events-none z-0"
          style={{ transform: `translateY(${scrollY * 0.45}px) scale(1.1)`, transformOrigin: "center top" }}
        >
          <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="45%" stopColor="#042f2e" />
                <stop offset="75%" stopColor="#115e59" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
              <linearGradient id="mtnGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#022c22" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="mtnGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#047857" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#022c22" stopOpacity="0.95" />
              </linearGradient>
              <filter id="glowFilter">
                <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect width="1440" height="800" fill="url(#skyGrad)" />
            <circle cx="720" cy="240" r="90" fill="#fef08a" opacity="0.12" filter="url(#glowFilter)" />
            <circle cx="720" cy="240" r="35" fill="#fef9c3" opacity="0.25" filter="url(#glowFilter)" />
            <path d="M0,480 L180,410 C320,330 460,460 680,400 C900,340 1080,450 1260,380 L1440,460 L1440,800 L0,800 Z" fill="url(#mtnGrad1)" />
            <path d="M0,540 C220,450 380,560 620,490 C860,420 1060,540 1260,460 C1340,420 1400,450 1440,430 L1440,800 L0,800 Z" fill="url(#mtnGrad2)" />
          </svg>
        </div>
        
        {/* Layer 2: Canopy Tree Line (Mid-Background) */}
        <div 
          className="absolute inset-0 w-full h-[120%] pointer-events-none z-10"
          style={{ transform: `translateY(${scrollY * 0.25}px) scale(1.05)`, transformOrigin: "center top" }}
        >
          <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="canopyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#022c22" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#011c15" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M0,600 C50,560 70,540 90,570 C120,590 140,530 180,550 C220,580 240,510 280,530 C320,560 360,500 400,530 C450,560 480,510 520,540 C580,580 620,480 680,510 C740,540 780,490 820,520 C880,560 920,470 980,500 C1040,530 1080,480 1120,510 C1180,550 1220,490 1280,530 C1340,570 1380,510 1440,550 L1440,800 L0,800 Z" fill="url(#canopyGrad)" />
          </svg>
        </div>

        {/* Layer 3: Mid-forest Bamboo/Fern & Branches (The Macaque Layer) */}
        <div 
          className="absolute inset-0 w-full h-[120%] pointer-events-none z-20"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#140e0a" />
                <stop offset="50%" stopColor="#221711" />
                <stop offset="100%" stopColor="#140e0a" />
              </linearGradient>
            </defs>
            <path d="M30,800 L45,400 C46,380 50,370 55,400 L70,800 Z" fill="#012b1d" />
            <path d="M75,800 L90,360 C91,340 95,330 100,360 L115,800 Z" fill="#022c22" />
            <path d="M0,0 Q120,60 80,260 C65,310 20,360 0,330 Z" fill="#022c22" opacity="0.85" />
            <path d="M1360,800 L1340,380 C1339,360 1335,350 1330,380 L1310,800 Z" fill="#012b1d" />
            <path d="M1410,800 L1390,340 C1389,320 1385,310 1380,340 L1360,800 Z" fill="#022c22" />
            <path d="M1440,0 Q1320,90 1370,290 C1390,330 1430,350 1440,310 Z" fill="#022c22" opacity="0.85" />
            <path d="M0,580 C150,560 300,550 500,550 C590,550 670,545 745,540 C775,538 805,530 780,555 C695,570 595,575 510,578 C310,578 160,590 0,605 Z" fill="url(#trunkGrad)" stroke="#0b0806" strokeWidth="2" />
            <path d="M480,550 Q465,530 450,550 Z" fill="#047857" />
            <path d="M525,550 Q545,535 565,550 Z" fill="#059669" />
            <path d="M625,545 Q605,525 585,545 Z" fill="#047857" />
            <path d="M690,542 Q710,528 730,542 Z" fill="#059669" />
            
            <g opacity="0.8">
              <circle cx="200" cy="450" r="3" fill="#fef08a" className="animate-ping" style={{ animationDuration: '4s' }} />
              <circle cx="200" cy="450" r="1.5" fill="#fef9c3" />
            </g>
            <g opacity="0.7">
              <circle cx="1180" cy="380" r="4" fill="#fef08a" className="animate-ping" style={{ animationDuration: '3.5s' }} />
              <circle cx="1180" cy="380" r="2" fill="#fef9c3" />
            </g>
            <g opacity="0.9">
              <circle cx="850" cy="500" r="3" fill="#fef08a" className="animate-ping" style={{ animationDuration: '5s' }} />
              <circle cx="850" cy="500" r="1.5" fill="#fef9c3" />
            </g>

            {/* Lion-Tailed Macaque group with mouse parallax */}
            <g 
              className="macaque-body" 
              style={{ 
                transform: `translate(${720 + mousePos.x * -25}px, ${450 + mousePos.y * -25}px)`,
                transformOrigin: "center bottom",
                cursor: "pointer",
                pointerEvents: "auto"
              }}
              onClick={() => {
                setMacaqueInteracted(true);
                setTimeout(() => setMacaqueInteracted(false), 2000);
                confetti({
                  particleCount: 15,
                  spread: 30,
                  origin: { x: 0.5, y: 0.55 },
                  colors: ["#10b981", "#fbbf24"]
                });
              }}
            >
              <path className="macaque-tail" d="M -12,50 C -30,68 -38,92 -32,108 C -26,124 -15,116 -18,102" stroke="#0f172a" strokeWidth="5" fill="none" strokeLinecap="round" />
              <circle className="macaque-tail-tuft" cx="-32" cy="108" r="7" fill="#f1f5f9" />
              <path d="M-26,50 C-26,16 -18,0 0,0 C18,0 26,16 26,50 C26,66 18,74 0,74 C-18,74 -26,66 -26,50 Z" fill="#0f172a" />
              <path d="M-22,50 C-34,54 -38,70 -26,74 C-18,74 -18,62 -22,50 Z" fill="#1e293b" />
              <path d="M22,50 C34,54 38,70 26,74 C18,74 18,62 22,50 Z" fill="#1e293b" />
              <path d="M-18,18 C-30,26 -30,42 -18,50" stroke="#1e293b" strokeWidth="5.5" fill="none" strokeLinecap="round" />
              <path d="M18,18 C30,26 30,42 18,50" stroke="#1e293b" strokeWidth="5.5" fill="none" strokeLinecap="round" />
              <path d="M-40,-8 C-48,-20 -40,-38 -26,-42 C-22,-54 -4,-54 0,-50 C4,-54 22,-54 26,-42 C40,-38 48,-20 40,-8 C44,12 30,28 12,28 C4,32 -4,32 -12,28 C-30,28 -44,12 -40,-8 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" />
              <circle cx="0" cy="-12" r="23" fill="#334155" />
              <path d="M-18,-12 C-18,-26 -10,-30 0,-30 C10,-30 18,-26 18,-12 C18,2 10,7 0,7 C-10,7 -18,2 -18,-12 Z" fill="#0f172a" />
              <g className="macaque-eye">
                <circle cx="-8" cy="-14" r="3.2" fill="#fbbf24" />
                <circle cx="-8" cy="-14" r="1.5" fill="#000" />
                <circle cx="-9.2" cy="-15.2" r="0.7" fill="#fff" />
              </g>
              <g className="macaque-eye">
                <circle cx="8" cy="-14" r="3.2" fill="#fbbf24" />
                <circle cx="8" cy="-14" r="1.5" fill="#000" />
                <circle cx="6.8" cy="-15.2" r="0.7" fill="#fff" />
              </g>
              <path d="M-6,-6 C-6,-12 6,-12 6,-6 C6,0 3,3 0,3 C-3,3 -6,0 -6,-6 Z" fill="#1e293b" />
              <path d="M-1.5,-7 L1.5,-7 L0,-5.5 Z" fill="#000" />
              <path d="M-2.5,-3 Q0,-1.5 2.5,-3" stroke="#000" strokeWidth="1" fill="none" />
              <circle cx="-13" cy="-8" r="2.5" fill="#f43f5e" opacity="0.3" />
              <circle cx="13" cy="-8" r="2.5" fill="#f43f5e" opacity="0.3" />
              {activeAdventure && !activeAdventure.completed && (
                <g transform="translate(-1, 36)" opacity="0.95">
                  <rect x="-11" y="-8" width="22" height="16" rx="4" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
                  <path d="M-11,-2 L11,-2" stroke="#78350f" strokeWidth="1" />
                  <rect x="-3" y="1" width="6" height="5" fill="#d97706" />
                  <path d="M-9,-8 C-14,-16 -18,-24 -14,-32 C-10,-40 6,-38 12,-30 L10,-28" fill="none" stroke="#78350f" strokeWidth="2.5" />
                </g>
              )}
            </g>
          </svg>
        </div>

        {/* Layer 4: Foreground Grass/Flowers (Closest Layer) */}
        <div 
          className="absolute inset-0 w-full h-[100%] pointer-events-none z-30"
          style={{ transform: "translateY(0px)" }}
        >
          <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="foreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#011c15" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>
            <path d="M0,730 C120,705 240,740 360,715 C480,695 600,725 720,705 C840,685 960,715 1080,700 C1200,685 1320,715 1440,705 L1440,800 L0,800 Z" fill="url(#foreGrad)" />
            <path d="M60,740 Q90,660 140,730 Z" fill="#047857" opacity="0.9" />
            <path d="M200,740 Q180,630 150,740 Z" fill="#065f46" />
            <path d="M380,730 Q410,640 460,730 Z" fill="#047857" opacity="0.95" />
            <path d="M780,725 Q750,620 720,725 Z" fill="#065f46" />
            <path d="M960,720 Q1000,630 1050,720 Z" fill="#059669" opacity="0.9" />
            <path d="M1280,725 Q1250,610 1210,725 Z" fill="#012b1d" />
            
            <g transform="translate(180, 700)" opacity="0.95">
              <circle cx="0" cy="0" r="7" fill="#6366f1" />
              <path d="M-7,-7 Q0,-22 7,-7 Q22,0 7,7 Q0,22 -7,7 Q-22,0 -7,-7 Z" fill="#8b5cf6" />
              <circle cx="0" cy="0" r="3.5" fill="#e9d5ff" />
            </g>
            <g transform="translate(420, 715)" opacity="0.95">
              <circle cx="0" cy="0" r="6" fill="#4f46e5" />
              <path d="M-6,-6 Q0,-18 6,-6 Q18,0 6,6 Q0,18 -6,6 Q-18,0 -6,-6 Z" fill="#7c3aed" />
              <circle cx="0" cy="0" r="3" fill="#f5f3ff" />
            </g>
            <g transform="translate(860, 695)" opacity="0.95">
              <circle cx="0" cy="0" r="8" fill="#6366f1" />
              <path d="M-8,-8 Q0,-25 8,-8 Q25,0 8,8 Q0,25 -8,8 Q-25,0 -8,-8 Z" fill="#8b5cf6" />
              <circle cx="0" cy="0" r="4" fill="#e9d5ff" />
            </g>
            <g transform="translate(1180, 705)" opacity="0.95">
              <circle cx="0" cy="0" r="6.5" fill="#4f46e5" />
              <path d="M-6.5,-6.5 Q0,-20 6.5,-6.5 Q20,0 6.5,6.5 Q0,20 -6.5,6.5 Q-20,0 -6.5,-6.5 Z" fill="#7c3aed" />
              <circle cx="0" cy="0" r="3" fill="#f5f3ff" />
            </g>
          </svg>
        </div>

        {/* Parallax Overlay Sanctuary Title */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center pointer-events-auto z-40 select-none px-4 max-w-lg">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-emerald-100 via-emerald-300 to-teal-600 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] font-serif">
            Western Ghats
          </h1>
          <p className="text-emerald-100/70 mt-3 text-xs md:text-sm tracking-[0.25em] uppercase font-bold drop-shadow-md">
            Virtual Ecosystem Sanctuary
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-emerald-500/20 text-emerald-400 text-xs font-semibold backdrop-blur-md shadow-lg shadow-black/40 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400"></span>
            {macaqueInteracted ? "Aww, the Macaque squeaks!" : "Scroll to manage & unlock species"}
          </div>
        </div>
      </div>

      {/* Sanctuary Control Dashboard Content */}
      <div className="relative z-50 bg-gradient-to-b from-slate-950/95 via-slate-950 to-emerald-950/50 border-t border-slate-900 px-4 md:px-8 py-16 text-white max-w-7xl mx-auto rounded-t-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Expedition Timer */}
          <div className="lg:col-span-5 glass-card rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-emerald-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-emerald-400/20 animate-pulse" />
                  Sanctuary Expedition
                </span>
                <span className="text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 rounded-full px-2 py-0.5">
                  Companion: Macaque
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Sanctuary Vitality</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium">
                Send your unlocked companion on a 6-hour expedition to gather ancient Rainbow Pebbles in the mist-filled valleys.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Ecosystem Energy</span>
                <span className={`font-extrabold ${energy === 100 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {energy}% {energy === 100 ? "(Full)" : "(Recharging...)"}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-1000 rounded-full ${energy === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-yellow-500 to-emerald-500'}`}
                  style={{ width: `${energy}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-4 bg-slate-900/40 border border-slate-900/60 rounded-xl p-4">
              {activeAdventure ? (
                showRewardCard ? (
                  <div className="w-full text-center py-2">
                    <div className="inline-flex p-3 rounded-full bg-yellow-950/40 border border-yellow-500/30 text-yellow-400 mb-3 shadow-lg animate-bounce">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-yellow-400 mb-1">Sanctuary Reward Ready!</h4>
                    <p className="text-xs text-slate-400 mb-4 px-4">
                      Your Macaque has returned safely with rare artifacts!
                    </p>
                    
                    <button
                      onClick={handleClaimReward}
                      className="w-full py-2.5 px-6 rounded-lg bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-black text-sm tracking-widest uppercase shadow-xl hover:shadow-yellow-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                    >
                      <Coins className="w-4.5 h-4.5 fill-slate-950" />
                      Claim +50 Pebbles
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center w-full">
                    <div className="relative w-36 h-36 mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r={radius} stroke="#1e293b" strokeWidth="6" fill="transparent" />
                        <circle cx="72" cy="72" r={radius} stroke="#10b981" strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <Clock className="w-4 h-4 text-emerald-400/80 mb-1 animate-pulse" />
                        <span className="text-xl font-mono font-black tracking-tight text-slate-100 leading-none">
                          {formatTime(timeLeft)}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Foraging</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 text-center mb-4 italic">
                      &quot;Macaque is exploring the valleys...&quot;
                    </p>
                    <div className="grid grid-cols-2 gap-2 w-full mt-1">
                      <button onClick={handleSimulateSpeedup} className="py-1.5 px-2 text-[10px] font-bold rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 transition">
                        Speed Up (5s)
                      </button>
                      <button onClick={handleSimulateInstant} className="py-1.5 px-2 text-[10px] font-bold rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 transition">
                        Complete Now
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full py-4 text-center">
                  <div className="inline-flex p-3 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 mb-3 animate-pulse">
                    <Compass className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-300 mb-1">Ready for Expedition</h4>
                  <p className="text-xs text-slate-400 mb-5 px-4">
                    Required: 100% Sanctuary Energy. Time: 6 hours.
                  </p>
                  
                  <button
                    onClick={handleStartAdventure}
                    className="w-full py-2.5 px-6 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm tracking-widest uppercase shadow-lg hover:shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                  >
                    Launch Expedition
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress to Unlock */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-purple-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5 fill-purple-400/20" />
                  Ecosystem Progression
                </span>
                <span className="text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 rounded-full px-2.5 py-0.5">
                  Completed Budgets: {budgetsCompleted}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Unlock Rare Species</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Save carbon envelopes each week in your budget. Achieving savings unlocks unique wildlife, introducing them into your virtual sanctuary.
              </p>
            </div>

            <div className="my-6 p-4 rounded-xl bg-slate-900/40 border border-slate-900/60">
              {nextSpecies ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-purple-950/40 text-purple-400 border border-purple-800/40">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-sm font-bold text-slate-200">
                        Next Species: <span className="text-purple-400">{nextSpecies.name}</span>
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                      {budgetsCompleted} / {targetBudgets} Budgets
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden border border-slate-800/80 mb-2 relative">
                    <div 
                      className="h-full transition-all duration-1000 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-purple-500 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                      style={{ width: `${percentageToUnlock}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    🌟 <span className="text-purple-300 font-semibold">{nextSpecies.name}</span> unlocks at <span className="text-emerald-400 font-bold">{targetBudgets} weekly budgets</span>. You need <span className="text-purple-400 font-bold">{targetBudgets - budgetsCompleted} more</span> envelope saves!
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="inline-flex p-2 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 mb-2">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-md font-bold text-emerald-400">All Species Unlocked!</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    You have successfully unlocked all rare species in the Western Ghats sanctuary. Keep up the clean carbon lifestyle!
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {speciesList.map((sp) => {
                const isSpUnlocked = budgetsCompleted >= sp.requiredBudgets;
                return (
                  <div 
                    key={sp.id} 
                    className={`p-2 rounded-lg border ${isSpUnlocked ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' : 'bg-slate-900/30 border-slate-900 text-slate-500'} flex items-center gap-1.5`}
                  >
                    {isSpUnlocked ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                    <span className="font-semibold truncate">{sp.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Species Polaroid Grid Section */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif font-black tracking-tight">Wildlife Catalogue</h3>
              <p className="text-sm text-slate-400 mt-1">
                Unlocked entries appear as colorful Polaroids with glows. Tap them to view ecological details.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Unlocked: {speciesList.filter(s => budgetsCompleted >= s.requiredBudgets).length} / 4
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {speciesList.map((sp) => {
              const isLocked = budgetsCompleted < sp.requiredBudgets;
              return (
                <div 
                  key={sp.id}
                  onClick={() => !isLocked && setSelectedSpecies(sp)}
                  className={`bg-white text-slate-800 p-4 pb-6 shadow-xl transition-all duration-300 flex flex-col justify-between border border-slate-200/60 ${
                    isLocked 
                      ? 'grayscale opacity-70 cursor-not-allowed' 
                      : 'hover:scale-[1.03] hover:rotate-1 cursor-pointer shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_20px_rgba(34,197,94,0.3)]'
                  }`}
                >
                  <div className="relative aspect-square w-full rounded-sm bg-slate-900 overflow-hidden border border-slate-200 mb-4 flex items-center justify-center shadow-inner">
                    {sp.renderSvg(isLocked)}
                    {isLocked && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-3 text-center">
                        <div className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                          <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-[10px] font-black text-slate-300 mt-2 tracking-wider">LOCKED</span>
                        <span className="text-[9px] text-slate-400 mt-0.5 bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded">
                          {sp.requiredBudgets} budgets
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center space-y-1">
                    <h4 className="font-serif font-bold text-slate-900 text-base tracking-tight truncate">
                      {sp.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-serif italic">
                      {sp.scientificName}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-sans">
                    {isLocked ? (
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    ) : (
                      <>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Unlock className="w-3 h-3" /> Active
                        </span>
                        <span className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5">
                          Details <ChevronRight className="w-3 h-3" />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informative Block */}
        <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="w-16 h-16 shrink-0 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Shield className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold tracking-tight mb-2">Western Ghats: A Global Biodiversity Hotspot</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              The Western Ghats mountain range is older than the Himalayas and represents a biophysical engine of India&apos;s monsoon weather. Hosting over 325 globally threatened species, many occur nowhere else on Earth. By tracking and managing your carbon output with Prakriti, you actively champion resource savings that combat global temperature shifts, protecting delicate habitats like the shola forests and evergreen rain canopies.
            </p>
          </div>
        </div>
      </div>

      {/* Species details Modal */}
      <AnimatePresence>
        {selectedSpecies && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSpecies(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-10 text-white"
            >
              <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-purple-600"></div>
              
              <button 
                onClick={() => setSelectedSpecies(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-6">
                  <div className="w-32 h-32 shrink-0 rounded-xl bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center p-2">
                    {selectedSpecies.renderSvg(false)}
                  </div>
                  
                  <div className="text-center md:text-left">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${selectedSpecies.statusColor}`}>
                      {selectedSpecies.status}
                    </span>
                    <h3 className="text-2xl font-serif font-black tracking-tight text-white leading-tight">
                      {selectedSpecies.name}
                    </h3>
                    <p className="text-sm font-mono text-slate-400 italic mt-0.5">
                      {selectedSpecies.scientificName}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-semibold text-slate-300">
                      <div className="bg-slate-950/60 rounded px-3 py-1.5 border border-slate-900">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Habitat</span>
                        {selectedSpecies.habitat}
                      </div>
                      <div className="bg-slate-950/60 rounded px-3 py-1.5 border border-slate-900">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Diet</span>
                        {selectedSpecies.diet}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Overview</h4>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 rounded-lg p-3.5 border border-slate-950 shadow-inner">
                      {selectedSpecies.description}
                    </p>
                  </div>
                  
                  <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 flex gap-3">
                    <Sparkles className="w-5 h-5 shrink-0 text-emerald-400 animate-pulse" />
                    <div>
                      <h5 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Sanctuary Fun Fact</h5>
                      <p className="text-xs leading-relaxed mt-0.5">
                        {selectedSpecies.funFact}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-900 flex justify-end">
                  <button 
                    onClick={() => setSelectedSpecies(null)}
                    className="py-2 px-6 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 font-bold text-xs uppercase tracking-wider transition"
                  >
                    Back to Sanctuary
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Developer Control Sandbox Drawer */}
      <div className={`fixed bottom-0 right-0 z-50 transition-transform duration-300 ${devOpen ? "translate-y-0" : "translate-y-[calc(100%-40px)]"}`}>
        <div className="w-80 md:w-96 bg-slate-900 border border-slate-800 border-b-0 rounded-t-xl shadow-2xl overflow-hidden text-white font-sans text-xs">
          
          <div 
            onClick={() => setDevOpen(!devOpen)}
            className="bg-slate-950 px-4 py-2.5 flex items-center justify-between cursor-pointer border-b border-slate-800"
          >
            <span className="font-extrabold tracking-wider uppercase text-yellow-400 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              Developer Sandbox Panel
            </span>
            {devOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">
                Weekly Budgets Completed: <span className="text-emerald-400 font-bold">{budgetsCompleted}</span>
              </label>
              <div className="flex gap-2 items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  value={budgetsCompleted} 
                  onChange={(e) => handleDevSetBudgets(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-950 rounded-full"
                />
                <div className="flex gap-1">
                  <button onClick={() => handleDevSetBudgets(budgetsCompleted - 1)} className="w-6 h-6 rounded bg-slate-950 border border-slate-800 font-bold text-center hover:bg-slate-800 transition">-</button>
                  <button onClick={() => handleDevSetBudgets(budgetsCompleted + 1)} className="w-6 h-6 rounded bg-slate-950 border border-slate-800 font-bold text-center hover:bg-slate-800 transition">+</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <button onClick={() => handleDevSetBudgets(0)} className="py-1 px-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 transition text-[9px]">0 (Reset)</button>
                <button onClick={() => handleDevSetBudgets(5)} className="py-1 px-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 transition text-[9px] text-purple-300">5 (Unlock Tahr)</button>
                <button onClick={() => handleDevSetBudgets(15)} className="py-1 px-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 transition text-[9px] text-purple-400">15 (Unlock Frog)</button>
                <button onClick={() => handleDevSetBudgets(25)} className="py-1 px-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 transition text-[9px] text-purple-500 font-bold">25 (Unlock Civet)</button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">
                Rainbow Pebbles: <span className="text-yellow-400 font-bold">{user?.pebbles || 0}</span>
              </label>
              <div className="flex gap-2">
                <button onClick={() => handleDevSetPebbles((user?.pebbles || 0) + 50)} className="flex-1 py-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 transition text-[10px]">+50 Pebbles</button>
                <button onClick={() => handleDevSetPebbles((user?.pebbles || 0) - 50)} className="flex-1 py-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 transition text-[10px]">-50 Pebbles</button>
              </div>
            </div>

            <div className="p-2.5 rounded bg-amber-950/20 border border-amber-900/30 text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                Changes in this sandbox are saved to localStorage / Supabase. Use the **Reset** button at the top header to wipe simulated data.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
