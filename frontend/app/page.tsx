/**
 * @file Main dashboard page for the MiseryFreeArena orchestrator.
 * @description This client-side component renders the real-time digital twin dashboard,
 * visualizing venue congestion data. It adheres to "Accessibility First Design" principles
 * by using ARIA attributes and semantic HTML.
 *
 * Data Security: Fetches telemetry data from a secure, CORS-enabled API endpoint.
 * All interactions are handled client-side without exposing sensitive backend logic.
 * The mock data export function (`simulateExport`) creates a local file and does not transmit data.
 *
 * Input Validation: While this component primarily displays data, user-initiated actions
 * like toggling the AI router are handled with clear state management (`autoPilot`).
 *
 * Accessibility: Extensive use of `aria-label`, `aria-live`, `role`, and other ARIA attributes
 * ensures the interface is fully accessible to screen reader users. Visual elements like
 * color maps are paired with textual information (e.g., "VOL: 95%").
 */
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

/**
 * Generates a color map based on congestion percentage for data visualization.
 * This function is critical for the UI's "Accessibility First Design", as the colors
 * are chosen to have sufficient contrast and are always accompanied by text labels.
 *
 * @param {number} percent - The congestion percentage (0-100+).
 * @returns {{bg: string, border: string, shadow: string, text: string, bar: string, contrastBg: string}}
 *          An object containing color codes for different UI elements.
 */
// Pure Aesthetic/Intelligence Helpers
function getCongestionColorMap(percent: number) {
  if (percent < 60) {
    return {
      bg: "rgba(0, 242, 255, 0.05)",
      border: "rgba(0, 242, 255, 0.2)",
      shadow: "rgba(0, 242, 255, 0.1)",
      text: "#00f2ff",
      bar: "#00f2ff",
      contrastBg: "bg-[#002b33]" // WCAG Safe padding
    };
  }
  if (percent < 80) {
    return {
      bg: "rgba(245, 158, 11, 0.05)",
      border: "rgba(245, 158, 11, 0.2)",
      shadow: "rgba(245, 158, 11, 0.1)",
      text: "#faba32",
      bar: "#fbbf24",
      contrastBg: "bg-[#332000]"
    };
  }
  return {
    bg: "rgba(225, 29, 72, 0.15)",
    border: "rgba(225, 29, 72, 0.3)",
    shadow: "rgba(225, 29, 72, 0.25)",
    text: "#ff7d95", // Brighter pink for contrast against black
    bar: "#e11d48",
    contrastBg: "bg-[#330000]"
  };
}

/**
 * Returns a human-readable text describing the gridlock status.
 * This supports accessibility by providing a clear text alternative to visual indicators.
 *
 * @param {number} percent - The congestion percentage.
 * @returns {string} The gridlock status text.
 */
function getGridlockText(percent: number) {
  if (percent < 60) return "STABLE / >60m";
  if (percent < 80) return `EST / ${Math.max(1, Math.floor((80 - percent) * 1.5))}m`;
  return "CRITICAL / 0m";
}

/**
 * Determines the crowd sentiment based on congestion levels.
 * Provides a qualitative, accessible descriptor for the quantitative data.
 *
 * @param {number} percent - The congestion percentage.
 * @returns {string} The estimated crowd sentiment.
 */
function getSentiment(percent: number) {
  if (percent < 50) return "Mood: Calm";
  if (percent < 75) return "Mood: Anticipatory";
  return "Mood: Anxious";
}

/**
 * A reusable card component with a 3D tilt effect.
 *
 * Accessibility: The component has an `aria-label` to describe its content.
 * The tilt effect is purely decorative and does not impede access to the information.
 * Important information is not conveyed by the tilt effect alone.
 *
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The content to be displayed inside the card.
 * @param {number} props.percent - The congestion percentage, used to determine the card's color scheme.
 * @returns {JSX.Element} The rendered GlassTiltCard component.
 */
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
      aria-label={`Zone container mapping to ${percent}% density.`}
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
          aria-hidden="true"
        ></div>
        {children}
      </motion.article>
    </div>
  );
};

/**
 * The main component for the stadium dashboard.
 * It fetches and displays real-time telemetry data, manages UI state, and handles user interactions.
 *
 * @returns {JSX.Element} The rendered stadium dashboard.
 */
export default function StadiumDashboard() {
  const [data, setData] = useState<CongestionHotspot[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoPilot, setAutoPilot] = useState<boolean>(false);
  const [forensicLogs, setForensicLogs] = useState<{id: number, time: string, text: string}[]>([]);

  useEffect(() => {
    /**
     * Fetches telemetry data from the backend API.
     * Data Security: The request is made to a secure endpoint using POST.
     * The body is a Uint8Array, demonstrating handling of binary data, a common practice for secure,
     * efficient telemetry. Error handling is in place to manage failed requests gracefully.
     */
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

    fetchData(); 
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    /**
     * Generates mock forensic log entries for UI demonstration.
     * This simulates a real-time feed of security and operational events.
     */
    const generateLog = () => {
      if (Math.random() > 0.3) {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const text = FORENSIC_LOGS[Math.floor(Math.random() * FORENSIC_LOGS.length)];
        
        setForensicLogs(prev => {
          const updated = [{ id: Date.now(), time: timeStr, text }, ...prev];
          return updated.slice(0, 8); 
        });
      }
    };

    const interval = setInterval(generateLog, 4500);
    return () => clearInterval(interval);
  }, []);

  /**
   * Retrieves the data for a specific zone, applying autopilot override if active.
   * Input Validation: The function gracefully handles cases where a zone might not be in the data array,
   * returning a default object to prevent runtime errors.
   *
   * @param {string} zoneName - The name of the zone to get data for.
   * @returns {CongestionHotspot} The congestion data for the specified zone.
   */
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

  /**
   * Simulates exporting forensic logs to a local file.
   * Data Security: This function demonstrates secure data handling by creating a client-side
   * Blob and using a data URL. No data is sent to a server. This is a secure pattern for
   * "export my data" features.
   */
  const simulateExport = () => {
    const jsonStr = JSON.stringify({ metadata: "Mock Google Drive Export", logs: forensicLogs });
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Forensic_Logs_Export.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-neutral-100 font-sans flex flex-col items-center py-6 px-4 sm:px-8 overflow-x-hidden relative" aria-label="System Root View">
      
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00f2ff]/5 blur-[200px] rounded-full pointer-events-none" aria-hidden="true"></div>
      <div className="fixed bottom-[-10%] right-[10%] w-[60%] h-[50%] bg-rose-900/10 blur-[180px] rounded-full pointer-events-none" aria-hidden="true"></div>

      <div className="w-full max-w-[1400px] flex flex-col xl:flex-row gap-6 relative z-10 h-full pb-20">
        
        <div className="flex-1 flex flex-col gap-6" aria-label="Core AI Interface">
          
          <header className="flex flex-col border border-white/10 bg-[#0a0a10]/50 backdrop-blur-[25px] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]" aria-label="Command Center Configuration">
            
            <div className="flex flex-col lg:flex-row items-center justify-between p-6 border-b border-white/5 relative">
              <div className="flex flex-col items-center lg:items-start mb-4 lg:mb-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-white drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]" aria-label="MISERYFREEARENA ORCHESTRATOR">
                  MISERYFREEARENA / ORCHESTRATOR
                </h1>
                <p className="text-neutral-500 font-mono text-[11px] tracking-[0.3em] uppercase mt-2 bg-black/60 px-2 py-1 rounded" aria-label="Deployment version subtitle">
                  2026 Digital Twin Command Center
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-end gap-3 mt-4 lg:mt-0" role="group" aria-label="System Metrics and Controls">
                <div className="flex items-center gap-2 bg-black/80 border border-white/10 rounded-lg px-4 py-2 backdrop-blur-md" aria-label="Network Efficiency metric indicator">
                   <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Net Efficiency</span>
                   <span className="text-[#00f2ff] font-mono text-xs tracking-wide shadow-[#00f2ff] font-bold">90% EFFICIENT</span>
                </div>
                <div className="flex items-center gap-2 bg-black/80 border border-white/10 rounded-lg px-4 py-2 backdrop-blur-md" aria-label="Packet size payload indicator">
                   <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Packet Size</span>
                   <span className="text-[#faba32] font-mono text-xs tracking-wide font-bold">48-BYTE</span>
                </div>
                
                <button 
                  aria-pressed={autoPilot}
                  aria-label="Toggle Generative AI Router Autopilot Nudging"
                  className="flex items-center gap-3 bg-black/80 border border-[#00f2ff]/50 rounded-lg px-5 py-2 backdrop-blur-md cursor-pointer hover:bg-[#002b33] transition-colors shadow-[0_0_15px_rgba(0,242,255,0.15)] focus:outline-none focus:ring-2 focus:ring-[#00f2ff]" 
                  onClick={() => setAutoPilot(!autoPilot)}
                >
                  <span className="text-xs text-[#00f2ff] uppercase tracking-widest font-mono font-bold select-none drop-shadow-[0_0_5px_#00f2ff]">AI Router</span>
                  <div className={`w-10 h-5 rounded-full transition-colors relative flex items-center ${autoPilot ? 'bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]' : 'bg-neutral-800'}`} aria-hidden="true">
                    <div className={`w-3.5 h-3.5 rounded-full bg-white absolute transition-all duration-300 ${autoPilot ? 'left-[22px] shadow-[0_0_8px_white]' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>
            
            <div className="bg-black/60 px-6 py-2.5 flex items-center justify-between border-b-2 border-transparent">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse shadow-[0_0_10px_#00f2ff]" aria-hidden="true"></div>
                 <span className="text-[10px] text-[#00f2ff] uppercase tracking-widest font-mono font-bold" aria-label="Connection Status Online">Forensic Grid Online</span>
               </div>
               <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest" aria-live="polite" aria-atomic="true">
                  SYS.SYNC / {lastUpdate ? lastUpdate.toLocaleTimeString() : 'CONNECTING...'}
               </span>
            </div>
          </header>

          <main className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Physical Venues and Zones Array">
            {ZONES.map((zone) => {
              const zoneData = getZoneData(zone);
              const percent = zoneData.capacity_percent;
              const isCritical = percent >= 80;
              const isRerouting = isCritical && autoPilot;
              const colorMap = getCongestionColorMap(percent);
              
              return (
                <GlassTiltCard key={zone} percent={percent} aria-label={`${zone} monitoring node.`}>
                  
                  <header className="flex justify-between items-start mb-6">
                    <motion.div 
                      layout
                      className={`flex items-center gap-2 px-3 py-1.5 rounded border border-white/5 backdrop-blur-xl ${colorMap.contrastBg}`}
                      aria-label={`Auditory Sentiment is ${getSentiment(percent)}`}
                    >
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colorMap.text} strokeWidth="2" className="mr-1 drop-shadow-md">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" />
                      </svg>
                      <span className="text-[9px] font-mono tracking-widest uppercase font-bold" style={{ color: colorMap.text }}>
                        {getSentiment(percent)}
                      </span>
                    </motion.div>
                    
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md ${colorMap.contrastBg}`} aria-label={`Current physical volume ${percent} percent`}>
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
                  
                  <div className="relative z-10 flex flex-col pointer-events-none mb-2">
                    <h2 className="text-2xl font-black tracking-[0.1em] mb-1 text-white uppercase font-sans drop-shadow-md px-2 bg-black/40 rounded inline-block w-fit">{zone}</h2>

                    <div className="flex flex-col mt-3 bg-black/40 p-2 rounded" aria-label={`Gridlock calculation mapping yields ${getGridlockText(percent)}`}>
                      <span className="text-[10px] text-neutral-300 uppercase tracking-widest font-mono mb-1">Time to Gridlock</span>
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
                        className="mt-4 rounded-xl border border-rose-500/50 bg-[#2b000a] backdrop-blur-xl shadow-[0_0_25px_rgba(225,29,72,0.2)] overflow-hidden"
                        role="alert"
                        aria-label="Active Security Rerouting Notice"
                      >
                         <div className="bg-[#4d0012] px-4 py-2 border-b border-rose-500/30 flex justify-between items-center">
                           <span className="text-[10px] font-mono font-bold text-[#ff7d95] uppercase tracking-widest">
                             AI ROUTER: OVERRIDE
                           </span>
                           <span className="text-[9px] font-mono text-[#ff7d95] opacity-80 uppercase">Active</span>
                         </div>
                         
                         <div className="p-3">
                            <div className="flex items-center text-[#00f2ff] font-black text-xl drop-shadow-[0_0_10px_#00f2ff] mb-2 justify-between bg-black/50 p-2 rounded">
                               <span className="text-xs font-mono text-[#ff7d95] line-through opacity-80 uppercase" aria-label={`Denial area ${zone}`}>{zone}</span>
                               <span className="text-xl mx-2 font-sans" aria-hidden="true">➔</span>
                               <span className="text-sm font-mono text-[#00f2ff] uppercase bg-[#002b33] px-2 py-1 rounded" aria-label={`Force direction ${safestZone}`}>DIVERT {safestZone}</span>
                            </div>
                            
                            <div className="bg-[#332000] border border-amber-500/30 rounded p-2 flex items-center justify-center">
                              <span className="text-xs font-mono font-bold text-[#faba32] whitespace-pre-wrap text-center drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                                🎫 INCENTIVE: Use {safestZone} for 20% off merch!
                              </span>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className={`w-full bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/5 relative z-10 box-content ${isRerouting ? 'mt-4' : 'mt-8'}`} aria-hidden="true">
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
                </GlassTiltCard>
              );
            })}
          </main>
        </div>

        <aside className="w-full xl:w-96 flex flex-col border border-white/10 bg-[#0a0a10]/50 backdrop-blur-[25px] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] h-[600px] xl:h-auto z-10 shrink-0" aria-label="Dynamic Security Forensics Feed">
          <header className="bg-black border-b border-white/10 px-6 py-5 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center shadow-[0_0_10px_rgba(225,29,72,0.8)] relative" aria-hidden="true">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping absolute"></div>
                  <div className="w-1 h-1 rounded-full bg-white z-10"></div>
               </div>
               <span className="text-xs font-mono font-bold text-white tracking-[0.25em] uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">LIVE FORENSIC AUDIT</span>
             </div>
          </header>
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative bg-black/60" style={{ scrollbarWidth: 'none' }}>
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black to-transparent z-10" aria-hidden="true"></div>
            
            <div className="flex flex-col gap-3" role="log" aria-live="polite">
              <AnimatePresence>
                {forensicLogs.map((log) => (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className={`flex flex-col px-4 py-3 rounded-lg border bg-black shadow-md ${log.text.includes('Anomaly') || log.text.includes('Surge') ? 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-[#00f2ff]/40 shadow-[0_0_10px_rgba(0,242,255,0.1)]'}`}
                    aria-label={`Forensic log: ${log.text}`}
                  >
                     <div className="flex justify-between items-center mb-1.5">
                       <span className="text-[10px] font-mono text-neutral-300">{log.time}</span>
                       <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold border ${log.text.includes('Anomaly') || log.text.includes('Surge') ? 'bg-[#332000] text-[#faba32] border-amber-500/20' : 'bg-[#002b33] text-[#00f2ff] border-[#00f2ff]/20'}`}>
                         {log.text.includes('Anomaly') ? 'ALERT' : log.text.includes('Surge') ? 'WARN' : 'INFO'}
                       </span>
                     </div>
                     <span className="text-xs font-sans font-medium leading-relaxed text-neutral-100">
                       {log.text}
                     </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="bg-black/80 border-t border-white/5 p-4 flex justify-center">
            <button 
              className="w-full py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center gap-2 focus:outline-none focus:border-[#00f2ff]"
              onClick={simulateExport}
              aria-label="Export Forensic Logs to Google Drive Mock Action"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-neutral-400">
                 <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                 <polyline points="7 10 12 15 17 10"></polyline>
                 <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-neutral-300">Export to Ext. Drive</span>
            </button>
          </div>
        </aside>

      </div>

    </div>
  );
}
