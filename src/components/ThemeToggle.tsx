'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme === 'system' ? resolvedTheme : theme) : 'dark';

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('prakriti_theme', nextTheme);

    // Apply styles to documentElement
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.backgroundColor = '#080808';
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f5f0e8';
    }
  };

  useEffect(() => {
    if (mounted) {
      const activeTheme = theme === 'system' ? resolvedTheme : theme;
      if (activeTheme === 'dark') {
        document.documentElement.style.backgroundColor = '#080808';
      } else if (activeTheme === 'light') {
        document.documentElement.style.backgroundColor = '#f5f0e8';
      }
    }
  }, [mounted, theme, resolvedTheme]);

  if (!mounted) {
    return (
      <button
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted, rgba(240, 237, 230, 0.42))',
        }}
        aria-label="Toggle Theme"
      >
        <div style={{ width: '20px', height: '20px' }} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        color: 'var(--text)',
        transition: 'background-color 0.2s, color 0.2s',
      }}
      aria-label="Toggle Theme"
    >
      {currentTheme === 'dark' ? (
        <Sun size={20} />
      ) : (
        <Moon size={20} />
      )}
    </button>
  );
}
