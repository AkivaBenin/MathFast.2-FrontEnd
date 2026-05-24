import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function JoinView() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [roomCode, setRoomCode] = useState('');
    const [nickname, setNickname] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(location.state?.error || '');

    const handleRoomCodeChange = (e) => {
        // Programmatic sanitization: uppercase, alphanumeric only, max 6 characters
        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        setRoomCode(val);
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!roomCode || !nickname) return;
        
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            // Target the backend anonymous boundary 'POST /api/auth/guest/join'
            const response = await fetch('/api/auth/guest/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ roomCode, nickname }) // JoinRequestDto
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to join race.');
            }

            const data = await response.json();
            
            // Synchronously write raw 'token' string
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            
            // Synchronously write nested 'participant' profile object data fields
            if (data.participant) {
                localStorage.setItem('participant_id', data.participant.id);
                localStorage.setItem('participant_nickname', data.participant.nickname);
                localStorage.setItem('participant_role', data.participant.role);
                localStorage.setItem('participant_score', data.participant.score);
                localStorage.setItem('participant', JSON.stringify(data.participant));
            }

            // Route user cleanly
            navigate('/lobby', { replace: true });
        } catch (error) {
            setErrorMsg(error.message);
            setIsSubmitting(false); // only re-enable on failure
        }
    };

    return (
        <div className="min-h-[100dvh] w-full bg-slate-900 flex flex-col items-center justify-center font-sans text-white safe-top safe-bottom relative overflow-hidden">
            {/* Visual background layers */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-green-950 z-0"></div>
            
            <div className="w-full max-w-md p-4 overflow-y-auto z-10 flex flex-col">
                <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl border-4 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                    <h1 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-8 uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', system-ui" }}>
                        Join Race
                    </h1>
                    
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500 rounded-xl text-red-200 text-center font-bold">
                            {errorMsg}
                        </div>
                    )}
                    
                    <form onSubmit={handleJoin} className="flex flex-col gap-6">
                        <div className="flex flex-col">
                            <label className="mb-2 font-bold text-green-300 uppercase tracking-wide text-sm">Room Code</label>
                            <input
                                type="text"
                                value={roomCode}
                                onChange={handleRoomCodeChange}
                                disabled={isSubmitting}
                                autoComplete="off"
                                autoCapitalize="none"
                                spellCheck="false"
                                placeholder="ENTER CODE"
                                className="h-12 min-h-[48px] bg-slate-900/50 border-2 border-slate-600 rounded-xl px-4 text-2xl tracking-widest text-center text-white outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase font-mono"
                            />
                        </div>
                        
                        <div className="flex flex-col">
                            <label className="mb-2 font-bold text-emerald-300 uppercase tracking-wide text-sm">Racer Nickname</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value.slice(0, 16))}
                                disabled={isSubmitting}
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck="false"
                                placeholder="YOUR NAME"
                                className="h-12 min-h-[48px] bg-slate-900/50 border-2 border-slate-600 rounded-xl px-4 text-xl text-center text-white outline-none focus:border-emerald-400 focus:shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || roomCode.length < 3 || nickname.length < 2}
                            className="mt-4 min-h-[48px] h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 border-2 border-green-300 rounded-xl font-black text-xl uppercase tracking-wider text-white shadow-[0_0_15px_rgba(34,197,94,0.8)] hover:shadow-[0_0_25px_rgba(34,197,94,1)] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSubmitting ? 'Igniting Engine...' : 'Ready'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
