import React from 'react';
import { FiVideoOff, FiUsers } from 'react-icons/fi';

interface VideoSectionProps {
  viewerCount: number;
}

const VideoSection: React.FC<VideoSectionProps> = ({ viewerCount }) => {
  return (
    <div className="relative group aspect-video bg-[#121826] rounded-[24px] overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
      {/* Glow Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A]/80 via-transparent to-transparent opacity-60 pointer-events-none" />
      
      {/* Placeholder State */}
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-indigo-500/10 rounded-full animate-ping absolute" />
          <div className="w-20 h-20 bg-indigo-500/5 rounded-full flex items-center justify-center border border-indigo-500/20 relative">
            <FiVideoOff className="h-8 w-8 text-indigo-500/40" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[#E5E7EB] font-black uppercase tracking-[0.2em] text-[10px] opacity-60">Signal Lost</p>
          <p className="text-gray-600 font-bold text-[8px] uppercase tracking-widest mt-1">Waiting for stream link...</p>
        </div>
      </div>

      {/* Top Left: LIVE Badge */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-2 bg-[#FF3B30]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE</span>
        </div>
      </div>

      {/* Top Right: Viewer Count */}
      <div className="absolute top-6 right-6 z-10">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
          <FiUsers className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest tabular-nums">{viewerCount}</span>
        </div>
      </div>

      {/* Interactive Overlay on Hover */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default VideoSection;
