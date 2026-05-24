import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ConnectionStatus() {
    const navigate = useNavigate();
    // Ambient states: 'Connected', 'Connecting...', 'Weak Signal', 'Re-attaching to Race Grid', 'Suspended'
    const [status, setStatus] = useState('Connected'); 
    const pollingIntervalRef = useRef(null);

    const clearNetworkTimers = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    const startBackgroundChecks = () => {
        clearNetworkTimers();
        // Fallback polling loop mimicking standard network maintenance
        pollingIntervalRef.current = setInterval(() => {
            // Passive network checks could execute here
        }, 30000); 
    };

    const executeReconciliationPing = async () => {
        setStatus('Re-attaching to Race Grid');
        
        const token = localStorage.getItem('token');
        if (!token) {
            enforceCacheWipe("Session expired. Please rejoin.");
            return;
        }

        try {
            // Dispatch isolated network check to confirm context execution validity
            // Pinging an authenticated endpoint to verify security boundaries
            const response = await fetch('/api/rooms/ping', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // The moment server rejects context via 401/403, we execute full cache tear-down
            if (response.status === 401 || response.status === 403) {
                enforceCacheWipe("Room closed or session expired.");
                return;
            }

            setStatus('Connected');
            startBackgroundChecks();
        } catch (error) {
            setStatus('Weak Signal');
            // Allow retry algorithms to kick in naturally without blocking main UI
            startBackgroundChecks();
        }
    };

    const enforceCacheWipe = (errorMessage) => {
        // Automatically wipe local guest token cache
        localStorage.removeItem('token');
        
        // Flush local participant stores immediately
        localStorage.removeItem('participant');
        localStorage.removeItem('participant_id');
        localStorage.removeItem('participant_nickname');
        localStorage.removeItem('participant_role');
        localStorage.removeItem('participant_score');
        
        // Cleanly route back to onboarding gateway with readable overlay
        navigate('/join', { state: { error: errorMessage }, replace: true });
    };

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Instantly unbind and destroy all recurring loops to block mobile timer storm accumulation
                clearNetworkTimers();
                setStatus('Suspended');
            } else if (document.visibilityState === 'visible') {
                // Exactly one single isolated ping on device wake
                executeReconciliationPing();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        startBackgroundChecks();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearNetworkTimers();
        };
    }, []);

    // Provide non-intrusive ambient overlay rendering
    if (status === 'Connected' || status === 'Suspended') {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 w-full z-[100] pointer-events-none flex justify-center safe-top pt-2">
            <div className="bg-amber-500/90 backdrop-blur-md border-b-4 border-amber-700 text-white font-bold px-6 py-2 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] text-sm uppercase tracking-wider animate-pulse flex items-center gap-2 transition-all duration-300">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                {status}
            </div>
        </div>
    );
}
