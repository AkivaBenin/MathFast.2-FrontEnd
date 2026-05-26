import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export default function RegisterView() {
    const navigate = useNavigate();
    
    // Synchronous check before rendering tree to prevent flash
    const hasToken = !!localStorage.getItem('token');

    useEffect(() => {
        if (hasToken) {
            navigate('/dashboard', { replace: true });
        }
    }, [hasToken, navigate]);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (hasToken) {
        return null;
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');
        
        try {
            await authService.registerTeacher(username, password);
            navigate('/dashboard', { replace: true });
        } catch (error) {
            setErrorMsg(error.message);
            setIsSubmitting(false); // Re-enable for retry
        }
    };

    return (
        <div className="min-h-[100dvh] w-full bg-slate-900 flex flex-col items-center justify-center font-sans text-white safe-top safe-bottom relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950 z-0"></div>
            
            <div className="w-full max-w-md p-4 overflow-y-auto z-10 flex flex-col">
                <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl border-4 border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.6)]">
                    <h1 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-orange-500 mb-8 uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', system-ui" }}>
                        Register
                    </h1>
                    
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500 rounded-xl text-red-200 text-center font-bold">
                            {errorMsg}
                        </div>
                    )}
                    
                    <form onSubmit={handleRegister} className="flex flex-col gap-6">
                        <div className="flex flex-col">
                            <label className="mb-2 font-bold text-fuchsia-300 uppercase tracking-wide text-sm">New Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isSubmitting}
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck="false"
                                className="h-12 min-h-[48px] bg-slate-900/50 border-2 border-slate-600 rounded-xl px-4 text-xl text-white outline-none focus:border-fuchsia-400 focus:shadow-[0_0_10px_rgba(217,70,239,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        
                        <div className="flex flex-col">
                            <label className="mb-2 font-bold text-orange-300 uppercase tracking-wide text-sm">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                                autoComplete="new-password"
                                autoCapitalize="none"
                                spellCheck="false"
                                className="h-12 min-h-[48px] bg-slate-900/50 border-2 border-slate-600 rounded-xl px-4 text-xl text-white outline-none focus:border-orange-400 focus:shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-4 min-h-[48px] h-14 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 border-2 border-fuchsia-300 rounded-xl font-black text-xl uppercase tracking-wider text-white shadow-[0_0_15px_rgba(217,70,239,0.8)] hover:shadow-[0_0_25px_rgba(217,70,239,1)] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSubmitting ? 'Initializing...' : 'Create Account'}
                        </button>
                        
                        <div className="text-center mt-4 flex items-center justify-center">
                            <Link 
                                to="/login" 
                                className={`text-slate-400 hover:text-fuchsia-300 transition-colors font-semibold uppercase text-sm inline-flex items-center justify-center min-h-[48px] min-w-[48px] px-4 rounded-lg ${isSubmitting ? 'pointer-events-none opacity-50' : 'pointer-events-auto'}`}
                            >
                                Have clearance? Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
