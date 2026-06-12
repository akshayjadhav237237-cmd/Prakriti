"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MapPin, Coins, RefreshCw, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

// Premium Custom Green Leaf SVG Icon with gradients
const GreenLeafIcon = () => (
  <svg
    className="w-5 h-5 text-emerald-500 fill-emerald-500/10 transition-transform duration-300 hover:rotate-12"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="leaf-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="50%" stopColor="#059669" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
    </defs>
    <path
      d="M2 22C2 22 3 16 7 12C11 8 15 6 22 2C22 2 20 9 16 13C12 17 6 22 2 22Z"
      fill="url(#leaf-grad)"
    />
    <path
      d="M2 22C5 19 9 16 13 14"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
    <path
      d="M13 14C15.5 12.5 17.5 10.5 22 2"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.3"
    />
  </svg>
);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [city, setCity] = useState<string>("");
  const [pebbles, setPebbles] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const isDark = mounted && theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  // Get theme mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track scroll position to toggle class
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initially on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Function to load state from localStorage
  const loadState = () => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("prakriti_user_id");
      const storedCity = localStorage.getItem("prakriti_city");
      const storedPebbles = localStorage.getItem("prakriti_pebbles");
      
      setUserId(storedUserId);
      setCity(storedCity || "Not set");
      setPebbles(storedPebbles ? parseInt(storedPebbles, 10) : 150);
    }
  };

  useEffect(() => {
    loadState();

    // Listen for custom events to update Navbar when state changes (e.g. after onboarding)
    const handleStateChange = () => {
      loadState();
    };

    window.addEventListener("prakriti_state_changed", handleStateChange);
    
    // Also poll occasionally or use interval to keep in sync
    const interval = setInterval(loadState, 2000);

    return () => {
      window.removeEventListener("prakriti_state_changed", handleStateChange);
      clearInterval(interval);
    };
  }, []);

  const handleStartFresh = () => {
    if (confirm("Are you sure you want to start fresh? This will reset all your carbon budget data, pebbles, and onboarding selections.")) {
      localStorage.clear();
      // Set default pebbles for fresh starts
      localStorage.setItem("prakriti_pebbles", "150");
      window.dispatchEvent(new Event("prakriti_state_changed"));
      router.push("/onboarding");
    }
  };

  const isHomepage = pathname === "/";
  const isOnboarding = pathname === "/onboarding";

  if (isHomepage) {
    return (
      <header className="w-full h-[72px] bg-transparent flex items-center justify-between px-8 z-50 relative border-b border-[rgba(57,255,122,0.12)]">
        {/* Left Section: Logo */}
        <div 
          onClick={() => router.push("/")}
          className="cursor-pointer select-none text-white text-base font-bold tracking-[0.15em]"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          PRAKRITI<span style={{ color: "#39ff7a" }}>*</span>
        </div>

        {/* Right Section: Links */}
        <div className="flex items-center space-x-6">
          <Link
            href="/dashboard"
            className="hover:text-white transition-all duration-200 text-sm font-medium"
            style={{ 
              fontFamily: "'Space Grotesk', sans-serif",
              color: "#5a7a5a"
            }}
          >
            Dashboard →
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-all duration-200 text-sm font-medium"
            style={{ 
              fontFamily: "'Space Grotesk', sans-serif",
              color: "#5a7a5a" 
            }}
          >
            GitHub ↗
          </a>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full h-16 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md shadow-md border-b border-border/80 dark:border-border/40"
          : "bg-background/20 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* Left Section: Brand Logo */}
        <div 
          onClick={() => { if (userId) router.push("/dashboard"); }} 
          className={`flex items-center space-x-2.5 cursor-pointer transition-transform active:scale-95 select-none flex-shrink-0 ${
            !userId ? "pointer-events-none" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm transition-colors hover:bg-emerald-500/20">
            <GreenLeafIcon />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 dark:from-emerald-400 dark:via-teal-400 dark:to-green-400 bg-clip-text text-transparent tracking-tight hidden min-[380px]:inline-block">
            Prakriti
          </span>
        </div>

        {!isOnboarding && userId && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-transparent border border-white/20 text-white/80 hover:border-white/40 transition-colors duration-200">
              📍 {city}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-transparent border border-white/20 text-white/80 hover:border-white/40 transition-colors duration-200">
              🪙 {pebbles} <span className="hidden sm:inline">Pebbles</span>
            </span>
          </div>
        )}

        {/* Right Section: Theme Toggle, Demo Chip, Start Fresh */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Demo Mode Chip */}
          <div className="flex items-center px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse flex-shrink-0" />
            <span className="hidden sm:inline">Demo Mode</span>
            <span className="sm:hidden">Demo</span>
          </div>

          {/* Start Fresh Ghost Button */}
          {userId && (
            <button
              onClick={handleStartFresh}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-foreground/60 hover:text-warm hover:bg-warm/5 border border-transparent hover:border-warm/20 transition-all duration-200 text-xs font-semibold whitespace-nowrap"
              title="Start Fresh"
              aria-label="Start Fresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start Fresh</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
