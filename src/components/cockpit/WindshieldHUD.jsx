import React from 'react';

export default function WindshieldHUD({ player }) {
    if (!player) return null;

    // Apply cartoon math performance multiplier for dynamic speedometer projection
    // Raw points (10, 15, 20) translate to massive speed outputs
    const rawScore = player.score || 0;
    const projectedSpeed = rawScore * 5;

    // Calculate rotation for retro speedometer dial (spanning 180 degrees)
    const maxSpeed = 1000;
    const speedPercentage = Math.min(projectedSpeed / maxSpeed, 1);
    const angle = -90 + (speedPercentage * 180); // Sweeps from -90deg (far left) to +90deg (far right)

    return (
        <div className="w-full bg-slate-900 border-4 border-slate-700 rounded-xl p-6 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            <div className="text-center mb-6">
                <h2 className="text-cyan-400 font-black text-2xl uppercase tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                    Telemetry
                </h2>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                    HUD Active
                </div>
            </div>

            <div className="flex flex-col items-center">
                {/* Speedometer Gauge Arc */}
                <div className="relative w-64 h-32 overflow-hidden border-b-4 border-slate-600 mb-2">
                    {/* Tick marks and arc background */}
                    <div className="absolute top-0 left-0 w-64 h-64 rounded-full border-[12px] border-slate-800 border-t-slate-700 border-l-slate-700 transform -rotate-45" />
                    
                    {/* The Needle */}
                    <div 
                        className="absolute bottom-0 left-1/2 w-1.5 h-28 bg-red-500 origin-bottom rounded-t-full shadow-[0_0_15px_rgba(239,68,68,0.9)] transition-transform duration-700 ease-out z-20"
                        style={{ 
                            transform: `translateX(-50%) rotate(${angle}deg)`,
                            willChange: 'transform'
                        }}
                    />
                    
                    {/* Center Hub */}
                    <div className="absolute bottom-0 left-1/2 w-8 h-8 bg-slate-300 rounded-full transform -translate-x-1/2 translate-y-1/2 z-30 border-4 border-slate-900 shadow-inner" />
                </div>

                {/* Speed Readout - Enforcing Anti-Jitter Tabular Typography */}
                <div className="mt-4 flex flex-col items-center">
                    <div className="text-6xl font-black text-yellow-400 tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                        {projectedSpeed}
                    </div>
                    <div className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
                        MPH
                    </div>
                </div>

                {/* Player Metadata Bindings */}
                <div className="mt-6 flex justify-between w-full border-t border-slate-700 pt-4">
                    <div className="flex flex-col">
                        <span className="text-slate-500 text-xs font-bold uppercase">Racer</span>
                        <span className="text-white font-bold truncate max-w-[120px]">{player.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-slate-500 text-xs font-bold uppercase">Raw Score</span>
                        <span className="text-white font-bold tabular-nums">{rawScore}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
