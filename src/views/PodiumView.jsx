import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PodiumView() {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // --- Session Termination and Purge Protocol ---
        // Executes the absolute millisecond the podium component layout mounts
        
        // 1. Forcefully disconnect active real-time SSE pipeline hooks
        if (window.__activeEventSource && typeof window.__activeEventSource.close === 'function') {
            window.__activeEventSource.close();
            window.__activeEventSource = null;
        }

        // 2. Clear any active mathematical question timer intervals (global sweep protocol)
        const highestTimeoutId = window.setTimeout(() => {}, 0);
        for (let i = highestTimeoutId; i >= 0; i--) {
            window.clearInterval(i);
            window.clearTimeout(i);
        }

        // 3. Destroy localized question cache structures
        sessionStorage.removeItem('questionCache');

        const token = localStorage.getItem('token');
        const participantRaw = localStorage.getItem('participant');
        let roomCode = 'unknown';

        if (participantRaw) {
            try {
                const participant = JSON.parse(participantRaw);
                // Matches the backend entity mapping structure requirement
                roomCode = participant.roomCode || localStorage.getItem('currentRoomCode') || 'unknown';
            } catch (e) {
                console.error("Failed to parse participant for teardown", e);
            }
        }

        // Podium Results Mapping via Extensible REST Path Matrix
        const fetchResults = async () => {
            try {
                // Target layout targeting GET /api/race/results/{roomCode}
                const res = await fetch(`/api/race/results/${roomCode}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Maps deserialized JSON array to 'GameHistory' entity fields precisely
                    setResults(data);
                } else {
                    setError("Failed to retrieve final telemetry.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                
                // 4. Purge ephemeral race tracking variables or token caches from local storage
                localStorage.removeItem('token');
                localStorage.removeItem('participant');
                localStorage.removeItem('currentRoomId');
                localStorage.removeItem('currentRoomCode');
            }
        };

        if (roomCode !== 'unknown' && token) {
            fetchResults();
        } else {
            setLoading(false);
            // Pristine State Reset fallback
            localStorage.clear(); 
        }

        // --- Mandatory Cleanup Anchors: Unmount Lifecycle Deep Cleanups ---
        return () => {
            // Systematically erase all structural local state properties and component memory tokens
            setResults([]);
            setLoading(true);
            setError(null);
        };
    }, []);

    const handleReturnToLobby = () => {
        // Navigating away returns the app to an onboarding pristine state
        navigate('/join', { replace: true });
    };

    if (loading) {
        return (
            <div className="min-h-[100dvh] w-full bg-slate-950 flex flex-col items-center justify-center text-cyan-400 font-black text-3xl animate-pulse tracking-widest uppercase">
                <div className="w-16 h-16 border-8 border-cyan-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                Calculating Telemetry...
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] w-full bg-slate-950 flex flex-col items-center py-10 px-4 font-sans text-white safe-top safe-bottom relative overflow-hidden">
            
            {/* Background celebratory layers */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30" 
                 style={{ backgroundImage: 'radial-gradient(circle at top, rgba(250,204,21,0.2) 0%, transparent 60%)' }}>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mb-12 drop-shadow-[0_10px_20px_rgba(250,204,21,0.6)] uppercase tracking-widest text-center z-10" style={{ fontFamily: "'Press Start 2P', system-ui" }}>
                PODIUM
            </h1>

            {error && (
                <div className="bg-red-900/80 border-2 border-red-500 text-red-200 px-6 py-4 rounded-2xl mb-8 font-bold z-10 shadow-2xl">
                    {error}
                </div>
            )}

            <div className="w-full max-w-3xl bg-slate-900/90 backdrop-blur-xl border-[6px] border-slate-700 rounded-[3rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] mb-10 flex flex-col gap-6 z-10">
                {results.length === 0 && !error ? (
                    <div className="text-center text-slate-500 font-bold uppercase tracking-widest py-10">
                        No telemetry data recovered for this session.
                    </div>
                ) : (
                    results.map((entry, index) => {
                        const isWinner = index === 0;
                        const rankColor = isWinner ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' 
                                          : index === 1 ? 'text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.6)]' 
                                          : index === 2 ? 'text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.6)]' 
                                          : 'text-slate-500';
                        
                        return (
                            <div key={entry.id || index} className={`flex items-center justify-between p-6 rounded-3xl border-4 transition-all hover:scale-[1.02] ${isWinner ? 'bg-yellow-900/30 border-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.3)]' : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'}`}>
                                <div className="flex items-center gap-6">
                                    <span className={`text-6xl font-black tabular-nums ${rankColor}`}>#{index + 1}</span>
                                    <span className="text-3xl font-black uppercase text-white truncate max-w-[150px] md:max-w-[400px] tracking-wider">
                                        {entry.playerNickname}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Score</span>
                                    <span className="text-5xl font-black text-cyan-400 tabular-nums drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                        {entry.score}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <button 
                onClick={handleReturnToLobby}
                className="px-12 py-6 bg-cyan-600 border-[4px] border-b-[8px] border-cyan-800 rounded-3xl font-black text-white text-2xl uppercase tracking-widest hover:bg-cyan-500 active:translate-y-2 active:border-b-[4px] transition-all shadow-[0_15px_30px_rgba(0,0,0,0.7)] z-10"
            >
                Start New Session
            </button>
        </div>
    );
}
