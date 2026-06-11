"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Leaf, MapPin, Coins, RefreshCw, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [city, setCity] = useState<string>("");
  const [pebbles, setPebbles] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Get theme mounted state
  useEffect(() => {
    setMounted(true);
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

  const isOnboarding = pathname === "/onboarding";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Section: Brand Logo */}
        <div 
          onClick={() => { if (userId) router.push("/dashboard"); }} 
          className={`flex items-center space-x-2 cursor-pointer transition-transform active:scale-95 ${!userId ? "pointer-events-none" : ""}`}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Leaf className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-green-300 bg-clip-text text-transparent tracking-tight">
            Prakriti
          </span>
        </div>

        {/* Center/Right Section: User stats (Only display if user is onboarded) */}
        {!isOnboarding && userId && (
          <div className="hidden sm:flex items-center space-x-4">
            {/* City Display */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-sm text-foreground/80">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">{city}</span>
            </div>

            {/* Pebbles Count */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-sm">
              <Coins className="w-4 h-4 text-warm" />
              <span className="font-semibold text-warm">{pebbles} Pebbles</span>
            </div>
          </div>
        )}

        {/* Right Section: Demo Mode & Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl bg-surface border border-border text-foreground/70 hover:text-primary hover:border-primary/40 transition-all focus-visible:ring-2 focus-visible:ring-primary focus:outline-none flex items-center justify-center min-w-[40px] min-h-[40px]"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="w-5 h-5 text-warm" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )
            ) : (
              <div className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center bg-surface border border-border rounded-lg p-1 min-h-[40px]">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 rounded-md">
              Demo Mode
            </span>
            {userId && (
              <button
                onClick={handleStartFresh}
                className="ml-1 p-1.5 hover:bg-background rounded-md text-foreground/60 hover:text-warm transition-colors flex items-center space-x-1 text-xs min-h-[32px]"
                title="Start Fresh"
                aria-label="Start Fresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline pr-1">Start Fresh</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Stats Sub-bar (Only shown on small screens when not onboarding & onboarded) */}
      {!isOnboarding && userId && (
        <div className="sm:hidden flex items-center justify-center space-x-6 py-2 bg-surface/50 border-t border-border text-xs">
          <div className="flex items-center space-x-1 text-foreground/80">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">{city}</span>
          </div>
          <div className="flex items-center space-x-1 text-warm">
            <Coins className="w-3.5 h-3.5" />
            <span className="font-semibold">{pebbles} Pebbles</span>
          </div>
        </div>
      )}
    </header>
  );
}
