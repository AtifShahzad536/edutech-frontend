import React from 'react';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiSettings, FiRefreshCw, FiPhoneOff } from 'react-icons/fi';

interface ControlBarProps {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEnd: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({ isMuted, isCameraOff, onToggleMute, onToggleCamera, onEnd }) => {
  const iconBaseClass = "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-xl border shadow-xl relative group active:scale-90 overflow-hidden";
  
  const buttons = [
    {
      id: 'mute',
      icon: isMuted ? <FiMicOff className="h-6 w-6 text-red-500" /> : <FiMic className="h-6 w-6" />,
      action: onToggleMute,
      active: !isMuted,
      label: 'Mute'
    },
    {
      id: 'camera',
      icon: isCameraOff ? <FiVideoOff className="h-6 w-6 text-red-500" /> : <FiVideo className="h-6 w-6" />,
      action: onToggleCamera,
      active: !isCameraOff,
      label: 'Camera'
    },
    {
      id: 'settings',
      icon: <FiSettings className="h-6 w-6" />,
      action: () => {},
      active: true,
      label: 'Settings'
    },
    {
      id: 'switch',
      icon: <FiRefreshCw className="h-5 w-5" />,
      action: () => {},
      active: true,
      label: 'Switch'
    },
    {
      id: 'end',
      icon: <FiPhoneOff className="h-6 w-6 text-white" />,
      action: onEnd,
      isDanger: true,
      label: 'End'
    }
  ];

  return (
    <div className="flex items-center gap-4 py-8 pointer-events-auto">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          onClick={btn.action}
          className={`${iconBaseClass} ${
            btn.isDanger 
              ? 'bg-[#FF3B30] border-transparent shadow-[#FF3B30]/20' 
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          {/* Subtle Glow Overlay */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-white`} />
          
          <div className="relative z-10 text-[#E5E7EB]">
            {btn.icon}
          </div>
          
          {/* Tooltip */}
          <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 scale-90 group-hover:scale-100">
             <span className="text-[10px] font-black text-white uppercase tracking-widest">{btn.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ControlBar;
