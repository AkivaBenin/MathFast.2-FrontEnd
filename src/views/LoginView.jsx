import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export default function LoginView() {
    const navigate = useNavigate();
    
    // Synchronous check before rendering tree to prevent flash
    const hasToken = !!localStorage.getItem('token');

    useEffect(() => {
        if (hasToken) {
            navigate('/lobby', { replace: true });
        }
    }, [hasToken, navigate]);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (hasToken) {
        return null; 
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');
        
        try {
            await authService.loginTeacher(username, password);
            navigate('/lobby', { replace: true });
        } catch (error) {
            setErrorMsg(error.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[100dvh] w-full bg-slate-900 flex flex-col items-center justify-center font-sans text-white safe-top safe-bottom relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950 z-0"></div>
            
            <div className="w-full max-w-md p-4 overflow-y-auto z-10 flex flex-col">
                <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl border-4 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                    <h1 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-8 uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', system-ui" }}>
                        Login
                    </h1>
                    
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500 rounded-xl text-red-200 text-center font-bold">
                            {errorMsg}
                        </div>
                    )}
                    
                    <form onSubmit={handleLogin} className="flex flex-col gap-6">
                        <div className="flex flex-col">
                            <label className="mb-2 font-bold text-cyan-300 uppercase tracking-wide text-sm">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isSubmitting}
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck="false"
                                className="h-12 min-h-[48px] bg-slate-900/50 border-2 border-slate-600 rounded-xl px-4 text-xl text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        
                        <div className="flex flex-col">
                            <label className="mb-2 font-bold text-blue-300 uppercase tracking-wide text-sm">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                                autoComplete="current-password"
                                autoCapitalize="none"
                                spellCheck="false"
                                className="h-12 min-h-[48px] bg-slate-900/50 border-2 border-slate-600 rounded-xl px-4 text-xl text-white outline-none focus:border-blue-400 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-4 min-h-[48px] h-14 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-2 border-cyan-300 rounded-xl font-black text-xl uppercase tracking-wider text-white shadow-[0_0_15px_rgba(6,182,212,0.8)] hover:shadow-[0_0_25px_rgba(6,182,212,1)] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSubmitting ? 'Authenticating...' : 'Engage'}
                        </button>
                        
                        <div className="text-center mt-4 flex items-center justify-center">
                            <Link 
                                to="/register" 
                                className={`text-slate-400 hover:text-cyan-300 transition-colors font-semibold uppercase text-sm inline-flex items-center justify-center min-h-[48px] min-w-[48px] px-4 rounded-lg ${isSubmitting ? 'pointer-events-none opacity-50' : 'pointer-events-auto'}`}
                            >
                                Need an account? Register
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
