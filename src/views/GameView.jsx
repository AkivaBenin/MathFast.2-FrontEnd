import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useEventSource from '../hooks/useEventSource';
import VirtualNumpad from '../components/cockpit/VirtualNumpad';

// --- Subcomponents for Immutable Optimization Cascades ---
// They receive shallow immutable copies of telemetry/state to eliminate deep re-render bottlenecks

// Extensible Question Mock Factory Pipeline
const generateMockQuestion = () => {
    // Mocks backend 'MathEngineService' alphanumeric nonce output for forward REST compatibility
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const nonce = 'mock_nonce_' + Math.random().toString(36).substring(2, 11);
    return {
        text: `${a} + ${b}`,
        answer: a + b,
        nonce
    };
};

// Detached visual structure for high-frequency external network ticks
const WindshieldHUD = React.memo(({ telemetry, currentPath }) => {
    // Explicit string keys directly mapping to structural rules
    const pathColors = {
        'REGULAR': 'text-slate-300 border-slate-500 bg-slate-800 shadow-[0_0_15px_rgba(100,116,139,0.5)]',
        'DIRT_ROAD': 'text-amber-400 border-amber-600 bg-amber-900/80 shadow-[0_0_20px_rgba(217,119,6,0.6)]',
        'HIGHWAY': 'text-purple-400 border-purple-600 bg-purple-900/80 shadow-[0_0_25px_rgba(147,51,234,0.7)]'
    };

    const style = pathColors[currentPath] || pathColors['REGULAR'];

    return (
        <div className="w-full flex justify-between items-start mb-6 z-10 pointer-events-none">
            <div className="flex flex-col bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border-2 border-slate-700 shadow-xl">
                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Grid Phase</span>
                <span className="text-xl font-black text-white uppercase">{telemetry.status || 'SYNCING'}</span>
            </div>
            
            <div className="flex flex-col items-center">
                <div className={`px-6 py-2 rounded-full border-2 backdrop-blur-xl transition-colors duration-500 ${style}`}>
                    <span className="font-black tracking-widest uppercase">{currentPath.replace('_', ' ')}</span>
                </div>
            </div>

            <div className="flex flex-col bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border-2 border-slate-700 shadow-xl items-end">
                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Target Score</span>
                <span className="text-2xl font-black text-green-400">{telemetry.targetScore || '---'}</span>
            </div>
        </div>
    );
});

export default function GameView() {
    const navigate = useNavigate();
    
    // Auth memory bindings
    const token = localStorage.getItem('token');
    const participantRaw = localStorage.getItem('participant');
    
    useEffect(() => {
        if (!token) navigate('/join', { replace: true });
    }, [token, navigate]);

    let participant = {};
    try {
        if (participantRaw) participant = JSON.parse(participantRaw);
    } catch (e) {
        console.error("Participant matrix failure", e);
    }

    const roomId = participant.roomId || localStorage.getItem('currentRoomId') || 'pending';
    const playerId = participant.id;

    // --- Stream vs Loop Separation: Detached Telemetry Bucket ---
    // Ingests real-time room leaderboard stats without triggering input erasures
    const { data: streamData } = useEventSource(
        roomId !== 'pending' ? `/api/race/${roomId}/stream` : null
    );

    const [telemetry, setTelemetry] = useState({ status: 'ACTIVE', targetScore: 0, participants: [] });

    useEffect(() => {
        if (streamData) {
            try {
                const state = JSON.parse(streamData);
                if (state.status === 'FINISHED') {
                    navigate('/podium', { replace: true });
                    return;
                }
                // Immutable optimization clone to bypass cascading bottlenecks
                setTelemetry({ ...state });
            } catch (e) {
                // Silently swallow pure stream pings
            }
        }
    }, [streamData, navigate]);

    // --- Local Transactional Bucket: Protected Input Processing ---
    // Isolated cryptographic verification nonce and calculation states
    const [pathTier, setPathTier] = useState('REGULAR'); // Mapped specifically to 'REGULAR', 'DIRT_ROAD', 'HIGHWAY'
    const [currentQuestion, setCurrentQuestion] = useState(generateMockQuestion());
    const [inputValue, setInputValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInput = useCallback((val) => {
        setInputValue(prev => (prev.length < 5 ? prev + val : prev));
    }, []);

    const handleClear = useCallback(() => {
        setInputValue('');
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!inputValue || isSubmitting) return;
        
        const answer = parseInt(inputValue, 10);
        
        // Anti-Overwrite Transactional Bucket execution lock
        setIsSubmitting(true);
        
        // Optimistic local verification validation
        if (answer !== currentQuestion.answer) {
            setInputValue('');
            setIsSubmitting(false);
            return; // Reject false math
        }

        // Aligning exact MoveRequestDto JSON mapping properties
        const payload = {
            playerId: playerId,
            nonce: currentQuestion.nonce,
            answer: answer,
            difficulty: pathTier
        };

        try {
            // Target the specific structural contract for movement updates
            const res = await fetch(`/api/race/${roomId}/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Instantiation pipeline regeneration
                setCurrentQuestion(generateMockQuestion());
                setInputValue('');
            } else {
                console.error("Move request invalid or intercepted as duplicate");
            }
        } catch (error) {
            console.error("Network fault in move dispatch", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [inputValue, isSubmitting, currentQuestion, pathTier, playerId, roomId, token]);

    // Keyboard bindings for PC responsive inputs
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Immediate Key Lockout (Interceptor Dropping)
            if (isSubmitting) return;

            // Localized Key Focus Protectors
            const activeTag = document.activeElement ? document.activeElement.tagName.toUpperCase() : '';
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
                return;
            }

            if (e.key >= '0' && e.key <= '9') {
                handleInput(e.key);
            } else if (e.key === 'Backspace') {
                handleClear();
            } else if (e.key === 'Enter') {
                handleSubmit();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleInput, handleClear, handleSubmit, isSubmitting]);

    const cycleDifficulty = () => {
        setPathTier(prev => {
            if (prev === 'REGULAR') return 'DIRT_ROAD';
            if (prev === 'DIRT_ROAD') return 'HIGHWAY';
            return 'REGULAR';
        });
    };

    if (!token) return null;

    return (
        // Outer Container Envelope: Dynamic viewport scaling and bounds
        <div className="min-h-[100dvh] w-full bg-slate-950 flex flex-col font-sans text-white safe-top safe-bottom relative overflow-hidden">
            
            {/* Immersive structural racing vectors */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
                 style={{ 
                     backgroundImage: 'linear-gradient(to top, rgba(6,182,212,0.8) 0%, transparent 40%), linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)',
                     backgroundSize: '100% 100%'
                 }}>
            </div>

            {/* Desktop Center Widescreen Enforcement ('max-w-7xl mx-auto px-4') */}
            <div className="w-full h-full max-w-7xl mx-auto px-4 py-6 flex flex-col z-10 flex-1">
                
                {/* Independent child component consuming shallow immutable copies */}
                <WindshieldHUD telemetry={telemetry} currentPath={pathTier} />

                {/* Secure isolated calculation interaction layout */}
                <div className="flex-1 flex flex-col items-center justify-center w-full mt-4">
                    
                    <div className="flex gap-4 mb-8 z-20">
                        <button 
                            onClick={cycleDifficulty}
                            className="px-8 py-3 bg-slate-800/90 backdrop-blur-md rounded-full border-2 border-slate-500 text-sm font-black uppercase tracking-widest hover:bg-slate-700 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                        >
                            Toggle Path Route
                        </button>
                        <button 
                            onClick={async () => {
                                try {
                                    await fetch(`/api/race/${roomId}/sabotage`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                } catch (e) { console.error(e); }
                            }}
                            className="px-8 py-3 bg-purple-800/90 backdrop-blur-md rounded-full border-2 border-purple-500 text-sm font-black uppercase tracking-widest hover:bg-purple-700 active:scale-95 transition-all shadow-[0_0_20px_rgba(147,51,234,0.5)]"
                        >
                            Deploy Sabotage
                        </button>
                    </div>

                    <div className="w-full max-w-3xl bg-slate-800/90 backdrop-blur-2xl rounded-[3rem] p-10 md:p-20 border-[6px] border-slate-700 shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col items-center mb-8 relative">
                        {isSubmitting && (
                            <div className="absolute inset-0 bg-slate-950/70 rounded-[2.5rem] flex items-center justify-center z-20 backdrop-blur-sm transition-opacity">
                                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-6 drop-shadow-sm">Decrypt Coordinates</span>
                        
                        <h2 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)] mb-4 md:mb-8 transition-all" style={{ fontFamily: "'Press Start 2P', system-ui", lineHeight: '1.2' }}>
                            {currentQuestion.text}
                        </h2>
                    </div>

                    {/* Secondary Optimization Cascade consuming isolated transactional bounds */}
                    <VirtualNumpad 
                        onInput={handleInput} 
                        onSubmit={handleSubmit} 
                        onClear={handleClear} 
                        currentInput={inputValue}
                        isSubmitting={isSubmitting} 
                    />
                </div>
            </div>
        </div>
    );
}
