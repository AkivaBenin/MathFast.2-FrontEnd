import React, { useEffect, useState, useCallback } from 'react';

export default function JunctionOverlay({ powerUpPayload, onIncrementScore }) {
    const [activeHighlight, setActiveHighlight] = useState(null);
    const [animationState, setAnimationState] = useState('idle');

    // Solo Power-Up Interceptor Mechanics
    const processPowerUp = useCallback((payload) => {
        if (!payload) return;
        
        try {
            // Absolute millisecond parsing and interceptor logic
            // Expected match flag: { "solo": true, "pointsGained": 15 }
            if (payload.solo === true && payload.pointsGained) {
                // Instantly increment local dashboard score indices seamlessly without blocking
                if (onIncrementScore) {
                    onIncrementScore(payload.pointsGained);
                }
                
                // Trigger non-blocking visual highlight state
                setActiveHighlight(payload.pointsGained);
                setAnimationState('flash');
                
                // Self-clearing ephemeral visual state keeping full input speeds active
                setTimeout(() => {
                    setAnimationState('idle');
                    setActiveHighlight(null);
                }, 800);
            }
        } catch (err) {
            console.error("Failed to parse solo power up payload", err);
        }
    }, [onIncrementScore]);

    useEffect(() => {
        if (powerUpPayload) {
            processPowerUp(powerUpPayload);
        }
    }, [powerUpPayload, processPowerUp]);

    // Mandatory Cleanup Anchors: Unmount Lifecycle Deep Cleanups
    useEffect(() => {
        return () => {
            // Systematically erase all structural local state properties
            setActiveHighlight(null);
            setAnimationState('idle');
            
            // Active track animations and viewport highlight indicators 
            // tied to this component will safely GC on pristine state reset.
        };
    }, []);

    if (animationState === 'idle' || !activeHighlight) return null;

    return (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
            {/* Ephemeral viewport highlight indicator */}
            <div className="absolute inset-0 bg-cyan-400/10 animate-pulse mix-blend-screen" />
            
            <div className="transform transition-transform scale-150 animate-bounce">
                <div className="bg-slate-900/90 backdrop-blur-md border-[4px] border-cyan-400 rounded-3xl p-6 shadow-[0_0_40px_rgba(34,211,238,0.8)] flex flex-col items-center">
                    <span className="text-cyan-400 font-black text-sm uppercase tracking-widest mb-2">
                        Solo Power-Up!
                    </span>
                    <span className="text-yellow-400 font-black text-6xl tabular-nums drop-shadow-[0_0_15px_rgba(250,204,21,1)]">
                        +{activeHighlight}
                    </span>
                </div>
            </div>
        </div>
    );
}
