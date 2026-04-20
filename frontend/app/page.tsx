"use client";

import { useEffect, useState, useRef } from "react";

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

const ANOMALIES = [
  "Counter-flow cluster tracked moving unguided.",
  "Thermal spike registered at concourse entry.",
  "Security gate biometrics delay detected.",
  "Unusual decibel peak isolating vocal distress.",
  "Unauthorized access attempt pinged.",
  "Evacuation route impedance calculated."
];

// Aesthetic/Intelligence Helpers
function getCongestionClass(percent: number) {
  if (percent < 60) return "bg-cyan-950/10 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]";
  if (percent < 80) return "bg-fuchsia-950/10 border-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.05)]";
  return "bg-rose-950/20 border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.15)]";
}

function getCongestionTextClass(percent: number) {
  if (percent < 60) return "text-cyan-400";
  if (percent < 80) return "text-fuchsia-400";
  return "text-rose-400";
}

function getIndicatorColor(percent: number) {
  if (percent < 60) return "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]";
  if (percent < 80) return "bg-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,1)]";
  return "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,1)] animate-pulse";
}

function getGridlockText(percent: number) {
  if (percent < 60) return "STABLE / >60m";
  if (percent < 80) return `EST / ${Math.max(1, Math.floor((80 - percent) * 1.5))}m`;
  return "CRITICAL / 0m";
}

function getSentiment(percent: number) {
  if (percent < 50) return "MOOD: OPTIMISTIC";
  if (percent < 75) return "MOOD: RESTLESS";
  return "MOOD: ANXIOUS";
}

// 3D Parallax Card Wrapper
function GlassTiltCard({ children, percent, ...props }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation (-10 to 10 deg)
    const rotateY = (mouseX / (width / 2)) * 8;
    const rotateX = -(mouseY / (height / 2)) * 8;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div 
      className="perspective-1000 w-full h-full"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`
          relative overflow-hidden rounded-2xl border backdrop-blur-[20px] p-6
          transition-all duration-[1500ms] ease-out transform-gpu
          ${getCongestionClass(percent)}
        `}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: "transform 0.1s ease-out, background-color 1.5s ease-out, border-color 1.5s ease-out, box-shadow 1.5s ease-out"
        }}
        {...props}
      >
        {/* Inner Glare / Liquid effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none transition-opacity duration-500" 
          style={{ opacity: (Math.abs(rotation.x) + Math.abs(rotation.y)) > 0 ? 1 : 0.5 }}
        ></div>
        {children}
      </div>
    </div>
  );
}

export default function StadiumDashboard() {
  const [data, setData] = useState<CongestionHotspot[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoPilot, setAutoPilot] = useState<boolean>(false);
  const [anomalies, setAnomalies] = useState<{id: number, time: string, text: string, zone: string}[]>([]);

  // Telemetry Fetching
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
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Anomaly Generator Engine
  useEffect(() => {
    const generateAnomaly = () => {
      if (Math.random() > 0.4) {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
        const text = ANOMALIES[Math.floor(Math.random() * ANOMALIES.length)];
        
        setAnomalies(prev => {
          const updated = [{ id: Date.now(), time: timeStr, text, zone }, ...prev];
          return updated.slice(0, 5); // Keep last 5
        });
      }
    };

    const interval = setInterval(generateAnomaly, 6000);
    return () => clearInterval(interval);
  }, []);

  const getZoneData = (zoneName: string) => {
    let zoneObj = data.find((d) => d.zone === zoneName) || { zone: zoneName, capacity_percent: 0 };
    if (autoPilot && zoneName === "Zone D") {
      zoneObj = { ...zoneObj, capacity_percent: 95 };
    }
    return zoneObj;
  };

  const getSafestZone = () => {
    if (!data.length) return "Zone A";
    return data.filter(d => ZONES.includes(d.zone)).reduce((prev, curr) => 
      (prev.capacity_percent < curr.capacity_percent) ? prev : curr
    ).zone;
  };

  const getMostCongestedZone = () => {
    if (!data.length) return null;
    let worst = data[0];
    if (autoPilot) return getZoneData("Zone D"); 
    
    for(const d of data) {
       if (ZONES.includes(d.zone) && d.capacity_percent > worst.capacity_percent) {
         worst = d;
       }
    }
    return worst;
  };

  const safestZone = getSafestZone();
  const worstZone = getMostCongestedZone();

  // Generative AI Brief logic
  const generateAIBrief = () => {
    if (!worstZone || !lastUpdate) return "SYNTHESIZING STADIUM STATE...";
    const gridlockMin = Math.max(0, Math.floor((80 - worstZone.capacity_percent) * 1.5));
    
    if (worstZone.capacity_percent >= 80) {
      if (autoPilot) {
         return `Orchestrator predicts 0m to ${worstZone.zone} gridlock; AI Router is actively balancing load toward the ${safestZone}.`;
      }
      return `CRITICAL ALERT: ${worstZone.zone} at gridlock. Enable Auto-Pilot to trigger AI redirection to ${safestZone}.`;
    }
    
    return `Stadium stability optimal. Load distribution predicting ${worstZone.zone} congestion in ${gridlockMin}m at current ingress rates.`;
  };

  return (
    <div className="min-h-screen bg-[#010103] text-neutral-100 font-sans selection:bg-cyan-500/30 flex flex-col items-center py-6 px-4 sm:px-8 overflow-x-hidden relative">
      
      {/* Background Ambient Liquid Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/15 blur-[150px] rounded-full pointer-events-none transition-all duration-[3s]"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-fuchsia-900/15 blur-[150px] rounded-full pointer-events-none transition-all duration-[3s]"></div>

      <div className="w-full max-w-7xl flex flex-col gap-6 relative z-10">
        
        {/* Header Ribbon & AI Brief */}
        <div className="flex flex-col border border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          
          <div className="flex flex-col lg:flex-row items-center justify-between p-6 border-b border-white/5 relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
            
            <div className="flex flex-col items-center lg:items-start mb-4 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]">
                MiseryFreeArena
              </h1>
              <p className="text-cyan-500/80 font-mono text-[10px] tracking-[0.4em] uppercase mt-1">
                2026 Liquid Glass Digital Twin Command
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-end gap-3">
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 backdrop-blur-md">
                 <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">Net Opt</span>
                 <span className="text-cyan-300 font-mono text-xs tracking-wide">90%</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 backdrop-blur-md">
                 <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">Ingress</span>
                 <span className="text-fuchsia-300 font-mono text-xs tracking-wide">48B/pkt</span>
              </div>
              <div 
                className="flex items-center gap-3 bg-black/50 border border-cyan-500/20 rounded-lg px-4 py-1.5 backdrop-blur-md cursor-pointer hover:bg-white/5 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.1)]" 
                onClick={() => setAutoPilot(!autoPilot)}
              >
                <span className="text-xs text-cyan-100 uppercase tracking-widest font-mono font-bold select-none">AI Router</span>
                <button className={`w-8 h-4 rounded-full transition-colors relative flex items-center ${autoPilot ? 'bg-cyan-500 shadow-[0_0_10px_cyan]' : 'bg-neutral-800'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white absolute transition-all duration-300 ${autoPilot ? 'left-[18px] shadow-[0_0_8px_white]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Live AI Brief */}
          <div className="bg-black/30 px-6 py-3 flex items-start sm:items-center gap-3 border-b-2 border-transparent">
             <div className="hidden sm:flex shrink-0 w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-500/50 items-center justify-center animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.2)]">
               <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] text-cyan-500/70 uppercase tracking-widest font-mono font-bold">Live Situation Brief</span>
               <span className="text-sm font-mono text-cyan-50 leading-relaxed shadow-cyan-900 drop-shadow-md">
                 {generateAIBrief()}
               </span>
             </div>
          </div>
        </div>

        {/* Main Grid Component */}
        <main className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pb-32">
          {ZONES.map((zone) => {
            const zoneData = getZoneData(zone);
            const percent = zoneData.capacity_percent;
            const isCritical = percent >= 80;
            const isRerouting = isCritical && autoPilot;
            
            return (
              <GlassTiltCard key={zone} percent={percent}>
                {/* Status Badge */}
                <div className="absolute top-0 right-0 p-5 flex flex-col gap-2 items-end">
                  <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full border border-white/5 backdrop-blur-xl">
                    <span className={`text-[10px] sm:text-[11px] font-mono font-bold tracking-widest ${getCongestionTextClass(percent)}`}>
                      VOL: {percent}%
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${getIndicatorColor(percent)}`}></div>
                  </div>
                </div>
                
                {/* Data Content */}
                <div className="mt-4 mb-2 relative z-10 flex flex-col pointer-events-none">
                  <h2 className="text-xl sm:text-2xl font-black tracking-[0.15em] mb-1 text-white/90 uppercase font-sans drop-shadow-md">{zone}</h2>
                  
                  {/* Forensic Sentiment */}
                  <div className="flex items-center gap-2 mt-1 mb-3">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={getCongestionTextClass(percent)}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                     <span className={`text-[9px] font-mono tracking-widest uppercase ${getCongestionTextClass(percent)} opacity-80`}>
                       {getSentiment(percent)}
                     </span>
                  </div>

                  <div className="flex flex-col mt-2">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-1">Time to Gridlock</span>
                    <span className={`text-4xl sm:text-5xl font-black tracking-tighter ${getCongestionTextClass(percent)} drop-shadow-[0_0_15px_currentColor] font-mono`}>
                      <span className="inline-block transition-all duration-[2000ms] tabular-nums">
                        {getGridlockText(percent)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* OVERHAULED Active Rerouting Banner */}
                <div className={`mt-3 rounded-lg border border-cyan-400 bg-cyan-950/40 backdrop-blur-lg shadow-[0_0_20px_rgba(34,211,238,0.2)] flex flex-col px-4 py-3 transition-opacity duration-1000 overflow-hidden relative z-10 ${isRerouting ? 'opacity-100 h-auto' : 'opacity-0 pointer-events-none !h-0 !p-0 !mt-0 !mb-0 !border-0'}`}>
                   <div className="flex items-center justify-between w-full mb-1">
                     <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-widest">SYSTEM OVERRIDE</span>
                     <span className="text-[9px] font-mono font-bold text-cyan-300 opacity-70">AUTO-PILOT ACTIVE</span>
                   </div>
                   
                   <div className="flex items-center justify-between w-full mt-1 bg-black/30 rounded p-2 border border-cyan-500/20">
                      <span className="text-[10px] font-mono text-fuchsia-400 font-bold line-through opacity-80 uppercase">{zone}</span>
                      
                      {/* BRIGHT NEON DIRECTIONAL ARROW */}
                      <div className="flex items-center text-cyan-400 font-black text-lg drop-shadow-[0_0_8px_rgba(34,211,238,1)]">
                         <span className="animate-[bounce_1s_infinite_horizontal] opacity-50">-</span>
                         <span className="animate-[bounce_1_1s_infinite_horizontal] opacity-80">-</span>
                         <span className="inline-block animate-[bounce_1_2s_infinite_horizontal] font-sans text-xl drop-shadow-[0_0_12px_cyan] ml-1">➔</span>
                      </div>

                      <div className="flex flex-col items-end">
                         <span className="text-[8px] font-mono text-cyan-300 uppercase tracking-wider opacity-80">DIVERT TO</span>
                         <span className="text-[11px] font-mono text-cyan-400 font-bold drop-shadow-[0_0_8px_cyan] uppercase bg-cyan-900/30 px-1 mt-0.5 border border-cyan-500/30 rounded">{safestZone}</span>
                      </div>
                   </div>
                </div>
                
                {/* Progress Bar (Liquid) */}
                <div className={`w-full bg-black/40 rounded-full h-1 overflow-hidden border border-white/5 relative z-10 box-content ${isRerouting ? 'mt-4' : 'mt-8'}`}>
                  <div 
                    className={`h-full transition-all duration-[2000ms] ease-out rounded-full ${getIndicatorColor(percent).split(' ')[0]}`}
                    style={{ width: `${Math.min(percent, 100)}%`, boxShadow: "0 0 10px currentColor" }}
                  ></div>
                </div>
                
                {/* Cyperpunk ambient decoration */}
                <div className="absolute -bottom-8 -right-4 opacity-[0.03] font-mono text-[160px] leading-none select-none pointer-events-none font-black text-white mix-blend-overlay">
                  {percent}
                </div>
                
                {/* Corner reticle */}
                <div className={`absolute bottom-0 right-0 w-8 h-8 pointer-events-none border-b border-r ${getCongestionTextClass(percent)} opacity-40 rounded-br-2xl mb-3 mr-3`}></div>
              </GlassTiltCard>
            );
          })}
        </main>
      </div>

      {/* Floating Anomaly Sidebar (Security Audit) */}
      <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-80 sm:rounded-xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col pointer-events-none">
        <div className="bg-rose-950/40 border-b border-rose-500/20 px-4 py-2 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-[pulse_1s_infinite] shadow-[0_0_8px_rgba(244,63,94,1)]"></div>
             <span className="text-[10px] font-mono font-bold text-rose-300 tracking-[0.2em] uppercase">Security Audit</span>
           </div>
           <span className="text-[9px] font-mono text-neutral-500">LIVE FEED</span>
        </div>
        <div className="flex flex-col gap-1 p-2 h-[120px] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-black/60 to-transparent z-10"></div>
          {anomalies.map((anom, idx) => (
            <div key={anom.id} className={`flex flex-col px-2 py-1.5 rounded transition-all duration-500 ${idx === 0 ? 'bg-rose-900/10 border border-rose-500/20 opacity-100 translate-y-0' : 'bg-white/[0.02] border border-white/[0.02] opacity-60 translate-y-0'}`}>
               <div className="flex items-center justify-between mb-0.5">
                 <span className="text-[8px] font-mono text-rose-400">{anom.time}</span>
                 <span className="text-[8px] font-mono bg-rose-950 px-1 rounded text-rose-200">{anom.zone}</span>
               </div>
               <span className="text-[10px] font-sans leading-tight text-neutral-300">
                 {anom.text}
               </span>
            </div>
          ))}
          {!anomalies.length && (
            <div className="flex-1 flex items-center justify-center text-[10px] font-mono text-neutral-600 opacity-50 pulse">
               Scanning for anomalies...
            </div>
          )}
        </div>
      </div>

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
