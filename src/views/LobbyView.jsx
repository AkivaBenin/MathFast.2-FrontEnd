import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CarColorSelector from '../components/lobby/CarColorSelector';
import UserList from '../components/lobby/UserList';
import useEventSource from '../hooks/useEventSource';

export default function LobbyView() {
    const navigate = useNavigate();
    
    // Synchronous memory fetch
    const token = localStorage.getItem('token');
    const participantRaw = localStorage.getItem('participant');
    
    useEffect(() => {
        if (!token) {
            navigate('/join', { replace: true });
        }
    }, [token, navigate]);

    // Construct participant matrix
    let currentParticipant = {};
    try {
        if (participantRaw) {
            currentParticipant = JSON.parse(participantRaw);
        }
    } catch (error) {
        console.error("Participant profile parsing failure", error);
    }
    
    const roomId = currentParticipant.roomId || localStorage.getItem('currentRoomId') || 'pending';

    // Hook integration from Phase 3 to watch lobby modifications
    const { data: streamData, status: connectionStatus } = useEventSource(
        roomId !== 'pending' ? `/api/race/${roomId}/stream` : null
    );

    const [lockedColor, setLockedColor] = useState(null);
    const [roster, setRoster] = useState([]);

    useEffect(() => {
        if (streamData) {
            try {
                // Parse the authoritative "roomState" SSE message event payload
                const state = JSON.parse(streamData);
                
                // React to game start transitions
                if (state.type === 'GAME_START' || state.status === 'ACTIVE') {
                    navigate('/game', { replace: true });
                    return;
                }
                
                // Extract the connected player list collection matching ParticipantDto shape
                if (state.participants && Array.isArray(state.participants)) {
                    setRoster(state.participants);
                } else if (Array.isArray(state)) {
                    setRoster(state);
                } else if (state.players && Array.isArray(state.players)) {
                    setRoster(state.players);
                }
            } catch (e) {
                // Silently swallow parse errors for pure stream heartbeats
            }
        }
    }, [streamData, navigate]);

    const handleColorSelection = async (colorId) => {
        return new Promise((resolve) => {
            // Simulated transaction matrix to accommodate future cosmetic persistence APIs
            setTimeout(() => {
                setLockedColor(colorId);
                resolve();
            }, 500); // 500ms interactive lockout guardrail simulation
        });
    };

    if (!token) {
        return null;
    }

    return (
        <div className="min-h-[100dvh] w-full bg-slate-900 bg-[url('/neon-grid.svg')] bg-cover bg-center flex flex-col items-center justify-start pt-10 pb-6 font-sans text-white safe-top safe-bottom overflow-x-hidden">
            <div className="w-full max-w-md flex flex-col items-center px-4 gap-6 h-full">
                
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-2 uppercase tracking-widest drop-shadow-sm" style={{ fontFamily: "'Press Start 2P', system-ui" }}>
                        Race Grid
                    </h1>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-sm animate-pulse">
                        Awaiting Teacher Launch...
                    </p>
                </div>

                {/* Cosmetic Matrix Shell */}
                <div className="w-full bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border-4 border-slate-700 shadow-2xl flex flex-col shrink-0">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-700">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Racer Alias</span>
                            <span className="text-lg font-black text-white truncate max-w-[120px]">{currentParticipant.nickname || 'GUEST_PROTO'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Telemetry</span>
                            <span className={`text-sm font-black uppercase ${connectionStatus === 'connected' || connectionStatus === 'CONNECTED' ? 'text-green-400' : 'text-amber-400'}`}>
                                {connectionStatus || 'LINKING...'}
                            </span>
                        </div>
                    </div>

                    <CarColorSelector onColorSelect={handleColorSelection} defaultColor={lockedColor || 'RED'} />
                </div>

                {/* Real-time presence engine integration container */}
                <div className="w-full bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border-4 border-slate-700 shadow-xl flex flex-col flex-1 max-h-[50vh]">
                    <UserList participants={roster} />
                </div>
            </div>
        </div>
    );
}
