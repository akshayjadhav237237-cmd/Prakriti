const fs = require('fs');
const path = require('path');

const root = `d:\\Akshay final folder\\Antigravity\\Virtual Prompt wars CH3`;

// Patch Dashboard Page
function patchDashboard() {
  const dest = path.join(root, 'src', 'app', 'dashboard', 'page.tsx');
  if (!fs.existsSync(dest)) {
    console.error(`Dashboard file not found: ${dest}`);
    return;
  }
  let content = fs.readFileSync(dest, 'utf8');
  const originalHadCRLF = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  const replacements = [
    {
      search: `      {/* TOP SECTION: Weekly Carbon Budget Bar */}
      <section className="bg-surface border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden">`,
      replace: `      {/* TOP SECTION: Weekly Carbon Budget Bar */}
      <section className="modern-card p-6 relative overflow-hidden">`
    },
    {
      search: `        {/* Master Segmented Progress Bar */}
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
                  style={{ width: \`\${segmentWidth}%\` }}
                >
                  <div 
                    className={\`h-full rounded-sm \${details.colorClass} opacity-85 transition-all duration-500\`}
                    style={{ width: \`\${Math.min(100, innerWidth)}%\` }}
                  />
                  <div className="absolute inset-0 bg-surface/20 hover:bg-transparent transition-colors pointer-events-none" />
                </div>
              );
            })}
          </div>`,
      replace: `        {/* Master Segmented Progress Bar */}
        <div className="space-y-4">
          <div className="h-5 w-full bg-background border border-border/80 rounded-full flex overflow-hidden p-0.5 relative">
            {envelopes.map((env) => {
              const details = getEnvelopeDetails(env.spent, env.max);
              const segmentWidth = (env.max / totalBudgetMax) * 100;
              const innerWidth = (env.spent / env.max) * 100;

              return (
                <div 
                  key={env.id} 
                  className="h-full border-r border-background/25 last:border-0 relative flex items-center justify-center"
                  style={{ width: \`\${segmentWidth}%\` }}
                >
                  <div 
                    className={\`absolute inset-y-0 left-0 rounded-sm \${details.colorClass} opacity-85 transition-all duration-500\`}
                    style={{ width: \`\${Math.min(100, innerWidth)}%\` }}
                  />
                  <span className="absolute z-10 text-[9px] font-bold text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none">
                    <span className="inline sm:hidden">{env.name.charAt(0)}</span>
                    <span className="hidden sm:inline">{env.name}</span>
                  </span>
                  <div className="absolute inset-0 bg-surface/20 hover:bg-transparent transition-colors pointer-events-none" />
                </div>
              );
            })}
          </div>`
    },
    {
      search: `          {/* Individual envelopes display */}
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
                    
                    <span className={\`px-2 py-0.5 text-[9px] font-bold border rounded-md uppercase tracking-wider \${details.textClass}\`}>
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
                        className={\`h-full \${details.colorClass} transition-all duration-500\`}
                        style={{ width: \`\${Math.min(100, (env.spent / env.max) * 100)}%\` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>`,
      replace: `          {/* Individual envelopes display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            {envelopes.map((env) => {
              const details = getEnvelopeDetails(env.spent, env.max);
              const Icon = env.icon;
              const statusKey = details.status === "Critical" ? "critical" : details.status === "Warning" ? "warning" : "healthy";
              return (
                <div 
                  key={env.id}
                  className="bg-background/40 border border-border/60 hover:border-border rounded-xl p-3 sm:p-3.5 flex flex-col justify-between space-y-2 sm:space-y-3 transition-all max-sm:h-[80px]"
                >
                  {/* Compact Mobile Layout */}
                  <div className="flex sm:hidden items-center justify-between w-full h-full">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-surface text-foreground/80">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-foreground/90">{env.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-foreground/70">
                        <strong className="text-foreground/90 font-sans">{env.spent.toFixed(0)}</strong>/{env.max} <span className="text-[9px]">kg</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Full width bar below on mobile */}
                  <div className="sm:hidden w-full envelope-progress-bg">
                    <div 
                      className={\`envelope-progress-fill \${statusKey}\`}
                      style={{ width: \`\${Math.min(100, (env.spent / env.max) * 100)}%\` }}
                    />
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-surface text-foreground/80">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground/90">{env.name}</h3>
                        <span className="text-[10px] text-foreground/50">{env.desc}</span>
                      </div>
                    </div>
                    
                    <span className={\`px-2 py-0.5 text-[9px] font-bold border rounded-md uppercase tracking-wider \${details.textClass}\`}>
                      {details.status}
                    </span>
                  </div>

                  <div className="hidden sm:block space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-foreground/60">
                      <span>Spent: <strong className="text-foreground/90 font-sans">{env.spent.toFixed(1)}</strong></span>
                      <span>Allocated: <strong className="text-foreground/90 font-sans">{env.max}</strong></span>
                    </div>
                    <div className="envelope-progress-bg">
                      <div 
                        className={\`envelope-progress-fill \${statusKey}\`}
                        style={{ width: \`\${Math.min(100, (env.spent / env.max) * 100)}%\` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>`
    },
    {
      search: `              <div className="w-full h-40">`,
      replace: `              <div className="w-full h-28 sm:h-40">`
    },
    {
      search: `            {/* Horizontal Bar Chart */}
            <div className="w-full h-64">`,
      replace: `            {/* Horizontal Bar Chart */}
            <div className="w-full h-48 sm:h-64">`
    },
    {
      search: `      {/* MIDDLE SECTION: Prakriti Companion card */}
      <section className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12">
        {/* Parallax Canopy Viewport */}
        <div className="lg:col-span-7 h-64 sm:h-80 lg:h-96 relative misty-shola-bg border-b lg:border-b-0 lg:border-r border-border">`,
      replace: `      {/* MIDDLE SECTION: Prakriti Companion card */}
      <section className="modern-card overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Parallax Canopy Viewport */}
        <div className="lg:col-span-7 h-[200px] sm:h-80 lg:h-96 relative misty-shola-bg border-b lg:border-b-0 lg:border-r border-border">`
    },
    {
      search: `            <motion.svg 
              width="140" 
              height="140" 
              viewBox="0 0 200 200" 
              className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"`,
      replace: `            <motion.svg 
              width="140" 
              height="140" 
              viewBox="0 0 200 200" 
              className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] w-[120px] h-[120px] sm:w-[140px] sm:h-[140px]"`
    },
    {
      search: `          {activeAdventure && activeAdventure.completed && !activeAdventure.claimed ? (
            <button
              onClick={claimReward}
              className={\`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all bg-accent text-background hover:brightness-110 active:scale-[0.98] shadow-lg shadow-accent/20 min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus:outline-none \${shouldReduceMotion ? "" : "animate-pulse"}\`}
            >
              <span>Claim Adventure Reward (+{activeAdventure.reward_pebbles} Pebbles)</span>
              <Sparkles className="w-4 h-4 fill-current text-background" />
            </button>
          ) : (
            <button
              onClick={startAdventure}
              disabled={adventureActive}
              className={\`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus:outline-none \${
                adventureActive 
                  ? "bg-border text-foreground/30 cursor-not-allowed" 
                  : "bg-primary text-background hover:brightness-110 active:scale-[0.98] shadow-lg shadow-primary/10"
              }\`}
            >
              <span>{adventureActive ? \`Chiku is exploring (\${timeLeft}s remaining)...\` : "Send Chiku on adventure"}</span>
              {!adventureActive && <ArrowRight className="w-4 h-4" />}
            </button>
          )}`,
      replace: `          {activeAdventure && activeAdventure.completed && !activeAdventure.claimed ? (
            <button
              onClick={claimReward}
              className={\`btn-primary w-full text-sm flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none bg-accent hover:brightness-110 \${shouldReduceMotion ? "" : "animate-pulse"}\`}
            >
              <span>Claim Adventure Reward (+{activeAdventure.reward_pebbles} Pebbles)</span>
              <Sparkles className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={startAdventure}
              disabled={adventureActive}
              className={\`w-full text-sm flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none \${
                adventureActive 
                  ? "bg-border text-foreground/30 cursor-not-allowed py-3 px-4 rounded-xl font-bold" 
                  : "btn-primary w-full"
              }\`}
            >
              <span>{adventureActive ? \`Chiku is exploring (\${timeLeft}s remaining)...\` : "Send Chiku on adventure"}</span>
              {!adventureActive && <ArrowRight className="w-4 h-4" />}
            </button>
          )}`
    },
    {
      search: `        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
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
          </button>`,
      replace: `        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* 1. Receipt Scanner */}
          <button 
            onClick={() => router.push("/scan")}
            aria-label="Open Receipt Scanner"
            className="group modern-card p-3.5 sm:p-5 cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 flex flex-col justify-between h-36 sm:h-40 w-full text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[44px]"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors">Receipt Scanner</h4>
                <p className="hidden sm:block text-xs text-foreground/50 mt-1">Scan transport or grocery bills to calculate carbon footprint using Gemini.</p>
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
            className="group modern-card p-3.5 sm:p-5 cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 flex flex-col justify-between h-36 sm:h-40 w-full text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[44px]"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors">Log Footprint</h4>
                <p className="hidden sm:block text-xs text-foreground/50 mt-1">Manually enter a vehicle ride, flight, electricity bill, or diet item.</p>
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
            className="group modern-card p-3.5 sm:p-5 cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 flex flex-col justify-between h-36 sm:h-40 w-full text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[44px]"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors">Insights & Path</h4>
                <p className="hidden sm:block text-xs text-foreground/50 mt-1">Compare your weekly averages against India&apos;s target trajectory.</p>
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
            className="group modern-card p-3.5 sm:p-5 cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 flex flex-col justify-between h-36 sm:h-40 w-full text-left focus-visible:ring-2 focus-visible:ring-primary focus:outline-none min-h-[44px]"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors">Carbon Budget</h4>
                <p className="hidden sm:block text-xs text-foreground/50 mt-1">Allocate carbon envelopes and modify weekly carbon targets.</p>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-bold text-primary group-hover:underline uppercase tracking-wider">
              <span>Manage Budget</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>`
    }
  ];

  for (let i = 0; i < replacements.length; i++) {
    const rep = replacements[i];
    const searchStr = rep.search.replace(/\r\n/g, '\n');
    const replaceStr = rep.replace.replace(/\r\n/g, '\n');

    if (!content.includes(searchStr)) {
      console.warn(`Warning in dashboard replacement index \${i}: Pattern not found.`);
      if (i === 7) {
        content = content.replace(/\{activeAdventure && activeAdventure\.completed[\s\S]+?\}\s*<\/button\>\s*\)\s*:\s*\([\s\S]+?\}\s*<\/button\>\s*\)\s*\}/, replaceStr);
      }
    } else {
      content = content.replace(searchStr, replaceStr);
    }
  }

  if (originalHadCRLF) {
    content = content.replace(/\n/g, '\r\n');
  }

  fs.writeFileSync(dest, content, 'utf8');
  console.log("Successfully patched dashboard page!");
}

// Patch Navbar
function patchNavbar() {
  const dest = path.join(root, 'src', 'components', 'Navbar.tsx');
  if (!fs.existsSync(dest)) {
    console.error(`Navbar file not found: ${dest}`);
    return;
  }
  let content = fs.readFileSync(dest, 'utf8');
  const originalHadCRLF = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  const replacements = [
    {
      search: `          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl bg-surface border border-border text-foreground/70 hover:text-primary hover:border-primary/40 transition-all focus-visible:ring-2 focus-visible:ring-primary focus:outline-none flex items-center justify-center min-w-[40px] min-h-[40px]"
            aria-label="Toggle theme"
            title="Toggle theme"
          >`,
      replace: `          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 sm:p-2 rounded-xl bg-surface border border-border text-foreground/70 hover:text-primary hover:border-primary/40 transition-all focus-visible:ring-2 focus-visible:ring-primary focus:outline-none flex items-center justify-center min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px]"
            aria-label="Toggle theme"
            title="Toggle theme"
          >`
    },
    {
      search: `          <div className="flex items-center bg-surface border border-border rounded-lg p-1 min-h-[40px]">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 rounded-md">
              Demo Mode
            </span>`,
      replace: `          <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 sm:p-1 min-h-[36px] sm:min-h-[40px]">
            <span className="px-1.5 sm:px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 rounded-md">
              <span className="hidden sm:inline">Demo Mode</span>
              <span className="sm:hidden">DEMO</span>
            </span>`
    },
    {
      search: `      {/* Mobile Stats Sub-bar (Only shown on small screens when not onboarding & onboarded) */}
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
      )}`,
      replace: `      {/* Mobile Stats Sub-bar (Only shown on small screens when not onboarding & onboarded) */}
      {!isOnboarding && userId && (
        <div className="sm:hidden flex items-center justify-center space-x-4 py-1.5 bg-surface/50 border-t border-border text-[10px]">
          <div className="flex items-center space-x-1 text-foreground/80" title={city}>
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium hidden xs:inline">{city}</span>
          </div>
          <div className="flex items-center space-x-1 text-warm" title={\`\${pebbles} Pebbles\`}>
            <Coins className="w-3.5 h-3.5" />
            <span className="font-semibold hidden xs:inline">{pebbles} Pebbles</span>
            <span className="font-semibold xs:hidden">{pebbles}</span>
          </div>
        </div>
      )}`
    }
  ];

  for (let i = 0; i < replacements.length; i++) {
    const rep = replacements[i];
    const searchStr = rep.search.replace(/\r\n/g, '\n');
    const replaceStr = rep.replace.replace(/\r\n/g, '\n');

    if (!content.includes(searchStr)) {
      console.error(`Error: Search pattern not found for Navbar replacement \${i}`);
      process.exit(1);
    }
    content = content.replace(searchStr, replaceStr);
  }

  if (originalHadCRLF) {
    content = content.replace(/\n/g, '\r\n');
  }

  fs.writeFileSync(dest, content, 'utf8');
  console.log("Successfully patched Navbar!");
}

patchDashboard();
patchNavbar();
console.log("Patches applied successfully!");
