"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const FORENSIC_LOGS = [
  "Pattern Match: Standard Flow",
  "Anomaly: Counter-flow detected in Tunnel 4",
  "Velocity Surge: Zone D",
  "Thermal cluster identified at North Gate",
  "Biometric scan rate dropping below threshold",
  "Pattern Match: Evacuation clear"
];

// Pure Aesthetic/Intelligence Helpers
function getCongestionColorMap(percent: number) {
  if (percent < 60) {
    return {
      bg: "rgba(0, 242, 255, 0.05)",
      border: "rgba(0, 242, 255, 0.2)",
      shadow: "rgba(0, 242, 255, 0.1)",
      text: "#00f2ff",
      bar: "#00f2ff"
    };
  }
  if (percent < 80) {
    return {
      bg: "rgba(245, 158, 11, 0.05)",
      border: "rgba(245, 158, 11, 0.2)",
      shadow: "rgba(245, 158, 11, 0.1)",
      text: "#f59e0b",
      bar: "#fbbf24"
    };
  }
  return {
    bg: "rgba(225, 29, 72, 0.15)",
    border: "rgba(225, 29, 72, 0.3)",
    shadow: "rgba(225, 29, 72, 0.25)",
    text: "#fb7185",
    bar: "#e11d48"
  };
}

function getGridlockText(percent: number) {
  if (percent < 60) return "STABLE / >60m";
  if (percent < 80) return `EST / ${Math.max(1, Math.floor((80 - percent) * 1.5))}m`;
  return "CRITICAL / 0m";
}

function getSentiment(percent: number) {
  if (percent < 50) return "Mood: Calm";
  if (percent < 75) return "Mood: Anticipatory";
  return "Mood: Anxious";
}

// 3D Parallax Card Wrapper (Memoized for performance)
const GlassTiltCard = ({ children, percent, ...props }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Hardware-accelerated transformation ranges
    const rotateY = (mouseX / (width / 2)) * 6;
    const rotateX = -(mouseY / (height / 2)) * 6;
    
    setRotation({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotation({ x: 0, y: 0 });
  }, []);

  const colorMap = useMemo(() => getCongestionColorMap(percent), [percent]);

  return (
    <div 
      className="perspective-1000 w-full h-full"
      style={{ perspective: "1000px" }}
    >
      <motion.article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          backgroundColor: colorMap.bg,
          borderColor: colorMap.border,
          boxShadow: `0 0 30px ${colorMap.shadow}`,
          rotateX: rotation.x,
          rotateY: rotation.y
        }}
        transition={{
          rotateX: { type: "spring", stiffness: 300, damping: 30 },
          rotateY: { type: "spring", stiffness: 300, damping: 30 },
          backgroundColor: { duration: 1, ease: "easeOut" },
          borderColor: { duration: 1, ease: "easeOut" },
          boxShadow: { duration: 1, ease: "easeOut" }
        }}
        className="relative overflow-hidden rounded-2xl border backdrop-blur-[25px] p-6 transform-gpu"
        {...props}
      >
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none transition-opacity duration-500" 
          style={{ opacity: (Math.abs(rotation.x) + Math.abs(rotation.y)) > 0 ? 1 : 0.5 }}
        ></div>
        {children}
      </motion.article>
    </div>
  );
};

export default function StadiumDashboard() {
  const [data, setData] = useState<CongestionHotspot[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoPilot, setAutoPilot] = useState<boolean>(false);
  const [forensicLogs, setForensicLogs] = useState<{id: number, time: string, text: string}[]>([]);

  // Telemetry Fetching Logic
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

    fetchData(); // Initial boundary fetch
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Forensic Security Feed Generator Engine
  useEffect(() => {
    const generateLog = () => {
      if (Math.random() > 0.3) {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const text = FORENSIC_LOGS[Math.floor(Math.random() * FORENSIC_LOGS.length)];
        
        setForensicLogs(prev => {
          const updated = [{ id: Date.now(), time: timeStr, text }, ...prev];
          return updated.slice(0, 8); // Performance bounding
        });
      }
    };

    const interval = setInterval(generateLog, 4500);
    return () => clearInterval(interval);
  }, []);

  // Memoized zone access and calculations
  const getZoneData = useCallback((zoneName: string) => {
    let zoneObj = data.find((d) => d.zone === zoneName) || { zone: zoneName, capacity_percent: 0 };
    if (autoPilot && zoneName === "Zone D") {
      zoneObj = { ...zoneObj, capacity_percent: 95 }; 
    }
    return zoneObj;
  }, [data, autoPilot]);

  const safestZone = useMemo(() => {
    if (!data.length) return "Zone A";
    return data.filter(d => ZONES.includes(d.zone)).reduce((prev, curr) => 
      (prev.capacity_percent < curr.capacity_percent) ? prev : curr
    ).zone;
  }, [data]);

  return (
    <div className="min-h-screen bg-[#050508] text-neutral-100 font-sans flex flex-col items-center py-6 px-4 sm:px-8 overflow-x-hidden relative">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00f2ff]/5 blur-[200px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[10%] w-[60%] h-[50%] bg-rose-900/10 blur-[180px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[1400px] flex flex-col xl:flex-row gap-6 relative z-10 h-full pb-20">
        
        {/* Main Interface Group */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Header Ribbon */}
          <header className="flex flex-col border border-white/10 bg-[#0a0a10]/50 backdrop-blur-[25px] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            
            <div className="flex flex-col lg:flex-row items-center justify-between p-6 border-b border-white/5 relative">
              <div className="flex flex-col items-center lg:items-start mb-4 lg:mb-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-white drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">
                  MISERYFREEARENA / ORCHESTRATOR
                </h1>
                <p className="text-neutral-500 font-mono text-[11px] tracking-[0.3em] uppercase mt-2">
                  2026 Digital Twin Command Center
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-end gap-3 mt-4 lg:mt-0" role="group" aria-label="System Metrics and Controls">
                <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-lg px-4 py-2 backdrop-blur-md">
                   <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Net Efficiency</span>
                   <span className="text-[#00f2ff] font-mono text-xs tracking-wide shadow-[#00f2ff]">90% EFFICIENT</span>
                </div>
                <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-lg px-4 py-2 backdrop-blur-md">
                   <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Packet Size</span>
                   <span className="text-amber-400 font-mono text-xs tracking-wide">48-BYTE</span>
                </div>
                
                {/* Accessible Toggle Button */}
                <button 
                  aria-pressed={autoPilot}
                  aria-label="Toggle AI Router Autopilot"
                  className="flex items-center gap-3 bg-black/70 border border-[#00f2ff]/30 rounded-lg px-5 py-2 backdrop-blur-md cursor-pointer hover:bg-white/5 transition-colors shadow-[0_0_15px_rgba(0,242,255,0.15)] focus:outline-none focus:ring-2 focus:ring-[#00f2ff]" 
                  onClick={() => setAutoPilot(!autoPilot)}
                >
                  <span className="text-xs text-[#00f2ff] uppercase tracking-widest font-mono font-bold select-none drop-shadow-[0_0_5px_#00f2ff]">AI Router</span>
                  <div className={`w-10 h-5 rounded-full transition-colors relative flex items-center ${autoPilot ? 'bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]' : 'bg-neutral-800'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white absolute transition-all duration-300 ${autoPilot ? 'left-[22px] shadow-[0_0_8px_white]' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>
            
            <div className="bg-black/40 px-6 py-2.5 flex items-center justify-between border-b-2 border-transparent">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse shadow-[0_0_10px_#00f2ff]" aria-hidden="true"></div>
                 <span className="text-[10px] text-[#00f2ff]/80 uppercase tracking-widest font-mono font-bold">Forensic Grid Online</span>
               </div>
               <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  SYS.SYNC / {lastUpdate ? lastUpdate.toLocaleTimeString() : 'CONNECTING...'}
               </span>
            </div>
          </header>

          {/* Zones Grid */}
          <main className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Venues and Zones Overview">
            {ZONES.map((zone) => {
              const zoneData = getZoneData(zone);
              const percent = zoneData.capacity_percent;
              const isCritical = percent >= 80;
              const isRerouting = isCritical && autoPilot;
              const colorMap = getCongestionColorMap(percent);
              
              return (
                <GlassTiltCard key={zone} percent={percent} aria-label={`${zone} capacity at ${percent} percent`}>
                  
                  {/* Top Badges */}
                  <header className="flex justify-between items-start mb-6">
                    <motion.div 
                      layout
                      className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-white/5 backdrop-blur-xl"
                      aria-label={getSentiment(percent)}
                    >
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colorMap.text} strokeWidth="2" className="mr-1 drop-shadow-md">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" />
                      </svg>
                      <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-400">
                        {getSentiment(percent)}
                      </span>
                    </motion.div>
                    
                    <div className="flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                      <span className="text-[11px] font-mono font-bold tracking-widest" style={{ color: colorMap.text }}>
                        VOL: {percent}%
                      </span>
                      <motion.div 
                        aria-hidden="true"
                        animate={{ backgroundColor: colorMap.bar, boxShadow: `0 0 10px ${colorMap.bar}` }}
                        className={`w-2 h-2 rounded-full ${isCritical ? 'animate-pulse' : ''}`} 
                      />
                    </div>
                  </header>
                  
                  {/* Middle Content */}
                  <div className="relative z-10 flex flex-col pointer-events-none mb-2">
                    <h2 className="text-2xl font-black tracking-[0.1em] mb-1 text-white uppercase font-sans drop-shadow-md">{zone}</h2>

                    <div className="flex flex-col mt-3" aria-label={`Estimated ${getGridlockText(percent)}`}>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-1">Time to Gridlock</span>
                      <motion.span 
                        animate={{ color: colorMap.text, textShadow: `0 0 20px ${colorMap.shadow}` }}
                        className="text-5xl font-black tracking-tighter font-mono"
                      >
                        <span className="inline-block tabular-nums">
                          {getGridlockText(percent)}
                        </span>
                      </motion.span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isRerouting && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, y: 10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: 10 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="mt-4 rounded-xl border border-rose-500/50 bg-black/50 backdrop-blur-xl shadow-[0_0_25px_rgba(225,29,72,0.2)] overflow-hidden"
                        role="alert"
                      >
                         <div className="bg-rose-950/80 px-4 py-2 border-b border-rose-500/30 flex justify-between items-center">
                           <span className="text-[10px] font-mono font-bold text-rose-200 uppercase tracking-widest">
                             AI ROUTER: OVERRIDE
                           </span>
                           <span className="text-[9px] font-mono text-rose-300 opacity-80 uppercase">Active</span>
                         </div>
                         
                         <div className="p-3">
                            <div className="flex items-center text-[#00f2ff] font-black text-xl drop-shadow-[0_0_10px_#00f2ff] mb-2 justify-between">
                               <span className="text-xs font-mono text-rose-300 line-through opacity-80 uppercase" aria-label={`Route closed to ${zone}`}>{zone}</span>
                               <span className="text-xl mx-2 font-sans" aria-hidden="true">➔</span>
                               <span className="text-sm font-mono text-[#00f2ff] uppercase bg-[#00f2ff]/10 px-2 border border-[#00f2ff]/30 py-1 rounded">DIVERT TO {safestZone}</span>
                            </div>
                            
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2 flex items-center justify-center">
                              <span className="text-xs font-mono font-bold text-amber-400 whitespace-pre-wrap text-center drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                                🎫 INCENTIVE ACTIVE: Use {safestZone} for 20% off merch!
                              </span>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Progress Bar (Liquid) */}
                  <div className={`w-full bg-black/50 rounded-full h-1.5 overflow-hidden border border-white/5 relative z-10 box-content ${isRerouting ? 'mt-4' : 'mt-8'}`} aria-hidden="true">
                    <motion.div 
                      layout
                      animate={{ 
                        width: `${Math.min(percent, 100)}%`, 
                        backgroundColor: colorMap.bar,
                        boxShadow: `0 0 15px ${colorMap.bar}`
                      }}
                      transition={{ type: "spring", bounce: 0, duration: 1.5 }}
                      className="h-full rounded-full"
                    ></motion.div>
                  </div>
                  
                  <div className="absolute -bottom-8 -right-4 opacity-[0.03] font-mono text-[160px] leading-none select-none pointer-events-none font-black text-white mix-blend-overlay" aria-hidden="true">
                    {percent}
                  </div>
                </GlassTiltCard>
              );
            })}
          </main>
        </div>

        {/* RIGHT SIDEBAR: LIVE FORENSIC AUDIT */}
        <aside className="w-full xl:w-96 flex flex-col border border-white/10 bg-[#0a0a10]/50 backdrop-blur-[25px] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] h-[600px] xl:h-auto z-10 shrink-0" aria-label="Live Forensic Audit Feed">
          <header className="bg-[#0a0a10] border-b border-white/10 px-6 py-5 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center shadow-[0_0_10px_rgba(225,29,72,0.8)] relative" aria-hidden="true">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping absolute"></div>
                  <div className="w-1 h-1 rounded-full bg-white z-10"></div>
               </div>
               <span className="text-xs font-mono font-bold text-white tracking-[0.25em] uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">LIVE FORENSIC AUDIT</span>
             </div>
          </header>
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative bg-black/20" style={{ scrollbarWidth: 'none' }}>
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#0a0a10] to-transparent z-10" aria-hidden="true"></div>
            
            <div className="flex flex-col gap-3" role="log" aria-live="polite">
              <AnimatePresence>
                {forensicLogs.map((log) => (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className={`flex flex-col px-4 py-3 rounded-lg border bg-black/40 backdrop-blur-md shadow-md ${log.text.includes('Anomaly') || log.text.includes('Surge') ? 'border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'border-[#00f2ff]/20 shadow-[0_0_10px_rgba(0,242,255,0.05)]'}`}
                  >
                     <div className="flex justify-between items-center mb-1.5">
                       <span className="text-[10px] font-mono text-neutral-400">{log.time}</span>
                       <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${log.text.includes('Anomaly') || log.text.includes('Surge') ? 'bg-amber-950 text-amber-400' : 'bg-cyan-950 text-[#00f2ff]'}`}>
                         {log.text.includes('Anomaly') ? 'ALERT' : log.text.includes('Surge') ? 'WARN' : 'INFO'}
                       </span>
                     </div>
                     <span className="text-xs font-sans font-medium leading-relaxed text-neutral-200">
                       {log.text}
                     </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {!forensicLogs.length && (
                <div className="flex justify-center py-10 opacity-50">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00f2ff]" aria-hidden="true"></div>
                  <span className="sr-only">Loading audits</span>
                </div>
              )}
            </div>
          </div>
        </aside>

      </div>

    </div>
  );
}
