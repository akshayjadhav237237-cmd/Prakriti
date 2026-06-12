"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  ArrowRight,
  Play,
  Globe,
  Trees,
  Zap,
  Leaf,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink
} from "lucide-react";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-plus-jakarta",
});

// Statically defined details for floating leaves animation
const LEAVES_DATA = [
  { left: "6%", size: "w-6 h-6", duration: "18s", delay: "0s", sway: "40px", rotate: "140deg" },
  { left: "20%", size: "w-8 h-8", duration: "24s", delay: "3s", sway: "65px", rotate: "240deg" },
  { left: "45%", size: "w-5 h-5", duration: "16s", delay: "1s", sway: "-50px", rotate: "320deg" },
  { left: "65%", size: "w-7 h-7", duration: "20s", delay: "5s", sway: "55px", rotate: "190deg" },
  { left: "80%", size: "w-6 h-6", duration: "15s", delay: "2s", sway: "-45px", rotate: "280deg" },
  { left: "92%", size: "w-9 h-9", duration: "22s", delay: "7s", sway: "70px", rotate: "120deg" },
];

// Sub-component for scroll-triggered stats counters
function StatsCounter({
  value,
  duration = 2000,
  decimals = 2,
}: {
  value: number;
  duration?: number;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTimestamp: number | null = null;
    let animationId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing out quad
      const easeProgress = progress * (2 - progress);
      setCount(easeProgress * value);

      if (progress < 1) {
        animationId = window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    animationId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, [hasStarted, value, duration]);

  return (
    <span ref={elementRef} className="font-mono tabular-nums">
      {count.toFixed(decimals)}
    </span>
  );
}

export default function Home() {
  const router = useRouter();
  // Intersection observer hook for elements with the .reveal class
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex flex-col">
      {/* Global CSS Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatLeaf {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        .leaf-particle {
          position: absolute;
          bottom: 0;
          color: #4ade80;
          fill: currentColor;
          opacity: 0;
          pointer-events: none;
          animation-name: floatLeaf;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        
        @keyframes monkey-peek {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          15%, 85% {
            transform: translateX(-62px) translateY(-4px) rotate(-1.5deg);
          }
          20%, 80% {
            transform: translateX(-64px) translateY(-2px) rotate(1deg);
          }
        }
        .macaque-peek {
          animation: monkey-peek 10s ease-in-out infinite;
          transform-origin: bottom right;
        }
        
        @keyframes branch-sway-1 {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(1.2deg); }
        }
        @keyframes branch-sway-2 {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-1.8deg); }
        }
        @keyframes branch-sway-3 {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(0.8deg); }
        }
        .sway-branch-1 {
          animation: branch-sway-1 6s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .sway-branch-2 {
          animation: branch-sway-2 8s ease-in-out infinite;
          transform-origin: bottom left;
        }
        .sway-branch-3 {
          animation: branch-sway-3 7s ease-in-out infinite;
          transform-origin: bottom right;
        }
        
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .hover-lift {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-6px);
        }
      `}} />

      {/* Floating Leaves Layer */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="leaf-particle w-4 h-4" style={{ left: '10%', animationDelay: '0s', animationDuration: '12s' }}>
          <svg viewBox="0 0 32 32"><path d="M16,2 C8,10 8,20 16,30 C24,20 24,10 16,2 Z M16,2 L16,30" /></svg>
        </div>
        <div className="leaf-particle w-5 h-5" style={{ left: '25%', animationDelay: '2s', animationDuration: '15s' }}>
          <svg viewBox="0 0 32 32"><path d="M16,2 C8,10 8,20 16,30 C24,20 24,10 16,2 Z M16,2 L16,30" /></svg>
        </div>
        <div className="leaf-particle w-3 h-3" style={{ left: '40%', animationDelay: '4s', animationDuration: '10s' }}>
          <svg viewBox="0 0 32 32"><path d="M16,2 C8,10 8,20 16,30 C24,20 24,10 16,2 Z M16,2 L16,30" /></svg>
        </div>
        <div className="leaf-particle w-6 h-6" style={{ left: '60%', animationDelay: '6s', animationDuration: '13s' }}>
          <svg viewBox="0 0 32 32"><path d="M16,2 C8,10 8,20 16,30 C24,20 24,10 16,2 Z M16,2 L16,30" /></svg>
        </div>
        <div className="leaf-particle w-4 h-4" style={{ left: '75%', animationDelay: '8s', animationDuration: '11s' }}>
          <svg viewBox="0 0 32 32"><path d="M16,2 C8,10 8,20 16,30 C24,20 24,10 16,2 Z M16,2 L16,30" /></svg>
        </div>
        <div className="leaf-particle w-5 h-5" style={{ left: '90%', animationDelay: '10s', animationDuration: '14s' }}>
          <svg viewBox="0 0 32 32"><path d="M16,2 C8,10 8,20 16,30 C24,20 24,10 16,2 Z M16,2 L16,30" /></svg>
        </div>
      </div>

      {/* Hero Section */}
      <section style={{
        background: `
          radial-gradient(ellipse 100% 60% at 50% -5%, 
            rgba(34,197,94,0.15) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 50%, 
            rgba(21,128,61,0.08) 0%, transparent 50%),
          #050d0a
        `,
        minHeight: '100vh'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-16 flex flex-col items-center justify-between min-h-[100vh] w-full">
          {/* Top Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border border-green-500/30 bg-green-500/10 backdrop-blur-sm text-green-400 text-sm font-medium">
            ✦ Next-Gen India Carbon Budgeting Platform
          </div>

          {/* 72px Bold Title & Subtitle */}
          <div className="text-center max-w-5xl space-y-6">
            <h1 className={`${plusJakartaSans.className} text-5xl md:text-[72px] font-bold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto`}>
              Your carbon, your budget,{" "}
              <span className="bg-gradient-to-r from-emerald-500 via-primary to-accent bg-clip-text text-transparent drop-shadow-sm">
                your India.
              </span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Prakriti helps you allocate, track, and trade your carbon budget like currency, designed specifically for localized Indian urban living and grid parameters.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto relative group overflow-hidden rounded-2xl bg-primary px-8 py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(22,163,74,0.25)] transition-all hover:bg-primary/95 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(22,163,74,0.4)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Start Budgeting</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-white/80 border border-white/20 font-semibold hover:border-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              View Demo ▷
            </button>
          </div>

          {/* Hero Visual: Animated SVG of Shola Forest and Lion-Tailed Macaque */}
          <div className="w-full max-w-4xl mt-12 md:mt-16 relative aspect-[800/400] md:aspect-[800/450] overflow-hidden rounded-3xl border border-border bg-surface/40 backdrop-blur-xs p-1">
            <svg
              viewBox="0 0 800 450"
              className="w-full h-full object-cover rounded-2xl select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Defs for gradients */}
              <defs>
                <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(22,163,74,0.02)" />
                  <stop offset="100%" stopColor="rgba(22,163,74,0.12)" />
                </linearGradient>
                <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0a2314" />
                  <stop offset="100%" stopColor="#041209" />
                </linearGradient>
                <linearGradient id="trunkGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#143c22" />
                  <stop offset="100%" stopColor="#0a2314" />
                </linearGradient>
              </defs>

              {/* Sky Background */}
              <rect width="800" height="450" fill="url(#skyGrad)" />

              {/* Distant Hills */}
              <path d="M0 320 Q 200 270, 450 330 T 800 300 L 800 450 L 0 450 Z" fill="#14532d" fillOpacity="0.12" />
              <path d="M0 350 Q 280 310, 550 360 T 800 340 L 800 450 L 0 450 Z" fill="#14532d" fillOpacity="0.22" />

              {/* Swaying Tree 1 (Left) */}
              <g className="sway-branch-1">
                <path d="M 140 380 C 135 340, 115 310, 110 260 L 125 260 C 130 300, 145 330, 150 380 Z" fill="url(#trunkGradLight)" />
                <path d="M 60 260 C 40 230, 60 180, 90 180 C 100 160, 130 160, 140 180 C 160 170, 180 190, 170 220 C 185 240, 165 280, 130 270 C 110 285, 80 280, 60 260 Z" fill="#166534" />
                <path d="M 80 240 C 70 220, 85 190, 105 200 C 115 190, 135 190, 140 210 C 150 205, 160 220, 150 235 C 155 250, 140 270, 120 260 C 105 270, 90 260, 80 240 Z" fill="#15803d" fillOpacity="0.8" />
              </g>

              {/* Swaying Tree 3 (Right Small) */}
              <g className="sway-branch-3">
                <path d="M 680 390 C 675 350, 685 320, 690 280 L 702 280 C 698 320, 688 350, 692 390 Z" fill="url(#trunkGradLight)" />
                <path d="M 640 280 C 620 260, 640 220, 660 220 C 670 200, 695 200, 705 220 C 720 210, 735 225, 730 245 C 740 260, 725 290, 700 285 C 685 295, 660 295, 640 280 Z" fill="#14532d" />
              </g>

              {/* Lion-Tailed Macaque (Peeks from behind the large center trunk, coordinates positioned to hide at rest) */}
              <g className="macaque-peek">
                {/* Tail */}
                <path d="M 465 315 Q 475 335, 470 365 T 480 405" fill="none" stroke="#090d16" strokeWidth="4" strokeLinecap="round" />
                <circle cx="480" cy="405" r="6" fill="#090d16" />
                {/* Body */}
                <path d="M 450 300 C 462 280, 482 290, 478 330 C 472 350, 460 365, 450 365 Z" fill="#090d16" />
                {/* Mane (Grey fluff around head) */}
                <path d="M 450 275 C 440 265, 435 245, 450 235 C 445 215, 463 205, 475 215 C 485 205, 500 215, 495 235 C 510 245, 505 265, 495 275 C 487 285, 458 285, 450 275 Z" fill="#cbd5e1" />
                {/* Face */}
                <ellipse cx="472" cy="248" rx="15" ry="17" fill="#090d16" />
                <path d="M 468 254 Q 472 258, 476 254" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                {/* Glowing green eyes */}
                <circle cx="465" cy="245" r="3" fill="#4ade80" />
                <circle cx="479" cy="245" r="3" fill="#4ade80" />
                {/* Ears */}
                <path d="M 453 234 Q 447 232, 451 238" fill="#090d16" />
                <path d="M 491 234 Q 497 232, 493 238" fill="#090d16" />
              </g>

              {/* Tree 2 Trunk (Large foreground trunk covering monkey when static) */}
              <path d="M 440 180 C 430 250, 425 330, 430 450 L 495 450 C 485 330, 480 250, 475 180 Z" fill="url(#trunkGrad)" />

              {/* Branches and foliage of Main Tree */}
              <g className="sway-branch-2">
                <path d="M 445 220 Q 380 180, 340 190 L 350 205 Q 390 195, 448 232 Z" fill="url(#trunkGrad)" />
                <path d="M 455 210 Q 520 170, 560 175 L 555 190 Q 515 185, 452 222 Z" fill="url(#trunkGrad)" />
                
                <path d="M 320 200 C 290 180, 300 130, 340 130 C 350 100, 390 100, 410 120 C 430 90, 480 95, 480 130 C 500 110, 530 120, 535 150 C 555 140, 570 170, 550 190 C 560 210, 530 240, 500 230 C 480 250, 440 240, 420 220 C 400 245, 340 240, 320 200 Z" fill="#047857" />
                <path d="M 350 180 C 330 165, 340 140, 370 140 C 380 120, 410 120, 420 135 C 435 115, 470 120, 470 140 C 485 130, 510 135, 510 160 C 525 155, 535 175, 520 190 C 530 205, 505 225, 485 215 C 470 230, 440 225, 425 210 C 410 225, 370 220, 350 180 Z" fill="#10b981" fillOpacity="0.85" />
              </g>

              {/* Understory Shrubbery / Grassland Foreground */}
              <path d="M -20 400 Q 150 370, 320 400 T 680 380 Q 740 390, 820 375 L 820 460 L -20 460 Z" fill="#0c2515" />
              
              {/* Small Foreground Ferns */}
              <g className="sway-branch-1">
                <path d="M 50 400 Q 40 370, 20 360 Q 35 375, 52 400 Z" fill="#14532d" />
                <path d="M 60 401 Q 60 365, 50 355 Q 65 375, 62 401 Z" fill="#166534" />
                <path d="M 70 402 Q 80 375, 90 368 Q 80 385, 72 402 Z" fill="#047857" />
              </g>
              <g className="sway-branch-3">
                <path d="M 740 395 Q 730 365, 715 355 Q 725 370, 742 395 Z" fill="#14532d" />
                <path d="M 750 392 Q 755 360, 765 350 Q 755 370, 752 392 Z" fill="#166534" />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-20">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            A Clean-Tech Platform Tailored For India
          </h2>
          <p className="text-foreground/70 text-base max-w-xl mx-auto">
            Manage your ecological footprints with modular budgets designed for Indian metros, cooking habits, and local power networks.
          </p>
        </div>

        {/* 3 Staggered cards in a row using .reveal and hover lift states */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="reveal bg-surface border border-border rounded-3xl p-8 hover-lift hover:border-primary/40 shadow-xs flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Interactive Carbon Budgeting
              </h3>
              <p className="text-foreground/70 text-sm leading-relaxed mb-6">
                Treat your carbon output like a wallet. Distribute weekly allowances for transit, diet, and electricity, and trade left-over credits.
              </p>
            </div>
            <Link href="/onboarding" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-1.5 transition-all">
              <span>Setup your budget</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="reveal bg-surface border border-border rounded-3xl p-8 hover-lift hover:border-primary/40 shadow-xs flex flex-col justify-between min-h-[300px]" style={{ transitionDelay: "150ms" }}>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
                <Trees className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Virtual Shola Forest Sim
              </h3>
              <p className="text-foreground/70 text-sm leading-relaxed mb-6">
                Gain pebbles by cutting real-life carbon. Watch your online Shola forest expand, attracting native fauna like the Lion-Tailed Macaque.
              </p>
            </div>
            <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-1.5 transition-all">
              <span>View demo forest</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="reveal bg-surface border border-border rounded-3xl p-8 hover-lift hover:border-primary/40 shadow-xs flex flex-col justify-between min-h-[300px]" style={{ transitionDelay: "300ms" }}>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                India-Specific Analytics
              </h3>
              <p className="text-foreground/70 text-sm leading-relaxed mb-6">
                Stop relying on generic Western baselines. Prakriti calculations are fully tailored to Indian city climates, LPG fuels, and vehicle standards.
              </p>
            </div>
            <a href="https://cea.nic.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-1.5 transition-all">
              <span>Explore methodology</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </section>

      {/* India-Specific Stats Section */}
      <section className="relative w-full bg-[#0f2d1a] text-white py-24 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Ground Truth: Indian Carbon Realities
            </h2>
            <p className="text-emerald-200/70 text-base max-w-xl mx-auto">
              Prakriti operates on real environmental baselines verified by local agricultural and electricity databases.
            </p>
          </div>

          {/* Staggered stats counters that animate when scrolled into view */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            
            {/* Stat 1 */}
            <div className="space-y-4 reveal">
              <div className="flex items-baseline justify-center">
                <span className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
                  <StatsCounter value={0.71} decimals={2} />
                </span>
                <span className="text-lg md:text-xl font-bold text-accent ml-2">
                  kg/kWh
                </span>
              </div>
              <h3 className="text-lg font-bold text-emerald-300">
                Grid Electricity Coefficient
              </h3>
              <p className="text-emerald-100/60 text-sm max-w-xs mx-auto leading-relaxed">
                Central Electricity Authority (CEA) baseline. Reflects India's highly coal-dense power production, where home energy conservation yields massive offset gains.
              </p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-4 reveal" style={{ transitionDelay: "150ms" }}>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
                  <StatsCounter value={0.033} decimals={3} />
                </span>
                <span className="text-lg md:text-xl font-bold text-accent ml-2">
                  kg/km
                </span>
              </div>
              <h3 className="text-lg font-bold text-emerald-300">
                Scooter/Transit Travel
              </h3>
              <p className="text-emerald-100/60 text-sm max-w-xs mx-auto leading-relaxed">
                Automotive Research Association of India (ARAI) baseline. Represents two-wheeler transit, offering an affordable, lower-carbon commuter choice compared to cabs.
              </p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-4 reveal" style={{ transitionDelay: "300ms" }}>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
                  <StatsCounter value={2.7} decimals={1} />
                </span>
                <span className="text-lg md:text-xl font-bold text-accent ml-2">
                  kg/L
                </span>
              </div>
              <h3 className="text-lg font-bold text-emerald-300">
                LPG Cylinder Cooking Fuel
              </h3>
              <p className="text-emerald-100/60 text-sm max-w-xs mx-auto leading-relaxed">
                Standard cooking baseline. Track domestic cooking gas usage and balance LPG cylinder budgets alongside delivery meals and groceries.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Hackathon Partnership Badges */}
      <section className="relative w-full py-16 border-t border-border bg-surface/40 backdrop-blur-xs z-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-8 select-none">
            In Partnership with Climate & Conservation Initiatives
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 hover:opacity-85 transition-opacity duration-300">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Leaf className="w-5 h-5 text-primary fill-primary/10" />
              <span className="tracking-wider text-sm">Western Ghats Coalition</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Award className="w-5 h-5 text-warm" />
              <span className="tracking-wider text-sm">National Eco Hackathon</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="tracking-wider text-sm">CEA Verified Database</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="tracking-wider text-sm">SankalpTaru Coalition</span>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Minimalist Footer */}
      <footer className="relative border-t border-border bg-surface py-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Logo & description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Leaf className="w-4 h-4 fill-current" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary via-accent to-green-300 bg-clip-text text-transparent">
                Prakriti
              </span>
            </div>
            <p className="text-sm text-foreground/60 max-w-sm leading-relaxed">
              Prakriti is a next-generation carbon budgeting application for urban India. Balance your daily emission footprints, earn rewards, and grow your virtual Western Ghats forest.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm text-foreground/60">
              <li>
                <Link href="/onboarding" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>Start Onboarding</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>View Dashboard</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
              <li>
                <a
                  href="https://cea.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  <span>CEA Baseline Data</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Resource Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">Resources</h3>
            <ul className="space-y-2.5 text-sm text-foreground/60">
              <li>
                <a
                  href="https://sankalptaru.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  <span>Reforestation Partner</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <span className="text-xs text-foreground/40 block mt-2">
                  Version 1.2.0 (Hackathon Release)
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal bottom row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-foreground/45">
          <p>© {new Date().getFullYear()} Prakriti Carbon Budgeting Initiative. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
