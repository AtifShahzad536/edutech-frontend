import React from 'react';
import { FiRadio, FiClock, FiUsers, FiX } from 'react-icons/fi';

interface LiveHeaderProps {
  roomID: string;
  viewerCount: number;
  uptime: string;
  onEnd: () => void;
}

const LiveHeader: React.FC<LiveHeaderProps> = ({ roomID, viewerCount, uptime, onEnd }) => {
  return (
    <div className="w-full bg-[#121826] border border-white/5 px-6 py-4 rounded-2xl shadow-xl flex items-center justify-between mb-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FF3B30] px-3 py-1 rounded-full animate-pulse shadow-[0_0_15px_rgba(255,59,48,0.4)]">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">LIVE</span>
          </div>
          <span className="text-sm font-bold text-white uppercase tracking-tight">LIVE BROADCAST</span>
        </div>
        
        <div className="h-8 w-px bg-white/10 mx-2" />
        
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Room ID</span>
          <span className="text-xs font-bold text-indigo-400">{roomID}</span>
        </div>
      </div>

      <div className="flex items-center gap-8 text-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Live Uptime</span>
            <div className="flex items-center gap-2">
              <FiClock className="h-3 w-3 text-emerald-400" />
              <span className="text-sm font-bold tabular-nums">{uptime}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Audience</span>
            <div className="flex items-center gap-2">
              <FiUsers className="h-3 w-3 text-indigo-400" />
              <span className="text-sm font-bold tabular-nums">{viewerCount} viewers</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onEnd}
          className="bg-[#FF3B30] hover:bg-[#e6352b] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#FF3B30]/20 flex items-center gap-2 group"
        >
          <FiX className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          End Stream
        </button>
      </div>
    </div>
  );
};

export default LiveHeader;
