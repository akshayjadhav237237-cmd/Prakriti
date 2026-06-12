"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

// Reusable Stats Counter component with count-up animation on scroll
function StatsCounter({
  value,
  duration = 2000,
  decimals = 0,
  suffix = "",
}: {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(value);
      setHasStarted(true);
      return;
    }

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
  }, [value, shouldReduceMotion]);

  useEffect(() => {
    if (!hasStarted || shouldReduceMotion) return;

    let startTimestamp: number | null = null;
    let animationId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress * (2 - progress); // ease out quad
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
  }, [hasStarted, value, duration, shouldReduceMotion]);

  return (
    <span ref={elementRef} className="font-mono tabular-nums">
      {decimals === 0 ? Math.round(count) : count.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function Home() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  // IntersectionObserver for reveal elements
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

  const headlineVariants = {
    initial: { opacity: 0, y: 40 },
    animate: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : delay,
        duration: shouldReduceMotion ? 0 : 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  const marqueeRow1 = [
    "CARBON BUDGETING",
    "INDIA FIRST",
    "GEMINI VISION",
    "WESTERN GHATS",
    "CEA GRID FACTORS",
    "YNAB MODEL",
    "38.46 KG/WEEK",
    "ENVELOPE SYSTEM",
  ];

  const marqueeRow2 = [
    "0.71 KG/KWH",
    "LION-TAILED MACAQUE",
    "DIWALI MODE",
    "DG SET TRACKING",
    "SHOLA FOREST",
    "GEMINI RECEIPT SCAN",
    "NILGIRI TAHR",
    "PROACTIVE NOT REACTIVE",
  ];

  return (
    <div className="homepage-theme relative min-h-screen flex flex-col">
      {/* Editorial Page CSS Injections */}
      <style dangerouslySetInnerHTML={{ __html: `
        .homepage-theme {
          --bg: #060a06;
          --surface: #0d1a0d;
          --green-bright: #39ff7a;
          --green-muted: #1a4a1a;
          --text-primary: #f0ffe8;
          --text-muted: #5a7a5a;
          --border: rgba(57,255,122,0.12);
          --grain: rgba(255,255,255,0.03);
          
          background-color: var(--bg);
          color: var(--text-primary);
          overflow-x: hidden;
        }

        /* Subtle global grain texture overlay */
        .homepage-theme::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.035;
          pointer-events: none;
          z-index: 9999;
        }

        /* Blob pulsing animation */
        @keyframes blobPulse {
          0%, 100% { 
            transform: scale(1) translate(0, 0);
            opacity: 0.15; 
          }
          50% { 
            transform: scale(1.1) translate(-20px, 20px);
            opacity: 0.25; 
          }
        }

        /* Ticker horizontal scrolling animations */
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeReverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .animate-marquee-row-1 {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee-row-2 {
          animation: marqueeReverse 32s linear infinite;
        }

        /* Scroll reveals configuration */
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Down bounce indicator */
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        .bounce-arrow {
          animation: bounceDown 2s infinite ease-in-out;
        }

        /* Prefers-reduced-motion overrides */
        @media (prefers-reduced-motion: reduce) {
          .homepage-theme::before {
            opacity: 0;
          }
          .animate-marquee-row-1,
          .animate-marquee-row-2,
          .bounce-arrow {
            animation: none !important;
            transform: none !important;
          }
          .reveal {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}} />

      {/* Hero Pulsing Blob */}
      <div 
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #39ff7a, transparent 70%)',
          top: '-200px',
          right: '-200px',
          animation: shouldReduceMotion ? 'none' : 'blobPulse 8s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 10,
        }} 
      />

      {/* SECTION 2: HERO */}
      <section 
        className="w-full relative flex flex-col justify-between"
        style={{ minHeight: '100svh', paddingBottom: '40px' }}
      >
        {/* Main hero center panel */}
        <div 
          className="max-w-5xl w-full mx-auto px-6 md:px-20 pt-[15vh] md:pt-[20vh] flex-1 flex flex-col justify-center"
        >
          {/* Eyebrow Label */}
          <div>
            <span 
              className="inline-block uppercase tracking-[0.2em] text-[10px] md:text-[11px] font-semibold border px-3.5 py-1.5 rounded-md mb-8 select-none"
              style={{
                fontFamily: "'Space Mono', monospace",
                color: "#39ff7a",
                borderColor: "rgba(57,255,122,0.3)",
                backgroundColor: "rgba(57,255,122,0.05)",
              }}
            >
              PromptWars Ch.3 × Google Antigravity
            </span>
          </div>

          {/* Staggered Heading */}
          <div className="space-y-1 select-none">
            <motion.h1 
              custom={0.2}
              variants={headlineVariants}
              initial="initial"
              animate="animate"
              className="text-[42px] sm:text-[64px] md:text-[96px] font-black tracking-tight leading-[1.05] text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Your carbon,
            </motion.h1>
            <motion.h1 
              custom={0.4}
              variants={headlineVariants}
              initial="initial"
              animate="animate"
              className="text-[42px] sm:text-[64px] md:text-[96px] font-black tracking-tight leading-[1.05] text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              your budget,
            </motion.h1>
            <motion.h1 
              custom={0.6}
              variants={headlineVariants}
              initial="initial"
              animate="animate"
              className="text-[42px] sm:text-[64px] md:text-[96px] font-black tracking-tight leading-[1.05]"
              style={{ fontFamily: "'Syne', sans-serif", color: "#39ff7a" }}
            >
              your India.
            </motion.h1>
          </div>

          {/* Subtext */}
          <motion.p 
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.8, duration: 0.6 }}
            className="text-base sm:text-lg max-w-xl mt-6 leading-relaxed"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#5a7a5a" }}
          >
            The first carbon platform built for how India actually lives. Not adapted. Built.
          </motion.p>

          {/* CTA Row */}
          <motion.div 
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: shouldReduceMotion ? 0 : 1.0, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-10"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <button
              onClick={() => router.push("/onboarding")}
              className="px-8 py-4 rounded-md text-[15px] font-semibold transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(57,255,122,0.15)]"
              style={{
                backgroundColor: "#39ff7a",
                color: "#060a06",
              }}
            >
              Start Budgeting →
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-8 py-4 rounded-md text-[15px] font-semibold border transition-all hover:border-[#39ff7a] hover:text-white flex items-center justify-center"
              style={{
                borderColor: "rgba(57,255,122,0.3)",
                color: "#5a7a5a",
              }}
            >
              View Demo
            </button>
          </motion.div>
        </div>

        {/* Scroll hint at bottom */}
        <div className="w-full flex flex-col items-center justify-end select-none mt-12 pointer-events-none">
          <span 
            className="text-[10px] tracking-[0.25em] font-bold"
            style={{ fontFamily: "'Space Mono', monospace", color: "#5a7a5a" }}
          >
            SCROLL
          </span>
          <div className="bounce-arrow text-emerald-500 mt-2 text-base font-bold">
            ↓
          </div>
        </div>
      </section>

      {/* SECTION 3: MARQUEE TICKER */}
      <section className="w-full py-8 border-y border-[rgba(57,255,122,0.12)] bg-[#040804] select-none relative z-20">
        <div className="space-y-4">
          {/* Row 1 (Left to Right) */}
          <div className="w-full overflow-hidden flex">
            <div 
              className="flex whitespace-nowrap animate-marquee-row-1 gap-12"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: "13px", letterSpacing: "0.15em", color: "#5a7a5a" }}
            >
              {/* Duplicate contents for seamless looping */}
              {[...marqueeRow1, ...marqueeRow1, ...marqueeRow1].map((item, idx) => (
                <span key={`r1-${idx}`} className="hover:text-[#39ff7a] transition-colors duration-200">
                  &ldquo;{item}&rdquo; &middot;
                </span>
              ))}
            </div>
          </div>

          {/* Row 2 (Right to Left) */}
          <div className="w-full overflow-hidden flex">
            <div 
              className="flex whitespace-nowrap animate-marquee-row-2 gap-12"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: "13px", letterSpacing: "0.15em", color: "#5a7a5a" }}
            >
              {[...marqueeRow2, ...marqueeRow2, ...marqueeRow2].map((item, idx) => (
                <span key={`r2-${idx}`} className="hover:text-[#39ff7a] transition-colors duration-200">
                  &ldquo;{item}&rdquo; &middot;
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURES — NUMBERED EDITORIAL */}
      <section className="w-full max-w-5xl mx-auto px-6 md:px-20 py-28 relative z-20">
        {/* Eyebrow */}
        <div 
          className="text-left tracking-[0.2em] text-[10px] md:text-[11px] font-semibold uppercase mb-16"
          style={{ fontFamily: "'Space Mono', monospace", color: "#39ff7a" }}
        >
          [ WHAT PRAKRITI DOES ]
        </div>

        {/* Feature Rows */}
        <div className="divide-y divide-[rgba(57,255,122,0.12)] border-y border-[rgba(57,255,122,0.12)]">
          {/* Row 1 */}
          <div className="reveal py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-12">
            <div 
              className="text-[72px] md:text-[80px] font-black leading-none select-none opacity-20"
              style={{ fontFamily: "'Syne', sans-serif", color: "#39ff7a" }}
            >
              01
            </div>
            <div className="flex-1 max-w-xl">
              <h3 
                className="text-2xl md:text-3xl font-extrabold text-white mb-3"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Scan. Don&apos;t type.
              </h3>
              <p 
                className="text-[15px] md:text-[16px] leading-relaxed"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#5a7a5a" }}
              >
                Point your camera at any Indian bill. Gemini Vision reads electricity units, petrol liters, Swiggy orders — maps them to real carbon instantly.
              </p>
            </div>
            <div>
              <span 
                className="inline-block px-3 py-1.5 border border-[rgba(57,255,122,0.2)] bg-[rgba(57,255,122,0.03)] text-[11px] font-semibold rounded-full select-none"
                style={{ fontFamily: "'Space Mono', monospace", color: "#39ff7a" }}
              >
                GEMINI 1.5 FLASH
              </span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="reveal py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-12" style={{ transitionDelay: "150ms" }}>
            <div 
              className="text-[72px] md:text-[80px] font-black leading-none select-none opacity-20"
              style={{ fontFamily: "'Syne', sans-serif", color: "#39ff7a" }}
            >
              02
            </div>
            <div className="flex-1 max-w-xl">
              <h3 
                className="text-2xl md:text-3xl font-extrabold text-white mb-3"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Budget before you burn.
              </h3>
              <p 
                className="text-[15px] md:text-[16px] leading-relaxed"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#5a7a5a" }}
              >
                Allocate your 38.46 kg weekly carbon limit across envelopes. Spend it like money. No retroactive guilt. Just decisions.
              </p>
            </div>
            <div>
              <span 
                className="inline-block px-3 py-1.5 border border-[rgba(57,255,122,0.2)] bg-[rgba(57,255,122,0.03)] text-[11px] font-semibold rounded-full select-none"
                style={{ fontFamily: "'Space Mono', monospace", color: "#39ff7a" }}
              >
                YNAB MODEL
              </span>
            </div>
          </div>

          {/* Row 3 */}
          <div className="reveal py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-12" style={{ transitionDelay: "300ms" }}>
            <div 
              className="text-[72px] md:text-[80px] font-black leading-none select-none opacity-20"
              style={{ fontFamily: "'Syne', sans-serif", color: "#39ff7a" }}
            >
              03
            </div>
            <div className="flex-1 max-w-xl">
              <h3 
                className="text-2xl md:text-3xl font-extrabold text-white mb-3"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                India&apos;s numbers. Not Europe&apos;s.
              </h3>
              <p 
                className="text-[15px] md:text-[16px] leading-relaxed"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#5a7a5a" }}
              >
                0.71 kg/kWh grid. 0.033 kg/km scooter. DG set tracking. Diwali mode. IPL season. Wedding Guest mode. Built for how you actually live.
              </p>
            </div>
            <div>
              <span 
                className="inline-block px-3 py-1.5 border border-[rgba(57,255,122,0.2)] bg-[rgba(57,255,122,0.03)] text-[11px] font-semibold rounded-full select-none"
                style={{ fontFamily: "'Space Mono', monospace", color: "#39ff7a" }}
              >
                CEA × ARAI × CPCB
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: DIFF COMPARISON */}
      <section className="w-full bg-[#0d1a0d] py-28 relative z-20">
        <div className="max-w-5xl mx-auto px-6 md:px-20">
          {/* Section Eyebrow */}
          <div 
            className="text-left tracking-[0.2em] text-[10px] md:text-[11px] font-semibold uppercase mb-12"
            style={{ fontFamily: "'Space Mono', monospace", color: "#39ff7a" }}
          >
            [ WHY PRAKRITI IS DIFFERENT ]
          </div>

          {/* Terminal Mockup Card */}
          <div 
            className="w-full rounded-xl border p-6 md:p-8"
            style={{
              backgroundColor: "#060a06",
              borderColor: "rgba(57,255,122,0.2)",
            }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-[rgba(57,255,122,0.12)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5555]" />
                <span className="w-3 h-3 rounded-full bg-[#ffb86c]" />
                <span className="w-3 h-3 rounded-full bg-[#50fa7b]" />
              </div>
              <div 
                className="text-[12px]"
                style={{ fontFamily: "'Space Mono', monospace", color: "#5a7a5a" }}
              >
                india.carbon.diff
              </div>
              <div className="w-12" /> {/* alignment spacer */}
            </div>

            {/* Code / Diff Rows */}
            <div className="space-y-8" style={{ fontFamily: "'Space Mono', monospace" }}>
              {/* Row 01 */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="opacity-40 text-slate-500">01</span>
                  <span className="text-[#39ff7a]">{"// DATA ACCURACY"}</span>
                </div>
                <div 
                  className="rounded px-4 py-2 flex items-center text-xs md:text-sm"
                  style={{ color: "#ff5555", backgroundColor: "rgba(255,85,85,0.08)" }}
                >
                  <span className="mr-3 font-bold select-none">&minus;</span>
                  Western DEFRA/EPA emission factors
                </div>
                <div 
                  className="rounded px-4 py-2 flex items-center text-xs md:text-sm"
                  style={{ color: "#39ff7a", backgroundColor: "rgba(57,255,122,0.08)" }}
                >
                  <span className="mr-3 font-bold select-none">+</span>
                  CEA India grid &middot; ARAI road transport &middot; CPCB fuels
                </div>
              </div>

              {/* Row 02 */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="opacity-40 text-slate-500">02</span>
                  <span className="text-[#39ff7a]">{"// TRACKING MODEL"}</span>
                </div>
                <div 
                  className="rounded px-4 py-2 flex items-center text-xs md:text-sm"
                  style={{ color: "#ff5555", backgroundColor: "rgba(255,85,85,0.08)" }}
                >
                  <span className="mr-3 font-bold select-none">&minus;</span>
                  Retroactive guilt. Log it. Feel bad. Quit.
                </div>
                <div 
                  className="rounded px-4 py-2 flex items-center text-xs md:text-sm"
                  style={{ color: "#39ff7a", backgroundColor: "rgba(57,255,122,0.08)" }}
                >
                  <span className="mr-3 font-bold select-none">+</span>
                  Proactive envelope budget. Allocate before you spend.
                </div>
              </div>

              {/* Row 03 */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="opacity-40 text-slate-500">03</span>
                  <span className="text-[#39ff7a]">{"// DATA INGESTION"}</span>
                </div>
                <div 
                  className="rounded px-4 py-2 flex items-center text-xs md:text-sm"
                  style={{ color: "#ff5555", backgroundColor: "rgba(255,85,85,0.08)" }}
                >
                  <span className="mr-3 font-bold select-none">&minus;</span>
                  Manual entry forms. High friction. Low retention.
                </div>
                <div 
                  className="rounded px-4 py-2 flex items-center text-xs md:text-sm"
                  style={{ color: "#39ff7a", backgroundColor: "rgba(57,255,122,0.08)" }}
                >
                  <span className="mr-3 font-bold select-none">+</span>
                  Gemini Vision OCR. Scan any bill. Zero typing.
                </div>
              </div>

              {/* Row 04 */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="opacity-40 text-slate-500">04</span>
                  <span className="text-[#39ff7a]">{"// BEHAVIORAL DESIGN"}</span>
                </div>
                <div 
                  className="rounded px-4 py-2 flex items-center text-xs md:text-sm"
                  style={{ color: "#ff5555", backgroundColor: "rgba(255,85,85,0.08)" }}
                >
                  <span className="mr-3 font-bold select-none">&minus;</span>
                  Points and streaks. Moral licensing. Motivation crowd-out.
                </div>
                <div 
                  className="rounded px-4 py-2 flex items-center text-xs md:text-sm"
                  style={{ color: "#39ff7a", backgroundColor: "rgba(57,255,122,0.08)" }}
                >
                  <span className="mr-3 font-bold select-none">+</span>
                  Implementation intentions. Compassionate recovery. Identity habits.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: STATS COUNTER ROW */}
      <section className="w-full py-20 border-b border-[rgba(57,255,122,0.12)] relative z-20">
        <div className="max-w-5xl mx-auto px-6 md:px-20 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[rgba(57,255,122,0.12)]">
          {/* Stat 1 */}
          <div className="py-8 md:py-0 md:px-8 text-center flex flex-col items-center">
            <span 
              className="text-6xl md:text-7xl font-extrabold tracking-tight leading-none"
              style={{ fontFamily: "'Syne', sans-serif", color: "#39ff7a" }}
            >
              <StatsCounter value={48} />
            </span>
            <span 
              className="text-xs md:text-sm font-semibold tracking-wider uppercase mt-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#5a7a5a" }}
            >
              unit tests
            </span>
          </div>

          {/* Stat 2 */}
          <div className="py-8 md:py-0 md:px-8 text-center flex flex-col items-center">
            <span 
              className="text-6xl md:text-7xl font-extrabold tracking-tight leading-none"
              style={{ fontFamily: "'Syne', sans-serif", color: "#39ff7a" }}
            >
              <StatsCounter value={100} suffix="%" />
            </span>
            <span 
              className="text-xs md:text-sm font-semibold tracking-wider uppercase mt-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#5a7a5a" }}
            >
              code coverage
            </span>
          </div>

          {/* Stat 3 */}
          <div className="py-8 md:py-0 md:px-8 text-center flex flex-col items-center">
            <span 
              className="text-6xl md:text-7xl font-extrabold tracking-tight leading-none"
              style={{ fontFamily: "'Syne', sans-serif", color: "#39ff7a" }}
            >
              <StatsCounter value={7} />
            </span>
            <span 
              className="text-xs md:text-sm font-semibold tracking-wider uppercase mt-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#5a7a5a" }}
            >
              parallel subagents
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 7: ECOSYSTEM PREVIEW */}
      <section className="w-full py-28 text-center relative z-20 bg-[#040804]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 
            className="text-4xl md:text-[56px] font-black text-white tracking-tight mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Your forest. Your choices.
          </h2>
          <p 
            className="text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-16"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#5a7a5a" }}
          >
            Every carbon decision shapes a living Western Ghats ecosystem. Unlock endangered Indian species as you hit milestones.
          </p>

          {/* Species Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">
            {/* Species 1 */}
            <div className="flex flex-col items-center space-y-4 select-none">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl border border-[rgba(57,255,122,0.2)] bg-[#0d1a0d]"
              >
                🐒
              </div>
              <span 
                className="text-[13px] font-medium"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Lion-Tailed Macaque
              </span>
            </div>

            {/* Species 2 */}
            <div className="flex flex-col items-center space-y-4 select-none">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl border border-[rgba(57,255,122,0.2)] bg-[#0d1a0d]"
              >
                🐐
              </div>
              <span 
                className="text-[13px] font-medium"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Nilgiri Tahr
              </span>
            </div>

            {/* Species 3 - Locked */}
            <div className="flex flex-col items-center space-y-4 grayscale select-none opacity-45 relative">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl border border-[rgba(57,255,122,0.1)] bg-[#0c120c]"
              >
                🐸
              </div>
              <span 
                className="text-[13px] font-medium"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Purple Frog 🔒
              </span>
            </div>

            {/* Species 4 - Locked */}
            <div className="flex flex-col items-center space-y-4 grayscale select-none opacity-45 relative">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl border border-[rgba(57,255,122,0.1)] bg-[#0c120c]"
              >
                🦡
              </div>
              <span 
                className="text-[13px] font-medium"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Malabar Civet 🔒
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push("/onboarding")}
            className="px-8 py-4 rounded-md text-[15px] font-semibold transition-all hover:brightness-110 active:scale-[0.98] inline-flex items-center gap-1.5 shadow-[0_4px_20px_rgba(57,255,122,0.15)]"
            style={{
              backgroundColor: "#39ff7a",
              color: "#060a06",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Start Growing →
          </button>
        </div>
      </section>

      {/* SECTION 8: FOOTER */}
      <footer 
        className="w-full border-t border-[rgba(57,255,122,0.12)] bg-[#040804] py-16 relative z-20"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          {/* Left Block */}
          <div className="space-y-3">
            <div 
              className="text-lg font-bold tracking-[0.15em] text-white"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              PRAKRITI<span style={{ color: "#39ff7a" }}>*</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#5a7a5a" }}>
              Built for PromptWars Virtual Ch.3 <br />
              Hack2Skill &times; Google Antigravity
            </p>
          </div>

          {/* Right Block */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 text-sm">
            <a 
              href="https://prakriti-carbon.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              style={{ color: "#5a7a5a" }}
            >
              Live ↗
            </a>
            <a 
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              style={{ color: "#5a7a5a" }}
            >
              GitHub ↗
            </a>
            <Link 
              href="/dashboard"
              className="hover:text-white transition-colors"
              style={{ color: "#5a7a5a" }}
            >
              Methodology →
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-5xl mx-auto px-6 md:px-20 mt-12 pt-8 border-t border-[rgba(57,255,122,0.06)] text-[11px] flex justify-between" style={{ color: "#5a7a5a" }}>
          <span>&copy; {new Date().getFullYear()} Prakriti Project. All rights reserved.</span>
          <span>Open Source</span>
        </div>
      </footer>
    </div>
  );
}
