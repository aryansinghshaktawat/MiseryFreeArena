"use client";

import { useEffect, useState } from "react";

type CongestionHotspot = {
  zone: string;
  capacity_percent: number;
};

// Map of 6 desired stadium zones explicitly listed
const ZONES = [
  "Zone A",
  "Zone B",
  "Zone C",
  "Zone D",
  "Zone E",
  "Main Stage"
];

function getCongestionClass(percent: number) {
  if (percent < 50) return "bg-emerald-950/40 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
  if (percent < 80) return "bg-amber-950/40 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]";
  return "bg-red-950/40 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.25)]";
}

function getCongestionTextClass(percent: number) {
  if (percent < 50) return "text-emerald-400";
  if (percent < 80) return "text-amber-400";
  return "text-red-400";
}

function getIndicatorColor(percent: number) {
  if (percent < 50) return "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]";
  if (percent < 80) return "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)]";
  return "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse";
}

function getCongestionLabel(percent: number) {
  if (percent < 50) return "Low Congestion";
  if (percent < 80) return "Medium Congestion";
  return "High Congestion";
}

export default function StadiumDashboard() {
  const [data, setData] = useState<CongestionHotspot[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/telemetry", {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream"
          },
          body: new Uint8Array([0x00, 0x01]) // Mock binary payload for the backend
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

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-cyan-500/30 flex flex-col items-center py-12 px-4 sm:px-8">
      {/* Header */}
      <header className="mb-12 text-center w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 drop-shadow-[0_0_15px_rgba(34,211,238,0.2)] uppercase">
            Stadium / Telemetry
          </h1>
          <p className="text-neutral-500 font-mono text-sm tracking-widest uppercase">
            Real-Time Capacity Heatmap
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/10 rounded-full px-5 py-2.5 backdrop-blur-md">
          <div className={`w-2.5 h-2.5 rounded-full ${lastUpdate ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse' : 'bg-neutral-600'}`}></div>
          <span className="font-mono text-xs text-neutral-300">
            {lastUpdate ? `LIVE / ${lastUpdate.toLocaleTimeString()}` : 'CONNECTING...'}
          </span>
        </div>
      </header>

      {/* Grid - 6 Zones */}
      <main className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ZONES.map((zone) => {
          const zoneData = getZoneData(zone);
          const percent = zoneData.capacity_percent;
          
          return (
            <div 
              key={zone} 
              className={`
                relative overflow-hidden rounded-2xl border backdrop-blur-xl p-6
                transition-all duration-700 ease-in-out transform hover:-translate-y-1
                ${getCongestionClass(percent)}
              `}
            >
              {/* Background gradient blur effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

              {/* Status Badge */}
              <div className="absolute top-0 right-0 p-5">
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                  <span className={`text-[10px] sm:text-xs font-mono tracking-wider ${getCongestionTextClass(percent)} uppercase`}>
                    {getCongestionLabel(percent)}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${getIndicatorColor(percent)}`}></div>
                </div>
              </div>
              
              {/* Data Content */}
              <div className="mt-8 mb-4 relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 text-white/90 uppercase">{zone}</h2>
                <div className="flex items-end gap-2">
                  <span className={`text-6xl sm:text-7xl font-black tracking-tighter ${getCongestionTextClass(percent)} drop-shadow-lg`}>
                    <span className="inline-block transition-all duration-500 tabular-nums">{percent}</span>
                  </span>
                  <span className="text-xl text-neutral-500 font-medium mb-1.5">%</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-black/50 rounded-full h-2.5 mt-8 overflow-hidden border border-white/5 relative z-10">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${getIndicatorColor(percent).split(' ')[0]}`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                ></div>
              </div>
              
              {/* Cyperpunk ambient decoration */}
              <div className="absolute -bottom-4 -right-4 opacity-[0.03] font-mono text-[140px] leading-none select-none pointer-events-none font-black text-white mix-blend-overlay">
                {percent}
              </div>
              
              {/* Circuit board corner lines */}
              <div className={`absolute bottom-0 right-0 w-16 h-16 pointer-events-none border-b-2 border-r-2 ${getCongestionTextClass(percent)} opacity-20 rounded-br-2xl mb-2 mr-2`}></div>
            </div>
          );
        })}
      </main>
      
      {/* Legend & Footer */}
      <footer className="mt-16 text-center border-t border-neutral-800/50 pt-8 w-full max-w-6xl">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-xs font-mono text-neutral-500 uppercase tracking-widest">
          <div className="flex items-center gap-2 bg-neutral-900/50 px-4 py-2 rounded-lg border border-neutral-800">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> 
            <span className="hidden sm:inline">Optimal</span> <span className="text-emerald-500/70">(0-49%)</span>
          </div>
          <div className="flex items-center gap-2 bg-neutral-900/50 px-4 py-2 rounded-lg border border-neutral-800">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div> 
            <span className="hidden sm:inline">Elevated</span> <span className="text-amber-500/70">(50-79%)</span>
          </div>
          <div className="flex items-center gap-2 bg-neutral-900/50 px-4 py-2 rounded-lg border border-neutral-800">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div> 
            <span className="hidden sm:inline">Critical</span> <span className="text-red-500/70">(80%+)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
