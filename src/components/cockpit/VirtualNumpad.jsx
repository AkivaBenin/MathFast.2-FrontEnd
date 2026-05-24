import React from 'react';

const VirtualNumpad = React.memo(({ onInput, onSubmit, onClear, currentInput, isSubmitting }) => {
    
    // Explicit Touch Event Handler to Bypass 300ms Zoom Delay on Mobile
    const createTouchHandler = (callback) => (e) => {
        // Immediate Key Lockout (Interceptor Dropping)
        if (isSubmitting) return;
        
        // 300ms Zoom Lag Elimination
        e.preventDefault(); // Prevents native browser zoom and scroll cascading
        callback();
    };

    const createClickHandler = (callback) => (e) => {
        // Immediate Key Lockout (Interceptor Dropping)
        if (isSubmitting) return;
        
        callback();
    };

    const padClasses = "h-20 bg-slate-800 border-2 border-slate-600 rounded-xl text-4xl font-black text-white hover:bg-slate-700 active:scale-95 transition-transform flex items-center justify-center select-none shadow-[0_4px_0_rgb(71,85,105)] active:shadow-none active:translate-y-1 touch-manipulation";

    return (
        <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-3 p-4 bg-slate-900/90 backdrop-blur-xl rounded-3xl border-4 border-slate-700 shadow-2xl select-none">
            {/* Input Display Area */}
            <div className="col-span-3 h-20 mb-2 bg-slate-950 rounded-2xl border-4 border-slate-800 flex items-center justify-center overflow-hidden relative shadow-inner">
                <span className="text-5xl font-mono text-cyan-400 tracking-widest">{currentInput || '_'}</span>
            </div>
            
            {/* Positive Integer Matrix 1-9 (No negative or decimal buttons) */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button 
                    key={num} 
                    onTouchEnd={createTouchHandler(() => onInput(num.toString()))}
                    onClick={createClickHandler(() => onInput(num.toString()))}
                    className={padClasses}
                    disabled={isSubmitting}
                >
                    {num}
                </button>
            ))}
            
            {/* Explicit Backspace/Clear */}
            <button 
                onTouchEnd={createTouchHandler(onClear)}
                onClick={createClickHandler(onClear)}
                className="h-20 bg-red-900/90 border-2 border-red-700 rounded-xl text-xl font-black text-red-200 hover:bg-red-800 active:scale-95 transition-transform flex items-center justify-center select-none shadow-[0_4px_0_rgb(185,28,28)] active:shadow-none active:translate-y-1 touch-manipulation"
                disabled={isSubmitting}
            >
                CLR
            </button>
            
            <button 
                onTouchEnd={createTouchHandler(() => onInput('0'))}
                onClick={createClickHandler(() => onInput('0'))}
                className={padClasses}
                disabled={isSubmitting}
            >
                0
            </button>
            
            {/* Explicit Transmission Command */}
            <button 
                onTouchEnd={createTouchHandler(onSubmit)}
                onClick={createClickHandler(onSubmit)}
                className="h-20 bg-cyan-600 border-2 border-cyan-500 rounded-xl text-lg font-black text-cyan-100 hover:bg-cyan-500 active:scale-95 transition-transform flex items-center justify-center select-none shadow-[0_4px_0_rgb(6,182,212)] active:shadow-none active:translate-y-1 touch-manipulation"
                disabled={isSubmitting}
            >
                ENTER
            </button>
        </div>
    );
});

export default VirtualNumpad;
