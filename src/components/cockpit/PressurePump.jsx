import React, { useRef, useState, useCallback } from 'react';

export default function PressurePump({ roomId, playerId, onCleared }) {
    const containerRef = useRef(null);
    const tickerRef = useRef(null);
    const [isShaking, setIsShaking] = useState(false);
    const [isCleared, setIsCleared] = useState(false);

    // Local Score Throttling Override Configuration
    // Adapts active difficulty to the lowest point threshold during penalty
    const throttledDifficultyToken = "REGULAR";

    const handleTap = useCallback(async (e) => {
        // Prevent mobile browser 300ms zoom delay natively
        if (e && e.preventDefault) e.preventDefault();
        
        if (isCleared) return;
        
        if (containerRef.current && tickerRef.current) {
            // Real-Time Precise DOM Interception bypassing React virtual DOM
            const containerRect = containerRef.current.getBoundingClientRect();
            const tickerRect = tickerRef.current.getBoundingClientRect();
            
            const containerWidth = containerRect.width;
            const tickerCenter = tickerRect.left + (tickerRect.width / 2);
            const containerStart = containerRect.left;
            
            // Sub-Millisecond Hit Detection (Relative coordinates mapping)
            const relativePos = ((tickerCenter - containerStart) / containerWidth) * 100;
            
            if (relativePos >= 45 && relativePos <= 55) {
                // Perfect hit recognized
                setIsCleared(true);
                
                try {
                    const token = localStorage.getItem('token');
                    
                    // Clear Stall Transaction targeted strictly to routing specification
                    await fetch(`/api/race/${roomId}/clear-stall`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ 
                            playerId: playerId,
                            throttledDifficulty: throttledDifficultyToken // Ensure correct backend scoring fallback behavior
                        })
                    });
                    
                    if (onCleared) onCleared();
                } catch (err) {
                    console.error("Network fault dispatching clear stall payload", err);
                }
            } else {
                // Missed -> Trigger hardware accelerated 3D shake
                setIsShaking(true);
                
                // Frame Throttling: docking state changes into native refresh intervals
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        setIsShaking(false);
                    });
                }, 400); // Wait for the .animate-shake CSS class duration
            }
        }
    }, [isCleared, roomId, playerId, onCleared]);

    return (
        <div 
            className={`w-full max-w-sm mx-auto bg-slate-900 border-[6px] border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center select-none shadow-[0_30px_60px_rgba(0,0,0,0.9)] transition-opacity duration-300 ${isShaking ? 'animate-shake' : ''}`}
            style={{ willChange: 'transform' }}
        >
            <div className="flex flex-col items-center text-center mb-8">
                <h3 className="text-red-500 font-black text-3xl uppercase tracking-widest mb-3 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]">
                    Engine Stall
                </h3>
                <p className="text-slate-400 font-bold text-sm leading-relaxed px-2">
                    Penalty Active! Tap precisely when the line crosses the <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,1)]">Cyan Zone</span> to restore telemetry.
                </p>
                <div className="mt-2 text-xs font-bold text-yellow-500 bg-yellow-900/30 px-3 py-1 rounded-full uppercase tracking-widest">
                    Score Throttled
                </div>
            </div>

            <div 
                ref={containerRef}
                className="w-full h-16 bg-slate-950 rounded-full border-[4px] border-slate-800 relative overflow-hidden mb-8 shadow-inner touch-manipulation cursor-pointer"
                onTouchEnd={handleTap}
                onClick={handleTap}
            >
                {/* Visual Target Zone Bounding (45% - 55%) */}
                <div className="absolute top-0 bottom-0 left-[45%] w-[10%] bg-cyan-900/60 border-x-4 border-cyan-500 z-10 pointer-events-none" />
                <div className="absolute top-1/2 left-[50%] w-1 h-full bg-cyan-200 transform -translate-x-1/2 -translate-y-1/2 z-10 opacity-90 shadow-[0_0_10px_rgba(34,211,238,1)] pointer-events-none" />

                {/* Hardware Accelerated Ticker Engine decoupled from React State */}
                <div className="absolute top-0 bottom-0 left-0 w-full animate-ping-pong z-20 pointer-events-none" style={{ willChange: 'transform' }}>
                    <div 
                        ref={tickerRef}
                        className="absolute top-0 bottom-0 left-0 w-2 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] rounded-full" 
                    />
                </div>
            </div>
            
            <button 
                onTouchEnd={handleTap}
                onClick={handleTap}
                disabled={isCleared}
                className="w-full h-20 bg-red-900/90 border-[4px] border-b-[8px] border-red-700 rounded-2xl font-black text-white text-2xl uppercase tracking-widest hover:bg-red-800 active:translate-y-2 active:border-b-[4px] transition-all shadow-[0_10px_20px_rgba(0,0,0,0.6)] touch-manipulation"
            >
                {isCleared ? 'RESTARTING...' : 'PUMP PRESSURE'}
            </button>
        </div>
    );
}
