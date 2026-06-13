'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/Navbar';

/* ─── CONSTANTS ─────────────────────────────── */

const FEATURES = [
  {
    num: '01',
    title: 'Carbon Budgeting.',
    bullets: [
      'Weekly carbon envelope system (38.46 kg)',
      'YNAB-inspired proactive allocation',
      'Visual spend-vs-budget tracker',
      'Daily emission breakdown by category',
    ],
    link: '/dashboard',
  },
  {
    num: '02',
    title: 'Gemini Vision Scan.',
    bullets: [
      'Scan any Indian electricity bill',
      'Auto-parse Swiggy & Zomato receipts',
      'Petrol pump slip recognition',
      'Zero manual data entry',
    ],
    link: '/track',
  },
  {
    num: '03',
    title: 'India-First Data.',
    bullets: [
      'CEA grid factor: 0.71 kg/kWh',
      'ARAI road transport coefficients',
      'Diwali mode & DG set tracking',
      'Wedding Guest & IPL season presets',
    ],
    link: '/insights',
  },
];

const PHASES = [
  {
    branch: 'action/baseline',
    phase: 'PHASE 01',
    dates: 'Week 1 - 2',
    title: 'Set Your Baseline',
    desc: 'Log your first week. Prakriti maps your current lifestyle to a personal carbon fingerprint using real India data.',
  },
  {
    branch: 'action/budget',
    phase: 'PHASE 02',
    dates: 'Week 3 - 6',
    title: 'Budget Your Carbon',
    desc: 'Allocate your weekly 38.46 kg across transport, food, home energy. Spend it before you emit it.',
  },
  {
    branch: 'action/reduce',
    phase: 'PHASE 03',
    dates: 'Ongoing',
    title: 'Reduce & Unlock',
    desc: 'Hit milestones. Unlock Western Ghats species. Watch your ecosystem grow as your footprint shrinks.',
  },
];

const DIFFS = [
  {
    id: '01',
    label: '// DATA ACCURACY',
    minus: 'Western DEFRA/EPA emission factors — built for UK and US, not Mumbai or Pune.',
    plus: 'CEA India grid · ARAI road transport · CPCB fuel standards. Every number is India.',
  },
  {
    id: '02',
    label: '// TRACKING MODEL',
    minus: 'Retroactive guilt. Log what you already did. Feel bad. Open the app less. Quit.',
    plus: 'Proactive envelope budget. Allocate your carbon before you spend it. No surprises.',
  },
  {
    id: '03',
    label: '// DATA INGESTION',
    minus: 'Manual entry forms. Type every unit, every kilometer, every rupee. High friction. Low retention.',
    plus: 'Gemini 1.5 Flash Vision. Point camera at any Indian bill. Parsed in 2 seconds. Zero typing.',
  },
  {
    id: '04',
    label: '// BEHAVIORAL DESIGN',
    minus: 'Points and streaks. Moral licensing. Extrinsic motivation crowd-out. Works for 7 days.',
    plus: 'Implementation intentions. Compassionate recovery after slippage. Identity-based habit formation.',
  },
];

const STATS = [
  { end: 48, suffix: '', label: 'unit tests passing' },
  { end: 100, suffix: '%', label: 'code coverage' },
  { end: 7, suffix: '', label: 'parallel subagents' },
];

const WordRevealParagraph = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealedCount, setRevealedCount] = useState(0);

  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const content = [
    { text: 'We', italic: false, green: false },
    { text: 'are', italic: false, green: false },
    { text: 'climate', italic: false, green: false },
    { text: 'thinkers,', italic: false, green: false },
    { text: '\n', italic: false, green: false },
    { text: 'building', italic: true, green: true },
    { text: 'for', italic: true, green: true },
    { text: 'India.', italic: true, green: true },
    { text: '\n', italic: false, green: false },
    { text: 'We', italic: false, green: false },
    { text: 'empower', italic: false, green: false },
    { text: 'individuals', italic: false, green: false },
    { text: '\n', italic: false, green: false },
    { text: 'to', italic: false, green: false },
    { text: 'track,', italic: false, green: false },
    { text: 'budget,', italic: false, green: false },
    { text: '\n', italic: false, green: false },
    { text: 'and', italic: false, green: false },
    { text: 'reduce', italic: false, green: false },
    { text: 'their', italic: false, green: false },
    { text: 'carbon', italic: false, green: false },
    { text: 'footprint.', italic: false, green: false },
  ];

  // Filter out line breaks for count purposes
  const wordCount = content.filter(w => w.text !== '\n').length;

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // How far we've scrolled INTO this section
      // 0 = section top just entered bottom of screen
      // 1 = section bottom has reached top of screen
      const scrollProgress = Math.max(
        0,
        Math.min(
          1,
          (windowHeight - rect.top) / (windowHeight + rect.height)
        )
      );

      // Map scroll progress to number of revealed words
      const revealed = Math.floor(scrollProgress * wordCount * 1.8);
      setRevealedCount(Math.min(revealed, wordCount));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll(); // run on mount
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [wordCount]);

  let wordIndex = 0;

  return (
    <div
      ref={containerRef}
      style={{
        // Tall section so scroll has room to work
        minHeight: '200vh',
        padding: '120px 40px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      {/* Sticky inner so text stays visible while scrolling */}
      <div style={{
        position: 'sticky',
        top: '20vh',
        maxWidth: '900px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.25em 0.35em',
          lineHeight: 1.05,
        }}>
          {content.map((word, i) => {
            // Line break
            if (word.text === '\n') {
              return <div key={i} style={{ width: '100%' }} />;
            }

            const currentIndex = wordIndex++;
            const isRevealed = prefersReduced ? true : (currentIndex < revealedCount);

            return (
              <motion.span
                key={i}
                animate={{
                  opacity: isRevealed ? 1 : 0,
                  y: isRevealed ? 0 : 12,
                }}
                transition={prefersReduced ? { duration: 0 } : {
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  display: 'inline-block',
                  fontFamily: word.italic
                    ? 'Georgia, serif'
                    : "'Clash Display', sans-serif",
                  fontWeight: word.italic ? 400 : 700,
                  fontStyle: word.italic ? 'italic' : 'normal',
                  fontSize: 'clamp(36px, 6vw, 88px)',
                  color: word.green ? '#39ff7a' : '#f0ffe8',
                  letterSpacing: '-0.02em',
                  willChange: 'opacity, transform',
                }}
              >
                {word.text}
              </motion.span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const lines = [
  "The first carbon platform",
  "built for how India actually lives.",
  "Not adapted. Built.",
];

const HeroText = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: '-10% 0px' 
  });

  return (
    <div ref={ref} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      marginTop: '24px',
      marginBottom: '24px',
    }}>
      {lines.map((line, i) => (
        <div key={i} style={{ overflow: 'hidden' }}>
          <motion.p
            initial={{ y: '110%', opacity: 0 }}
            animate={isInView 
              ? { y: '0%', opacity: 1 } 
              : { y: '110%', opacity: 0 }
            }
            transition={{
              duration: 0.7,
              delay: 0.15 * i,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '18px',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.92)',
              fontWeight: 500,
              margin: 0,
            }}
          >
            {line}
          </motion.p>
        </div>
      ))}
    </div>
  );
};

const HeroHeadline = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-10% 0px'
  });

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.h1
        initial={{ y: '110%' }}
        animate={isInView ? { y: '0%' } : { y: '110%' }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        style={{
          display: 'block',
          fontFamily: "'Clash Display', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(80px, 14vw, 260px)',
          lineHeight: 0.8,
          color: '#f5f0e8',
          letterSpacing: '-0.02em',
          margin: 0,
          whiteSpace: 'nowrap',
          position: 'relative',
        }}
      >
        PRAKRITI
        <span style={{
          position: 'absolute',
          top: '0.05em',
          left: '100%',
          marginLeft: '8px',
          fontSize: '0.35em',
          color: '#f5f0e8',
          lineHeight: 1,
        }}>*</span>
      </motion.h1>
    </div>
  );
};

const FeatureBullets = ({ bullets }: { bullets: string[] }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-10% 0px'
  });

  return (
    <ul ref={ref} style={{
      listStyle: 'none',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {bullets.map((b, i) => (
        <li key={b} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '13px',
          fontWeight: 300,
          color: 'rgba(240,237,230,0.45)',
          lineHeight: 1.5,
        }}>
          <span style={{ color: '#39ff7a', flexShrink: 0, marginTop: '2px' }}>✓</span>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <motion.p
              initial={{ y: '110%', opacity: 0 }}
              animate={isInView 
                ? { y: '0%', opacity: 1 } 
                : { y: '110%', opacity: 0 }
              }
              transition={{
                duration: 0.6,
                delay: 0.1 * i,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                margin: 0,
                color: 'rgba(240,237,230,0.45)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '13px',
                fontWeight: 300,
                lineHeight: 1.5,
              }}
            >
              {b}
            </motion.p>
          </div>
        </li>
      ))}
    </ul>
  );
};

/* ─── COMPONENT ─────────────────────────────── */

export default function HomePage() {
  const statsRef = useRef<HTMLElement>(null);
  const [counts, setCounts] = useState([0, 0, 0]);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    /* Scroll reveal */
    const ro = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          ro.unobserve(e.target);
        }
      }),
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
    );
    document.querySelectorAll('.sr').forEach(el => ro.observe(el));

    return () => { ro.disconnect(); };
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFired(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -50px 0px' }
    );
    
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsRef.current]);

  useEffect(() => {
    if (!statsRef.current) return;
    const rect = statsRef.current.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setFired(true);
    }
  }, []);

  useEffect(() => {
    if (!fired) return;
    const targets = STATS.map(s => s.end);
    const dur = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setCounts(targets.map(v => Math.round(v * e)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [fired]);



  /* ─ shared styles ─ */
  const eyebrow = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '11px',
    letterSpacing: '0.18em',
    color: 'rgba(240,237,230,0.35)',
    textTransform: 'uppercase' as const,
  };

  return (
    <main style={{ background: '#080808', overflowX: 'hidden' }}>

      {/* ═══════════════════════════════════════
          SECTION 1 — HERO (video background)
          Exact ECSoC layout:
          - Video fills 100vh
          - Pill nav floats at top (rendered by Navbar)
          - Content sits at BOTTOM of viewport
          - Left: massive brand name
          - Right: description + CTA button
      ═══════════════════════════════════════ */}
      {/* Bezel frame wrapper */}
      <div style={{
        background: '#080808',
        padding: '24px',
        minHeight: '100vh',
        borderRadius: '40px',
        position: 'relative',
      }}>
        {/* Floating inline navbar */}
        <Navbar inline={true} />

        <section style={{
          position: 'relative',
          borderRadius: '40px',
          overflow: 'hidden',
          height: 'calc(100vh - 48px)',
          background: '#111',
        }}>

          {/* VIDEO — local file and CDN fallbacks */}
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%',
              filter: 'brightness(0.35) saturate(0.4) sepia(0.3)',
              zIndex: 0,
            }}
          >
            <source src="/hero.mp4" type="video/mp4" />
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sun-529-large.mp4"
              type="video/mp4"
            />
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-fog-over-the-mountains-1435-large.mp4"
              type="video/mp4"
            />
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-river-in-the-jungle-18098-large.mp4"
              type="video/mp4"
            />
          </video>

          {/* Warm color overlay ON TOP of video */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(20,12,5,0.3) 0%, rgba(5,10,5,0.7) 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }} />

          {/* LEFT — Massive brand name positioned absolutely */}
          <div style={{
            position: 'absolute',
            bottom: '-0.15em',
            left: '0px',
            zIndex: 2,
            maxWidth: '65%',
          }}>
            <HeroHeadline />
          </div>

          {/* RIGHT — Description + CTA positioned absolutely */}
          <div style={{
            position: 'absolute',
            bottom: '80px',
            right: '60px',
            maxWidth: '280px',
            textAlign: 'left',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}>
            <HeroText />

            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '16px',
                background: '#000000',
                color: '#f5f0e8',
                fontFamily: "'Clash Display', sans-serif",
                fontWeight: 600,
                fontSize: '17px',
                letterSpacing: '-0.01em',
                padding: '10px 10px 10px 28px',
                borderRadius: '100px',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1a1a1a')}
              onMouseLeave={e => (e.currentTarget.style.background = '#000000')}
            >
              Start budgeting
              <span style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#111111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 11H18M18 11L12 5M18 11L12 17" stroke="#f5f0e8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Link>
          </div>

          {/* Scroll hint */}
          <div style={{
            position: 'absolute', bottom: '18px',
            left: '50%', transform: 'translateX(-50%)',
            zIndex: 10, display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: '4px',
          }}>
            <span style={{
              ...eyebrow,
              fontSize: '9px',
              letterSpacing: '0.22em',
              color: 'rgba(245,240,232,0.35)',
            }}>scroll</span>
            <span style={{
              color: 'rgba(245,240,232,0.35)',
              fontSize: '13px',
              animation: 'bounce 2.2s ease-in-out infinite',
            }}>↓</span>
          </div>
        </section>
      </div>

      <div style={{
        width: '100%',
        height: '1px',
        background: 'linear-gradient(to right, transparent, rgba(57,255,122,0.2), transparent)',
        margin: '0 auto',
      }} />

      {/* ═══════════════════════════════════════
          SECTION 2 — MISSION / ABOUT
          Full black section. Centered huge text.
          Mix of Syne (upright) + Fraunces (italic).
          Exact clone of ECSoC "We are Elite Coders" section.
      ═══════════════════════════════════════ */}
      <section style={{
        background: '#080808',
        padding: '140px 80px',
        textAlign: 'center',
      }}>
        {/* Label */}
        <div className="sr" style={{ ...eyebrow, marginBottom: '56px', display: 'block' }}>
          [ PRAKRITI ]
        </div>

        <WordRevealParagraph />

        {/* Sub text */}
        <div className="sr sr-d2" style={{
          maxWidth: '640px',
          margin: '0 auto 48px',
        }}>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '17px',
            fontWeight: 300,
            lineHeight: 1.75,
            color: 'rgba(240,237,230,0.38)',
          }}>
            Over a carbon journey, you collaborate with real India data
            to build a personal climate identity. Together, we foster a
            generation of conscious consumers that bridge awareness with
            action — pushing the boundaries of what individual impact
            can achieve.
          </p>
        </div>

        <div className="sr sr-d3" style={{
          maxWidth: '640px',
          margin: '0 auto',
        }}>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '17px',
            fontWeight: 300,
            lineHeight: 1.75,
            color: 'rgba(240,237,230,0.22)',
          }}>
            India-first carbon intelligence for conscious decision-makers.
          </p>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '17px',
            fontWeight: 300,
            lineHeight: 1.75,
            color: 'rgba(240,237,230,0.16)',
            marginTop: '4px',
          }}>
            Built on real data. Powered by Gemini.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 — FEATURES BENTO GRID
          Exact ECSoC layout:
          Left: large image card with caption
          Right: 3 dark cards stacked in a row
          Above: centered heading
      ═══════════════════════════════════════ */}
      <section style={{
        background: '#080808',
        padding: '0 60px 100px',
      }}>
        {/* Centered heading */}
        <div className="sr" style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{
            fontFamily: "'Clash Display', sans-serif",
            fontWeight: 600,
            fontSize: 'clamp(28px, 4vw, 48px)',
            color: '#f0ede6',
            letterSpacing: '-0.02em',
            marginBottom: '10px',
          }}>
            Carbon intelligence for conscious India.
          </h2>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '17px',
            fontWeight: 300,
            color: 'rgba(240,237,230,0.35)',
          }}>
            Built on real data. Powered by Gemini.
          </p>
        </div>

        {/* Bento grid */}
        <div className="sr sr-d1" style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr 1fr 1fr',
          gap: '12px',
          maxWidth: '1240px',
          margin: '0 auto',
        }}>

          {/* LEFT large image card */}
          <div style={{
            background: '#111',
            borderRadius: '16px',
            border: '1px solid rgba(240,237,230,0.06)',
            overflow: 'hidden',
            position: 'relative',
            minHeight: '420px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '28px',
          }}>
            {/* Background image — Western Ghats forest */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80&fit=crop)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.5) saturate(0.7)',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.1) 60%)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{
                fontFamily: "'Clash Display', sans-serif",
                fontWeight: 600,
                fontSize: '22px',
                color: '#f0ede6',
                lineHeight: 1.25,
              }}>
                Reduce. Track. Act.
              </p>
            </div>
          </div>

          {/* RIGHT 3 cards */}
          {FEATURES.map((feat, i) => (
            <div key={feat.num} style={{
              background: '#111110',
              borderRadius: '16px',
              border: '1px solid rgba(240,237,230,0.06)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
            }}>
              {/* Icon + number row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}>
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(57,255,122,0.08)',
                  border: '1px solid rgba(57,255,122,0.15)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '18px',
                }}>
                  {i === 0 ? '🌿' : i === 1 ? '📷' : '🇮🇳'}
                </div>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: 'rgba(240,237,230,0.2)',
                }}>
                  {feat.num}
                </span>
              </div>

              {/* Title */}
              <h3 style={{
                fontFamily: "'Clash Display', sans-serif",
                fontWeight: 600,
                fontSize: '20px',
                color: '#f0ede6',
                letterSpacing: '-0.01em',
                marginBottom: '20px',
              }}>
                {feat.title}
              </h3>

              {/* Bullets */}
              <FeatureBullets bullets={feat.bullets} />

              {/* Learn more */}
              <Link href={feat.link} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '13px',
                color: 'rgba(240,237,230,0.35)',
                textDecoration: 'none',
                marginTop: '28px',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#f0ede6'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,237,230,0.35)'}
              >
                Learn more ↗
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 4 — TIMELINE
          Exact ECSoC: horizontal 3-phase timeline
          with git branch icons and phase cards
      ═══════════════════════════════════════ */}
      <section style={{
        background: '#080808',
        padding: '100px 60px',
        borderTop: '1px solid rgba(240,237,230,0.05)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Header */}
          <div className="sr" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '64px',
            gap: '40px',
          }}>
            <div>
              <div style={{ ...eyebrow, marginBottom: '16px', display: 'block' }}>
                [ CARBON JOURNEY 2026 ]
              </div>
              <h2 style={{
                fontFamily: "'Clash Display', sans-serif",
                fontWeight: 600,
                fontSize: 'clamp(36px, 5vw, 64px)',
                color: '#f0ede6',
                letterSpacing: '-0.025em',
                lineHeight: 1,
              }}>
                Your{' '}
                <em style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                }}>
                  Journey.
                </em>
              </h2>
            </div>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '15px',
              fontWeight: 300,
              color: 'rgba(240,237,230,0.38)',
              maxWidth: '360px',
              lineHeight: 1.7,
              marginTop: '8px',
            }}>
              A structured carbon reduction journey. Track your emissions
              from first scan to ecosystem milestone and personal climate
              identity.
            </p>
          </div>

          {/* Timeline */}
          <div style={{ position: 'relative' }}>

            {/* Horizontal line */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: 0, right: 0,
              height: '1px',
              background: 'rgba(240,237,230,0.08)',
            }} />

            {/* Three phases */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '16px',
            }}>
              {PHASES.map((phase, i) => (
                <div key={phase.phase} className={`sr sr-d${i + 1}`}>

                  {/* Git-like node on timeline */}
                  <div style={{
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    border: `1px solid ${i === 0 ? '#f0ede6' : 'rgba(240,237,230,0.18)'}`,
                    background: i === 0 ? 'rgba(240,237,230,0.06)' : '#080808',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <div style={{
                      width: '8px', height: '8px',
                      borderRadius: '50%',
                      background: i === 0 ? '#f0ede6' : 'rgba(240,237,230,0.25)',
                    }} />
                  </div>

                  {/* Branch label */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1px solid rgba(240,237,230,0.09)',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    marginBottom: '20px',
                  }}>
                    <span style={{ color: 'rgba(240,237,230,0.3)', fontSize: '11px' }}>⎇</span>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      color: 'rgba(240,237,230,0.35)',
                      letterSpacing: '0.04em',
                    }}>
                      {phase.branch}
                    </span>
                  </div>

                  {/* Phase card */}
                  <div style={{
                    background: '#111110',
                    border: '1px solid rgba(240,237,230,0.07)',
                    borderRadius: '12px',
                    padding: '24px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '14px',
                    }}>
                      <span style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: 'rgba(240,237,230,0.3)',
                        letterSpacing: '0.1em',
                      }}>
                        {phase.phase}
                      </span>
                      <span style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: 'rgba(240,237,230,0.2)',
                      }}>
                        {phase.dates}
                      </span>
                    </div>
                    <h3 style={{
                      fontFamily: "'Clash Display', sans-serif",
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#f0ede6',
                      marginBottom: '10px',
                      letterSpacing: '-0.01em',
                    }}>
                      {phase.title}
                    </h3>
                    <p style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '13px',
                      fontWeight: 300,
                      color: 'rgba(240,237,230,0.38)',
                      lineHeight: 1.65,
                    }}>
                      {phase.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5 — DIFF (FULL WIDTH)
          Critical: NOT a card. Full page width.
          Eyebrow → H2 → full-width diff viewer.
          Exact clone of ECSoC why_ecsoc.diff section.
      ═══════════════════════════════════════ */}
      <section style={{
        background: '#080808',
        borderTop: '1px solid rgba(240,237,230,0.05)',
        padding: '100px 60px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Header — same as ECSoC: eyebrow + mixed title + description */}
          <div className="sr" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '64px',
            gap: '40px',
          }}>
            <div>
              <div style={{ ...eyebrow, marginBottom: '16px', display: 'block' }}>
                [ SYSTEM COMPARATIVES ]
              </div>
              <h2 style={{
                fontFamily: "'Clash Display', sans-serif",
                fontWeight: 600,
                fontSize: 'clamp(36px, 5vw, 64px)',
                color: '#f0ede6',
                letterSpacing: '-0.025em',
                lineHeight: 1,
              }}>
                Why Prakriti is{' '}
                <em style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                }}>
                  Different.
                </em>
              </h2>
            </div>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '15px',
              fontWeight: 300,
              color: 'rgba(240,237,230,0.38)',
              maxWidth: '380px',
              lineHeight: 1.7,
              marginTop: '8px',
            }}>
              Compare Prakriti's approach with generic carbon trackers.
              We prioritize India-specific data over theoretical global
              averages.
            </p>
          </div>

          {/* Diff filename bar — full width */}
          <div className="sr sr-d1" style={{
            borderTop: '1px solid rgba(240,237,230,0.07)',
            borderLeft: '1px solid rgba(240,237,230,0.07)',
            borderRight: '1px solid rgba(240,237,230,0.07)',
            borderRadius: '12px 12px 0 0',
            background: 'rgba(240,237,230,0.02)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ color: 'rgba(240,237,230,0.25)', fontSize: '13px' }}>≡</span>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: 'rgba(240,237,230,0.28)',
              letterSpacing: '0.04em',
            }}>
              india.carbon.diff
            </span>
          </div>

          {/* Diff content — all 4 sections */}
          <div className="sr sr-d2" style={{
            border: '1px solid rgba(240,237,230,0.07)',
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden',
          }}>
            {DIFFS.map((diff, i) => (
              <div
                key={diff.id}
                style={{
                  padding: '36px 28px',
                  borderBottom: i < DIFFS.length - 1
                    ? '1px solid rgba(240,237,230,0.05)'
                    : 'none',
                }}
              >
                {/* Label row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '20px',
                }}>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: 'rgba(240,237,230,0.18)',
                  }}>
                    {diff.id}
                  </span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: 'rgba(240,237,230,0.35)',
                    letterSpacing: '0.06em',
                  }}>
                    {diff.label}
                  </span>
                </div>

                {/* Minus line */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0',
                  borderLeft: '2px solid rgba(255,80,80,0.4)',
                  marginBottom: '8px',
                  padding: '11px 20px',
                  background: 'rgba(255,80,80,0.06)',
                }}>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: 'rgba(255,120,120,0.75)',
                  }}>
                    − {diff.minus}
                  </span>
                </div>

                {/* Plus line */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  borderLeft: '2px solid rgba(57,255,122,0.4)',
                  padding: '11px 20px',
                  background: 'rgba(57,255,122,0.05)',
                }}>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: 'rgba(57,255,122,0.8)',
                  }}>
                    + {diff.plus}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Status bar — bottom of diff, ECSoC has this */}
          <div className="sr sr-d3" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 24px',
            border: '1px solid rgba(240,237,230,0.07)',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            background: 'rgba(240,237,230,0.01)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#39ff7a', fontSize: '10px' }}>⎇</span>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: 'rgba(240,237,230,0.2)',
              }}>
                UTF-8 · diffmode
              </span>
            </div>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              color: 'rgba(240,237,230,0.15)',
            }}>
              line 1-20 of 20
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 6 — STATS
      ═══════════════════════════════════════ */}
      <section
        ref={statsRef}
        style={{
          background: '#080808',
          borderTop: '1px solid rgba(240,237,230,0.05)',
          padding: '80px 60px',
        }}
      >
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
        }}>
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && (
                <div style={{
                  position: 'absolute',
                  /* handled by grid gap */
                }} />
              )}
              <div style={{
                textAlign: 'center',
                padding: '40px',
                borderLeft: i > 0 ? '1px solid rgba(240,237,230,0.06)' : 'none',
              }}>
                <div style={{
                  fontFamily: "'Clash Display', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(52px, 7vw, 88px)',
                  color: '#f0ede6',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  marginBottom: '10px',
                }}>
                  {counts[i]}{stat.suffix}
                </div>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '13px',
                  fontWeight: 300,
                  color: 'rgba(240,237,230,0.3)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  {stat.label}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 7 — TERMS ACCORDION + FOOTER
          Exact ECSoC footer structure:
          Accordion → 4-col footer → bottom bar
      ═══════════════════════════════════════ */}

      {/* Terms accordion */}
      <TermsAccordion />

      {/* Footer */}
      <footer style={{
        background: '#080808',
        borderTop: '1px solid rgba(240,237,230,0.06)',
        padding: '64px 60px 0',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '48px',
          maxWidth: '1200px',
          margin: '0 auto',
          paddingBottom: '64px',
          borderBottom: '1px solid rgba(240,237,230,0.06)',
        }}>

          {/* Col 1 — Brand */}
          <div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#f0ede6',
              marginBottom: '16px',
            }}>
              PRAKRITI<span style={{ color: '#39ff7a' }}>*</span>
            </div>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '13px',
              fontWeight: 300,
              color: 'rgba(240,237,230,0.32)',
              lineHeight: 1.7,
              maxWidth: '220px',
            }}>
              Empowering the next generation of climate-conscious Indians
              through real data and behavioural science.
            </p>
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(240,237,230,0.38)',
              marginBottom: '20px',
            }}>
              Quick Links
            </div>
            {[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Track Activity', href: '/track' },
              { label: 'Insights', href: '/insights' },
              { label: 'Methodology', href: '/methodology' },
              { label: 'About Prakriti', href: '/about' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                display: 'block',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: 300,
                color: 'rgba(240,237,230,0.45)',
                textDecoration: 'none',
                marginBottom: '12px',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#f0ede6'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,237,230,0.45)'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Col 3 — Community */}
          <div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(240,237,230,0.38)',
              marginBottom: '20px',
            }}>
              Community
            </div>
            {[
              { label: 'GitHub Repository', href: 'https://github.com/akshayjadhav237237-cmd/Prakriti' },
              { label: 'Discord Server', href: 'https://discord.gg/prakriti' },
              { label: 'Climate Forums', href: 'https://community.prakriti.org' },
              { label: 'Open Issues', href: 'https://github.com/akshayjadhav237237-cmd/Prakriti/issues' },
            ].map(link => (
              <Link key={link.label} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} style={{
                display: 'block',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: 300,
                color: 'rgba(240,237,230,0.45)',
                textDecoration: 'none',
                marginBottom: '12px',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#f0ede6'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,237,230,0.45)'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Col 4 — Contact Us */}
          <div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(240,237,230,0.38)',
              marginBottom: '20px',
            }}>
              Contact Us
            </div>
            {[
              { label: 'Email Support', href: 'mailto:code@prakriti.org' },
              { label: 'Student Workspace', href: '/dashboard' },
              { label: 'Coordinator Panel', href: '/admin' },
            ].map(link => (
              <Link key={link.label} href={link.href} style={{
                display: 'block',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: 300,
                color: 'rgba(240,237,230,0.45)',
                textDecoration: 'none',
                marginBottom: '12px',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#f0ede6'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,237,230,0.45)'}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          maxWidth: '1200px',
          margin: '48px auto 0',
          padding: '24px 0 40px',
          borderTop: '1px solid rgba(240,237,230,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '12px',
            color: 'rgba(240,237,230,0.25)',
          }}>
            &copy; 2026 Prakriti Project. All rights reserved.
          </span>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: 'rgba(240,237,230,0.25)',
          }}>
            Open Source
          </span>
        </div>
      </footer>
    </main>
  );
}

function TermsAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = [
    {
      num: '01',
      title: 'Carbon budgeting methodology.',
      content: "Our allocation model uses a weekly carbon envelope of 38.46 kg CO2e, derived from India's fair-share per-capita carbon allocation aligned with the 1.5°C Paris Agreement targets."
    },
    {
      num: '02',
      title: 'India-first grid data sources.',
      content: 'All grid emission calculations use the Central Electricity Authority (CEA) grid baseline factor of 0.71 kg CO2e/kWh. Transportation figures are calculated from ARAI road transport coefficients.'
    },
    {
      num: '03',
      title: 'Gemini Vision OCR privacy.',
      content: 'Scanning electricity bills, Swiggy orders, and fuel receipts processes images locally or via secure API endpoints. No personal data, addresses, or payment info is ever stored.'
    },
    {
      num: '04',
      title: 'Behavioural model intentions.',
      content: 'Prakriti is built on identity-based habit formation. Weekly envelopes encourage proactive allocation, preventing retroactive guilt and promoting long-term behavioral adaptation.'
    }
  ];

  return (
    <section style={{
      background: '#080808',
      padding: '100px 60px',
      borderTop: '1px solid rgba(240,237,230,0.05)'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="sr" style={{ marginBottom: '56px', textAlign: 'center' }}>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.18em',
            color: 'rgba(240,237,230,0.35)',
            textTransform: 'uppercase'
          }}>
            [ TERMS & POLICIES ]
          </span>
          <h2 style={{
            fontFamily: "'Clash Display', sans-serif",
            fontWeight: 600,
            fontSize: 'clamp(28px, 4vw, 48px)',
            color: '#f0ede6',
            letterSpacing: '-0.02em',
            marginTop: '12px'
          }}>
            Cohort Rules &amp;{' '}
            <em style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic',
              fontWeight: 300
            }}>
              Guidelines.
            </em>
          </h2>
        </div>

        <div className="sr sr-d1" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.num}
                style={{
                  background: '#111110',
                  border: '1px solid rgba(240,237,230,0.06)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s'
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '24px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '13px',
                      color: isOpen ? '#39ff7a' : 'rgba(240,237,230,0.25)'
                    }}>
                      {item.num}
                    </span>
                    <span style={{
                      fontFamily: "'Clash Display', sans-serif",
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#f0ede6',
                      letterSpacing: '-0.01em'
                    }}>
                      {item.title}
                    </span>
                  </div>
                  <span style={{
                    color: 'rgba(240,237,230,0.4)',
                    fontSize: '20px',
                    fontFamily: 'monospace',
                    transform: isOpen ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.2s',
                    display: 'inline-block'
                  }}>
                    +
                  </span>
                </button>
                <div style={{
                  maxHeight: isOpen ? '200px' : '0',
                  opacity: isOpen ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease',
                  padding: isOpen ? '0 28px 28px 76px' : '0 28px 0 76px'
                }}>
                  <p style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '14px',
                    fontWeight: 300,
                    lineHeight: 1.7,
                    color: 'rgba(240,237,230,0.45)'
                  }}>
                    {item.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}