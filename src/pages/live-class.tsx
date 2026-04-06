import React, { useState, useEffect, useRef } from 'react';
import {
  FiUsers, FiPhoneOff, FiSend,
  FiMessageSquare, FiRadio, FiArrowLeft
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/hooks/useRedux';
import { useAuthSync } from '@/hooks/useAuthSync';
import DashboardLayout from '@/components/layout/DashboardLayout';
import dynamic from 'next/dynamic';
import { io, Socket } from 'socket.io-client';
import { AuthenticatedPage } from '@/types';

const CustomLiveStream = dynamic(() => import('@/components/live/CustomLiveStream'), { ssr: false });
import type { ChatSectionProps } from '@/components/live/ChatSection';
const ChatSection = dynamic<ChatSectionProps>(() => import('@/components/live/ChatSection'), { ssr: false });

interface ChatMsg {
  id: number;
  name: string;
  text: string;
  time: string;
  isHost?: boolean;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

const LiveClassPage: AuthenticatedPage = () => {
  const router = useRouter();
  const { user, token, isInitialized } = useAppSelector((state) => state.auth);
  const { roomID } = router.query;
  useAuthSync();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00');

  // Uptime counter (local display)
  useEffect(() => {
    let secs = 0;
    const id = setInterval(() => {
      secs++;
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      setElapsedTime(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Fullscreen tracking
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!roomID || !user) return null;

  return (
    <DashboardLayout>
      <div className="flex flex-col xl:h-[calc(100vh-120px)] xl:overflow-hidden overflow-y-auto pb-8 xl:pb-0 gap-4 animate-in fade-in duration-500">

        {/* Compact Header */}
        <header className="flex items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <FiArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">🔴 Live</span>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest hidden sm:inline">Web Development 101</span>
              </div>
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight truncate">Web Architecture Session</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 px-3 md:px-5 py-2 rounded-xl">
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Watching</span>
                <span className="text-xs font-bold text-white tabular-nums flex items-center gap-1">
                  <FiUsers className="h-2.5 w-2.5 text-gray-500" /> 124
                </span>
              </div>
              <div className="w-px h-5 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Time</span>
                <span className="text-xs font-bold text-emerald-400 tabular-nums flex items-center gap-1">
                  <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                  {elapsedTime}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.back()}
              className="bg-red-600 hover:bg-red-500 text-white px-3 md:px-5 py-2 rounded-xl font-black uppercase tracking-widest text-[8px] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20 flex items-center gap-2"
            >
              <FiPhoneOff className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </header>

        {/* Main Content — Video + Chat */}
        <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">

          {/* Video Section */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="aspect-video xl:flex-1 bg-black rounded-xl md:rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative">
              {router.isReady && user && (
                <CustomLiveStream
                  roomID={String(roomID || '101')}
                  userID={user.id}
                  userName={`${user.firstName} ${user.lastName}`}
                  role="Audience"
                />
              )}
              {/* Live badge overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
                <div className="flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-lg shadow-lg">
                  <FiRadio className="h-2.5 w-2.5 text-white animate-pulse" />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Live</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                  <FiUsers className="h-2.5 w-2.5 text-gray-400" />
                  <span className="text-[8px] font-black text-gray-300">124</span>
                </div>
              </div>
            </div>

            {/* Mobile session info */}
            <div className="xl:hidden flex items-center gap-3 px-1">
              <div className="flex-1">
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Web Development 101 • Dr. Smith</p>
                <p className="text-sm font-bold text-white">Web Architecture — React Hooks Deep Dive</p>
              </div>
            </div>
          </div>

          {/* Live Chat Sidebar / Card */}
          <div className="xl:w-[360px] flex flex-col xl:min-h-0 min-h-[420px]">
            <ChatSection 
              roomId={String(roomID || '101')}
              userId={user.id}
              userName={`${user.firstName} ${user.lastName}`}
              isHost={false}
            />
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

LiveClassPage.allowedRoles = ['student', 'instructor', 'admin'];
export default LiveClassPage;
