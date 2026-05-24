import React, { useState, useEffect, useRef } from 'react';

export default function QuestionTimerBar({ duration = 30, onTimeUp, nonce }) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const barRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        // Reset internal numeric state
        setTimeLeft(duration);
        
        // Hardware-Accelerated Width Shrinkage Reset
        if (barRef.current) {
            // Instantly remove transition and restore to 100%
            barRef.current.style.transition = 'none';
            barRef.current.style.width = '100%';
            
            // Force browser reflow to register the instant DOM change synchronously
            void barRef.current.offsetWidth;
            
            // Re-apply uniform linear hardware transition targeting the entire duration
            barRef.current.style.transition = `width ${duration}s linear`;
            barRef.current.style.width = '0%';
        }

        // Clear existing interval if any
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        // Start non-layout-blocking text countdown
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    if (onTimeUp) onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [duration, onTimeUp, nonce]);

    // Color shifting logic mapped to remaining visual time
    const getBarColor = () => {
        const ratio = timeLeft / duration;
        if (ratio > 0.5) return 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.6)]';
        if (ratio > 0.25) return 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]';
        return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse';
    };

    return (
        <div className="w-full bg-slate-900 border-4 border-slate-700 rounded-lg p-1 relative overflow-hidden">
            <div className="w-full h-10 bg-slate-800 rounded relative overflow-hidden">
                {/* Visual hardware-accelerated bar offloaded to GPU */}
                <div 
                    ref={barRef}
                    className={`h-full rounded ${getBarColor()}`}
                    style={{ willChange: 'width' }}
                />
                
                {/* Anti-Jitter Tabular Typography Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center text-white font-black text-2xl tabular-nums tracking-widest z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    00:{timeLeft.toString().padStart(2, '0')}
                </div>
            </div>
        </div>
    );
}
