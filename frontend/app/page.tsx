"use client";

import { useEffect, useState } from "react";

type CongestionHotspot = {
  zone: string;
  capacity_percent: number;
};

const ZONES = [
  "Zone A",
  "Zone B",
  "Zone C",
  "Zone D",
  "Zone E",
  "Main Stage"
];

function getCongestionClass(percent: number) {
  if (percent < 60) return "bg-cyan-950/20 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]";
  if (percent < 80) return "bg-purple-950/20 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]";
  return "bg-fuchsia-950/30 border-fuchsia-500/50 shadow-[0_0_30px_rgba(217,70,239,0.3)]";
}

function getCongestionTextClass(percent: number) {
  if (percent < 60) return "text-cyan-400";
  if (percent < 80) return "text-purple-400";
  return "text-fuchsia-400";
}

function getIndicatorColor(percent: number) {
  if (percent < 60) return "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]";
  if (percent < 80) return "bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.9)]";
  return "bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,1)] animate-pulse";
}

function getGridlockText(percent: number) {
  if (percent < 60) return "STABLE / >60m";
  if (percent < 80) return `EST / ${Math.max(1, Math.floor((80 - percent) * 1.5))}m`;
  return "CRITICAL / 0m";
}

export default function StadiumDashboard() {
  const [data, setData] = useState<CongestionHotspot[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoPilot, setAutoPilot] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://miseryfreearena.onrender.com/api/telemetry", {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream"
          },
          body: new Uint8Array([0x00, 0x01])
        });
        
        if (response.ok) {
          const result: CongestionHotspot[] = await response.json();
          setData(result);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error("Failed to fetch telemetry data:", error);
      }
    };

    fetchData(); // Initial fetch
    
    // Poll every 3 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getZoneData = (zoneName: string) => {
    return data.find((d) => d.zone === zoneName) || { zone: zoneName, capacity_percent: 0 };
  };

  const getSafestZone = () => {
    if (!data.length) return "Zone A";
    return data.filter(d => ZONES.includes(d.zone)).reduce((prev, curr) => 
      (prev.capacity_percent < curr.capacity_percent) ? prev : curr
    ).zone;
  };

  const safestZone = getSafestZone();

  return (
    <div className="min-h-screen bg-[#020205] text-neutral-100 font-sans selection:bg-cyan-500/30 flex flex-col items-center py-10 px-4 sm:px-8 overflow-hidden">
      
      {/* Top Cyber-Forensic Bar */}
      <div className="w-full max-w-7xl flex flex-col sm:flex-row justify-between mb-8 pb-4 border-b border-white/5 gap-4">
        {/* Data Efficiency Stats */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-black/60 border border-white/10 rounded-lg px-4 py-2 backdrop-blur-md flex flex-col">
             <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Network Opt</span>
             <span className="text-cyan-400 font-mono text-sm tracking-wide">90% EFFICIENT</span>
          </div>
          <div className="bg-black/60 border border-white/10 rounded-lg px-4 py-2 backdrop-blur-md flex flex-col">
             <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Telemetry Ingress</span>
             <span className="text-purple-400 font-mono text-sm tracking-wide">48 BYTES / PKT</span>
          </div>
        </div>

        {/* Auto-Pilot Toggle */}
        <div className="flex items-center gap-4 bg-black/60 border border-white/10 rounded-lg px-5 py-2 backdrop-blur-md cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setAutoPilot(!autoPilot)}>
           <span className="text-xs text-neutral-400 uppercase tracking-widest font-mono select-none">Auto-Pilot / AI Router</span>
           <button 
             className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${autoPilot ? 'bg-cyan-500' : 'bg-neutral-800'}`}
           >
             <div className={`w-4 h-4 rounded-full bg-white absolute transition-all duration-300 ${autoPilot ? 'left-7 shadow-[0_0_10px_white]' : 'left-1'}`} />
           </button>
        </div>
      </div>

      {/* Header */}
      <header className="mb-12 text-center w-full max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <div className="flex flex-col items-center md:items-start gap-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-600 drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] uppercase">
            ArenaPulse Orchestrator
          </h1>
          <p className="text-neutral-500 font-mono text-xs tracking-[0.3em] uppercase">
            Advanced Autonomous Venue Management
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#05050A] border border-cyan-500/20 rounded-full px-5 py-2.5 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <div className={`w-2 h-2 rounded-full ${lastUpdate ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse' : 'bg-neutral-600'}`}></div>
          <span className="font-mono text-xs text-cyan-100/70 tracking-wider">
            {lastUpdate ? `SYS.SYNC / ${lastUpdate.toLocaleTimeString()}` : 'INITIALIZING...'}
          </span>
        </div>
      </header>

      {/* Grid - 6 Zones */}
      <main className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
        {ZONES.map((zone) => {
          const zoneData = getZoneData(zone);
          const percent = zoneData.capacity_percent;
          const isCritical = percent >= 80;
          const isRerouting = isCritical && autoPilot;
          
          return (
            <div 
              key={zone} 
              className={`
                relative overflow-hidden rounded-2xl border backdrop-blur-2xl p-6
                transition-all duration-700 ease-in-out transform hover:-translate-y-1
                ${getCongestionClass(percent)}
              `}
            >
              {/* Background gradient blur effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

              {/* Status Badge */}
              <div className="absolute top-0 right-0 p-5 flex flex-col gap-2 items-end">
                <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                  <span className={`text-[10px] sm:text-xs font-mono tracking-widest ${getCongestionTextClass(percent)} uppercase`}>
                    VOL: {percent}%
                  </span>
                  <div className={`w-2 h-2 rounded-full ${getIndicatorColor(percent)}`}></div>
                </div>
              </div>
              
              {/* Data Content */}
              <div className="mt-6 mb-4 relative z-10 flex flex-col">
                <h2 className="text-lg sm:text-xl font-black tracking-widest mb-1 text-white/90 uppercase font-mono">{zone}</h2>
                <div className="flex flex-col mt-2">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-1">Time to Gridlock</span>
                  <span className={`text-4xl sm:text-5xl font-black tracking-tighter ${getCongestionTextClass(percent)} drop-shadow-lg font-mono`}>
                    <span className="inline-block transition-all duration-500 tabular-nums">
                      {getGridlockText(percent)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Active Rerouting Banner */}
              <div className={`mt-4 h-12 rounded-lg border border-fuchsia-500/50 bg-fuchsia-950/40 flex items-center justify-between px-4 transition-all duration-500 overflow-hidden relative z-10 ${isRerouting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none !h-0 !mt-0 !mb-0 !border-0'}`}>
                 <div className="flex items-center gap-3">
                   <div className="flex items-center text-fuchsia-400 font-black animate-pulse">
                     <span className="animate-[bounce_1s_infinite_horizontal]">&gt;</span>
                     <span className="inline-block animate-[bounce_1_1s_infinite_horizontal] ml-[-2px]">&gt;</span>
                     <span className="inline-block animate-[bounce_1_2s_infinite_horizontal] ml-[-2px]">&gt;</span>
                   </div>
                   <span className="text-xs font-mono font-bold text-fuchsia-300 uppercase tracking-widest">
                     Rerouting
                   </span>
                 </div>
                 <div className="text-[10px] px-2 py-1 bg-fuchsia-500/20 rounded text-fuchsia-200 font-mono font-bold">
                   TO: {safestZone.toUpperCase()}
                 </div>
              </div>
              
              {/* Progress Bar */}
              <div className={`w-full bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/5 relative z-10 box-content ${isRerouting ? 'mt-4' : 'mt-8'}`}>
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${getIndicatorColor(percent).split(' ')[0]}`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                ></div>
              </div>
              
              {/* Cyperpunk ambient decoration */}
              <div className="absolute -bottom-8 -right-8 opacity-[0.02] font-mono text-[180px] leading-none select-none pointer-events-none font-black text-white mix-blend-overlay">
                {percent}
              </div>
              
              {/* Circuit board corner lines */}
              <div className={`absolute bottom-0 right-0 w-24 h-24 pointer-events-none border-b border-r ${getCongestionTextClass(percent)} opacity-30 rounded-br-2xl mb-2 mr-2 mix-blend-screen`}></div>
            </div>
          );
        })}
      </main>
      
      {/* Legend & Footer */}
      <footer className="mt-16 text-center border-t border-white/5 pt-8 w-full max-w-7xl relative z-10">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-xs font-mono text-neutral-500 uppercase tracking-widest">
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded border border-white/5">
            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div> 
            <span className="hidden sm:inline">Stable</span> <span className="text-cyan-500/70">(&lt; 60%)</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded border border-white/5">
            <div className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.5)]"></div> 
            <span className="hidden sm:inline">Degrading</span> <span className="text-purple-500/70">(60-79%)</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded border border-white/5">
            <div className="w-2 h-2 bg-fuchsia-500 rounded-full shadow-[0_0_8px_rgba(217,70,239,0.5)]"></div> 
            <span className="hidden sm:inline">Critical</span> <span className="text-fuchsia-500/70">(80%+)</span>
          </div>
        </div>
      </footer>

      {/* Background Ambient Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Global CSS for the horizontal bounce animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce_horizontal {
          0%, 100% { transform: translateX(-3px); }
          50% { transform: translateX(3px); }
        }
        .animate-\\[bounce_1s_infinite_horizontal\\] { animation: bounce_horizontal 1s infinite alternate; }
        .animate-\\[bounce_1_1s_infinite_horizontal\\] { animation: bounce_horizontal 1.1s infinite alternate; }
        .animate-\\[bounce_1_2s_infinite_horizontal\\] { animation: bounce_horizontal 1.2s infinite alternate; }
      `}} />
    </div>
  );
}
