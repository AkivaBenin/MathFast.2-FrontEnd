import React from 'react';

export default function Countdown({ roomState }) {
    if (!roomState) return null;

    // Server-Streamed Truth: No setInterval or setTimeout intervals are executed.
    // The component lifecycle is completely bound to the parent SSE stream packet updates.
    
    // Absolute Delta Synchronization
    // If the backend stream provides explicit markers (e.g. remainingSeconds or timestamps),
    // calculate exact delta metrics on the exact render frame to neutralize drift.
    let displayValue = 0;
    
    if (typeof roomState.remainingSeconds === 'number') {
        // Direct stream synchronization marker
        displayValue = roomState.remainingSeconds;
    } else if (roomState.targetStartTime) {
        // Absolute delta equations computed from payload reference timestamps
        const referenceNow = roomState.currentServerTime || Date.now();
        const deltaMs = Math.max(0, roomState.targetStartTime - referenceNow);
        displayValue = Math.ceil(deltaMs / 1000);
    } else {
        // Safe visual fallback if stream packets omit timing fields temporarily
        displayValue = 3;
    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-lg bg-slate-800/90 backdrop-blur-xl p-12 md:p-16 rounded-[3rem] border-[6px] border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.6)] animate-in zoom-in duration-300">
            <h2 className="text-xl md:text-2xl font-black text-orange-400 uppercase tracking-[0.4em] mb-8 text-center shadow-black drop-shadow-md">
                Ignition Sequence
            </h2>
            <div 
                className="text-8xl md:text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-orange-500 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-all"
                style={{ fontFamily: "'Press Start 2P', system-ui", lineHeight: '1.2' }}
            >
                {displayValue}
            </div>
            
            {/* Real-time progression bar (Assumes 5s max scale for visual representation) */}
            <div className="w-full bg-slate-950 h-6 mt-12 rounded-full overflow-hidden border-4 border-slate-700 shadow-inner">
                <div 
                    className="h-full bg-gradient-to-r from-orange-600 to-yellow-400 transition-all duration-300 ease-out" 
                    style={{ width: `${Math.min(100, Math.max(0, (displayValue / 5) * 100))}%` }} 
                ></div>
            </div>
        </div>
    );
}
