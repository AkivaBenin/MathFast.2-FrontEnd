import React, { memo } from 'react';

// Structural Change Isolation: Memoize the node to prevent surrounding layout tree recalculations
const UserListItem = memo(({ participant }) => {
    // Programmatically evaluate participant role from ParticipantDto
    const isTeacher = participant.role === 'TEACHER';
    
    return (
        // Performance Opacity Transitions for clean connection state transitions
        <div className="flex items-center justify-between p-3 mb-2 bg-slate-800/60 rounded-xl border-l-4 transition-opacity duration-300 animate-in fade-in shrink-0 shadow-sm hover:bg-slate-700/60" 
             style={{ borderColor: isTeacher ? '#a855f7' : '#3b82f6' }}>
            {/* Responsive Scaling Layouts (Flexbox with non-breaking truncation safety buffers) */}
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                <div className={`w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center font-black text-lg ${isTeacher ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {participant.nickname ? participant.nickname.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="flex flex-col overflow-hidden w-full">
                    <div className="flex items-center gap-2">
                        {/* Hebrew-safe truncation string via dir="auto" */}
                        <span className="font-bold text-white truncate text-lg" dir="auto">
                            {participant.nickname}
                        </span>
                        {/* Premium visual decorator / administrator crown badge for teachers */}
                        {isTeacher && (
                            <span className="text-[10px] bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-[0_0_8px_rgba(168,85,247,0.8)] whitespace-nowrap shrink-0 border border-fuchsia-400/50">
                                HOST 👑
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold truncate">
                        Score: {participant.score || 0}
                    </span>
                </div>
            </div>
            
            {/* Live Connection Telemetry Indicator */}
            <div className={`w-3 h-3 min-w-[12px] rounded-full ml-3 shrink-0 ${isTeacher ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'}`}></div>
        </div>
    );
});

export default function UserList({ participants = [] }) {
    return (
        <div className="w-full flex flex-col h-full min-h-[250px]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between border-b-2 border-slate-700/50 pb-2">
                <span>Active Roster</span>
                <span className="bg-slate-700/50 px-2 py-1 rounded-md text-white text-xs border border-slate-600 shadow-inner">
                    {participants.length} LINKED
                </span>
            </h3>
            
            {/* Fluid Scrolling Acceleration container mapped to -webkit-overflow-scrolling */}
            <div 
                className="w-full flex flex-col flex-1 overflow-y-auto pr-1 pb-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
                style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
            >
                {participants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-60">
                        <div className="w-8 h-8 border-4 border-slate-600 border-t-slate-400 rounded-full animate-spin mb-4"></div>
                        <div className="text-center text-slate-400 font-semibold italic text-xs uppercase tracking-wider animate-pulse">
                            Detecting grid signals...
                        </div>
                    </div>
                ) : (
                    participants.map((p) => (
                        /* Atomic Key Allocation: Permanent backend UUID string mapped to React key */
                        <UserListItem key={p.id} participant={p} />
                    ))
                )}
            </div>
        </div>
    );
}
