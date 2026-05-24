import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useEventSource from '../hooks/useEventSource';
import Countdown from '../components/lobby/Countdown';

export default function DashboardView() {
    const navigate = useNavigate();
    
    const token = localStorage.getItem('token');
    const participantRaw = localStorage.getItem('participant');
    
    useEffect(() => {
        if (!token) {
            navigate('/login', { replace: true });
        }
    }, [token, navigate]);

    let participant = {};
    try {
        if (participantRaw) {
            participant = JSON.parse(participantRaw);
        }
    } catch (e) {
        console.error("Participant matrix parsing failure", e);
    }

    const roomId = participant.roomId || localStorage.getItem('currentRoomId') || 'pending';

    // Establish Real-Time Stream Interface to consume authoritative SSE channel
    const { data: streamData } = useEventSource(
        roomId !== 'pending' ? `/api/race/${roomId}/stream` : null
    );

    const [roomState, setRoomState] = useState(null);
    const [isStarting, setIsStarting] = useState(false);
    const [targetScore, setTargetScore] = useState(100);

    useEffect(() => {
        if (streamData) {
            try {
                // Parse authoritative stream payloads broadcast under "roomState"
                const state = JSON.parse(streamData);
                setRoomState(state);
            } catch (e) {
                // Silently swallow parse errors to prevent execution stutter
            }
        }
    }, [streamData]);

    const handleStartRace = async () => {
        if (isStarting) return;
        
        // Action Field Lockout: Implement instantaneous execution freeze on all instructor controls
        setIsStarting(true);
        
        try {
            // Map administrative execution to protected route transmitting target configuration
            const res = await fetch(`/api/rooms/${roomId}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetScore })
            });
            
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error("Activation dispatch rejected by backend logic", err);
                setIsStarting(false);
            }
            // Upon success, rely purely on the SSE stream to route us into 'STARTING' phase
        } catch (error) {
            console.error("Network fault during activation command", error);
            setIsStarting(false);
        }
    };

    if (!token) return null;

    // Lifecycle State Routing: Explicit pattern-matching against backend GameState schema
    const currentPhase = roomState?.status || 'LOBBY';

    return (
        <div className="min-h-[100dvh] w-full bg-slate-900 bg-[url('/neon-grid.svg')] bg-cover bg-center flex flex-col font-sans text-white safe-top safe-bottom p-4 md:p-8 overflow-hidden">
            
            <header className="w-full flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-800/90 backdrop-blur-md p-6 rounded-2xl border-4 border-slate-700 shadow-xl gap-4">
                <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 uppercase tracking-widest text-center md:text-left" style={{ fontFamily: "'Press Start 2P', system-ui" }}>
                    Console
                </h1>
                <div className="flex items-center gap-4 flex-wrap justify-center">
                    <span className="font-bold text-slate-400 text-sm md:text-base uppercase tracking-widest flex items-center gap-2">
                        Grid Code: 
                        <span className="text-white bg-slate-900 px-4 py-2 rounded-lg border-2 border-slate-600 font-mono text-lg">{roomState?.roomCode || '---'}</span>
                    </span>
                    <span className={`px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest border-2 shadow-inner ${currentPhase === 'LOBBY' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : currentPhase === 'STARTING' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : currentPhase === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-blue-500/20 text-blue-400 border-blue-500/50'}`}>
                        {currentPhase}
                    </span>
                </div>
            </header>

            <main className="flex-1 w-full flex flex-col items-center justify-center">
                {currentPhase === 'LOBBY' && (
                    <div className="w-full max-w-lg bg-slate-800/90 backdrop-blur-xl p-8 md:p-12 rounded-3xl border-[6px] border-purple-500/60 shadow-[0_0_40px_rgba(168,85,247,0.3)] flex flex-col items-center transition-all animate-in fade-in zoom-in-95">
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-8 text-purple-300 text-center">Mission Parameters</h2>
                        
                        <div className="w-full flex flex-col mb-10">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Target Score Threshold</label>
                            <input 
                                type="number" 
                                value={targetScore} 
                                onChange={(e) => setTargetScore(parseInt(e.target.value) || 0)}
                                disabled={isStarting}
                                min="10"
                                max="1000"
                                className="w-full h-20 bg-slate-950 border-4 border-slate-600 rounded-2xl text-center text-4xl font-black text-white focus:border-purple-400 outline-none transition-colors disabled:opacity-50 font-mono shadow-inner"
                            />
                        </div>

                        <button 
                            onClick={handleStartRace}
                            disabled={isStarting}
                            className="w-full h-20 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-2xl text-xl md:text-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(168,85,247,0.6)] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center border-4 border-purple-400/30"
                        >
                            {isStarting ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Transmitting...</span>
                                </div>
                            ) : 'Initiate Sequence'}
                        </button>
                    </div>
                )}

                {currentPhase === 'STARTING' && (
                    <Countdown roomState={roomState} />
                )}

                {currentPhase === 'ACTIVE' && (
                    <div className="w-full flex-1 bg-slate-800/90 backdrop-blur-xl p-8 rounded-3xl border-4 border-green-500/50 shadow-2xl flex flex-col items-center justify-center animate-in zoom-in-95">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border-4 border-green-500 animate-pulse">
                            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-green-400 uppercase tracking-widest text-center" style={{ fontFamily: "'Press Start 2P', system-ui", lineHeight: '1.4' }}>RACE ACTIVE</h2>
                    </div>
                )}

                {currentPhase === 'FINISHED' && (
                    <div className="w-full max-w-4xl bg-slate-800/90 backdrop-blur-xl p-8 rounded-3xl border-4 border-blue-500/50 shadow-2xl flex flex-col items-center justify-center min-h-[40vh] animate-in zoom-in-95">
                        <h2 className="text-3xl md:text-5xl font-black text-blue-400 uppercase tracking-widest mb-6 text-center" style={{ fontFamily: "'Press Start 2P', system-ui", lineHeight: '1.4' }}>RACE CONCLUDED</h2>
                        <button onClick={() => navigate('/lobby')} className="mt-8 px-8 py-4 bg-blue-600 rounded-xl font-bold uppercase tracking-wider text-white shadow-lg hover:bg-blue-500 transition-colors">Return to Lobby</button>
                    </div>
                )}
            </main>
        </div>
    );
}
