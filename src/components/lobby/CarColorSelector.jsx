import React, { useState, useRef } from 'react';

const COSMETIC_MATRIX = [
    { id: 'RED', label: 'Hyper Red', hex: '#ef4444', border: '#b91c1c' },
    { id: 'BLUE', label: 'Cyber Blue', hex: '#3b82f6', border: '#1d4ed8' },
    { id: 'PURPLE', label: 'Neon Purple', hex: '#a855f7', border: '#7e22ce' },
    { id: 'NEON_CYAN', label: 'Plasma Cyan', hex: '#06b6d4', border: '#0e7490' },
    { id: 'TOXIC_GREEN', label: 'Acid Green', hex: '#22c55e', border: '#15803d' },
    { id: 'GOLD', label: 'Solar Gold', hex: '#eab308', border: '#a16207' },
];

export default function CarColorSelector({ onColorSelect, defaultColor = 'RED' }) {
    const [currentIndex, setCurrentIndex] = useState(() => {
        const index = COSMETIC_MATRIX.findIndex(item => item.id === defaultColor);
        return index !== -1 ? index : 0;
    });
    
    // Transactional Selection State Matrix to prevent UI flicker
    const [isPending, setIsPending] = useState(false);
    
    // Mobile touch interaction anchors
    const touchOriginX = useRef(null);

    const attachTouchOrigin = (e) => {
        if (isPending) return;
        touchOriginX.current = e.changedTouches[0].screenX;
    };

    const processTouchVector = (e) => {
        if (isPending || touchOriginX.current === null) return;
        const currentVectorX = e.changedTouches[0].screenX;
        const vectorDelta = currentVectorX - touchOriginX.current;
        
        // Exceed 40px threshold to trigger navigation
        if (Math.abs(vectorDelta) > 40) {
            if (vectorDelta > 0) {
                cycleMatrix('left');
            } else {
                cycleMatrix('right');
            }
        }
        touchOriginX.current = null;
    };

    const cycleMatrix = (direction) => {
        if (isPending) return;
        setCurrentIndex((prev) => {
            if (direction === 'right') return (prev + 1) % COSMETIC_MATRIX.length;
            if (direction === 'left') return (prev - 1 + COSMETIC_MATRIX.length) % COSMETIC_MATRIX.length;
            return prev;
        });
    };

    const dispatchMatrixLock = async () => {
        if (isPending) return;
        
        // Interactive Lockout Guardrail
        setIsPending(true);
        
        try {
            await onColorSelect(COSMETIC_MATRIX[currentIndex].id);
        } catch (error) {
            console.error("Cosmetic persistence fault", error);
        } finally {
            setIsPending(false);
        }
    };

    const activeAsset = COSMETIC_MATRIX[currentIndex];

    return (
        <div className="w-full flex flex-col items-center select-none pt-2 pb-2">
            <h3 className="text-xl font-bold uppercase tracking-widest text-slate-300 mb-6" style={{ fontFamily: "'Press Start 2P', system-ui" }}>
                Vehicle Configuration
            </h3>
            
            <div className="relative flex items-center justify-between w-full max-w-[280px] mb-6">
                
                {/* Chevron Left - Dual Modality Button */}
                <button 
                    onClick={() => cycleMatrix('left')}
                    disabled={isPending}
                    className="w-12 h-12 min-w-[48px] min-h-[48px] flex flex-col items-center justify-center bg-slate-800 rounded-full border-2 border-slate-600 active:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-6 h-6 text-white ml-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
                </button>

                {/* Gesture Conflict Mitigation Wrapper (touch-action: pan-y) */}
                <div 
                    className="relative flex flex-col items-center justify-center border-4 rounded-xl p-4 transition-colors duration-300 overflow-hidden bg-slate-900 shadow-xl"
                    style={{ borderColor: activeAsset.border, touchAction: 'pan-y' }}
                    onTouchStart={attachTouchOrigin}
                    onTouchEnd={processTouchVector}
                >
                    {isPending && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex items-center justify-center z-10 transition-opacity">
                            <div className="w-8 h-8 border-4 border-slate-600 border-t-white rounded-full animate-spin"></div>
                        </div>
                    )}
                    
                    {/* Vector Chassis Simulation */}
                    <div className="w-24 h-16 rounded-md shadow-inner mb-2 flex items-center justify-center" style={{ backgroundColor: activeAsset.hex }}>
                        <div className="w-16 h-8 bg-slate-950/40 rounded-t-md mt-2 border-b-2 border-slate-800/50"></div>
                    </div>
                    
                    <span className="font-black tracking-widest uppercase text-xs" style={{ color: activeAsset.hex }}>
                        {activeAsset.label}
                    </span>
                    
                    {/* High-Contrast Selection Accessibility */}
                    <div className="absolute top-2 right-2 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center border-2 border-white shadow-lg pointer-events-none">
                        <svg className="w-3 h-3 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                </div>

                {/* Chevron Right - Dual Modality Button */}
                <button 
                    onClick={() => cycleMatrix('right')}
                    disabled={isPending}
                    className="w-12 h-12 min-w-[48px] min-h-[48px] flex flex-col items-center justify-center bg-slate-800 rounded-full border-2 border-slate-600 active:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-6 h-6 text-white ml-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>
            
            <button
                onClick={dispatchMatrixLock}
                disabled={isPending}
                className="w-full max-w-[280px] h-14 min-h-[48px] bg-gradient-to-r from-slate-200 to-white text-slate-900 font-black uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.3)] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
                {isPending ? 'Syncing...' : 'Lock Variant'}
            </button>
        </div>
    );
}
