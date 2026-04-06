import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { 
  FiVideo, FiUsers, FiSettings, FiActivity, FiZap, FiRadio, 
  FiMessageSquare, FiX, FiPhoneOff, FiMoreVertical, FiHeart, FiMaximize, FiMinimize,
  FiMic, FiMicOff, FiVideoOff, FiSend
} from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { useAuthSync } from '@/hooks/useAuthSync';
import { endLiveClass, removeLiveClass, updateLiveClassStatus } from '@/store/slices/liveSlice';
import { AuthenticatedPage } from '@/types';
import dynamic from 'next/dynamic';

import CustomLiveStream, { CustomLiveStreamHandle } from '@/components/live/CustomLiveStream';
import type { ChatSectionProps } from '@/components/live/ChatSection';
const ChatSection = dynamic<ChatSectionProps>(() => import('@/components/live/ChatSection'), { ssr: false });

const InstructorStudioPage: AuthenticatedPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token, isInitialized } = useAppSelector((state) => state.auth);
  const { roomID } = router.query;
  const streamRef = useRef<CustomLiveStreamHandle>(null);
  const [mounted, setMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const hh = h > 0 ? `${String(h).padStart(2, '0')}:` : '';
    return `${hh}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isLive && roomID && roomID !== "101" && !isSynced && !isSyncing) {
      setIsSyncing(true);
      console.log("[StudioSync] Detected Live Stream. Syncing Platform Status...");
      dispatch(updateLiveClassStatus({ id: roomID as string, status: 'live' }))
        .unwrap()
        .then(() => {
          setIsSynced(true);
          setIsSyncing(false);
        })
        .catch(() => {
          setIsSyncing(false);
        });
    }
  }, [isLive, roomID, isSynced, isSyncing, dispatch]);

  const handleStreamReady = async () => {
    if (isLive) return;
    setIsLive(true);
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);
  
  useEffect(() => {
    setMounted(true);
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleVideo = () => {
    streamRef.current?.toggleVideo();
  };

  const handleToggleAudio = () => {
    streamRef.current?.toggleAudio();
  };

  useAuthSync();

  const handleEndSession = async () => {
    if (!roomID) return;
    if (confirm('Are you sure you want to end this live session? Students will no longer be able to join.')) {
        try {
          const resultAction = await dispatch(endLiveClass({ id: roomID as string }));
          if (endLiveClass.fulfilled.match(resultAction)) {
            router.push('/instructor/live-syncs');
          }
        } catch (err) {
          console.error("End session error:", err);
        }
    }
  };

  if (!roomID || !user) return null;

  return (
    <DashboardLayout>
      <div className="flex flex-col xl:h-[calc(100vh-120px)] xl:overflow-hidden overflow-y-auto animate-in fade-in duration-700 pb-8 xl:pb-0">
        
        {/* Production Studio Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 mb-8 pt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-black uppercase tracking-tight text-white">Live <span className="text-red-500">Studio</span></h1>
               {isSyncing && <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Syncing Platform...</span>
               </div>}
               {isSynced && <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live on Platform</span>
               </div>}
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Session ID: {roomID}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-black/40 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4 shadow-2xl">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-700'}`} />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{isLive ? 'Live' : 'Studio Off'}</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <span className="text-sm font-black text-white tabular-nums tracking-tighter">{formatTime(elapsedSeconds)}</span>
            </div>
            
            <Button 
              onClick={handleEndSession}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_0_20px_rgba(220,38,38,0.2)]"
            >
              End Session
            </Button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0 px-4">
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <div className="aspect-video xl:flex-1 bg-black rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative group/stream">
                {mounted && router.isReady && user && (
                  <CustomLiveStream
                    ref={streamRef}
                    roomID={String(router.query.roomID || "101")}
                    userID={user.id}
                    userName={`${user.firstName} ${user.lastName}`}
                    role="Host"
                    onToggleAudio={setIsMuted}
                    onToggleVideo={setIsVideoOff}
                    onStreamReady={handleStreamReady}
                  />
                )}
                
                {/* Floating Controls */}
                <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30 px-4 py-3 bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 transition-all duration-300 shadow-2xl ${isFullscreen ? 'opacity-100' : 'opacity-0 group-hover/stream:opacity-100 translate-y-2 group-hover/stream:translate-y-0'}`}>
                   <button onClick={handleToggleVideo} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
                      {isVideoOff ? <FiVideoOff className="h-5 w-5" /> : <FiVideo className="h-5 w-5" />}
                   </button>
                   <button onClick={handleToggleAudio} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
                      {isMuted ? <FiMicOff className="h-5 w-5" /> : <FiMic className="h-5 w-5" />}
                   </button>
                   <div className="w-px h-6 bg-white/10 mx-1" />
                   <button onClick={() => streamRef.current?.toggleFullScreen()} className="w-11 h-11 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center text-black transition-all">
                      {isFullscreen ? <FiMinimize className="h-5 w-5" /> : <FiMaximize className="h-5 w-5" />}
                   </button>
                </div>
            </div>

            {/* Performance Hub */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'CPU Load', value: '14.2%', color: 'text-indigo-400', icon: FiActivity },
                 { label: 'Bitrate', value: '6200 kbps', color: 'text-emerald-400', icon: FiZap },
                 { label: 'Dropped', value: '0.00%', color: 'text-rose-400', icon: FiActivity },
                 { label: 'Encoder', value: 'NVENC H.264', color: 'text-cyan-400', icon: FiSettings },
               ].map((m, i) => (
                 <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-colors">
                    <div className="space-y-1">
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{m.label}</p>
                       <p className="text-sm font-bold text-white tracking-tight">{m.value}</p>
                    </div>
                    <m.icon className={`h-4 w-4 ${m.color}`} />
                 </div>
               ))}
            </div>
          </div>

          <aside className="w-full xl:w-[400px] flex flex-col gap-6 min-h-[500px] xl:min-h-0">
             <div className="flex-1 bg-gray-950 border border-white/5 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
                <ChatSection 
                  roomId={String(roomID || "101")}
                  userId={user.id}
                  userName={`${user.firstName} ${user.lastName}`}
                  isHost={true}
                />
             </div>
             <div className="bg-red-600 rounded-[2rem] p-8 text-white space-y-4 shadow-xl shadow-red-600/10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-80">Stream Health</p>
                <div className="flex items-end justify-between">
                   <h4 className="text-4xl font-black uppercase tracking-tighter">Excellent</h4>
                   <FiHeart className="h-8 w-8 text-white/40" />
                </div>
             </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

InstructorStudioPage.allowedRoles = ['instructor', 'admin'];
export default InstructorStudioPage;
