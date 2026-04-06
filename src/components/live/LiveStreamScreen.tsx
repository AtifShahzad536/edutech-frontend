import React, { useState, useEffect } from 'react';
import LiveHeader from './LiveHeader';
import VideoSection from './VideoSection';
import ChatSection from './ChatSection';
import ControlBar from './ControlBar';
import { useAppSelector } from '@/hooks/useRedux';

const LiveStreamScreen: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [viewerCount, setViewerCount] = useState(124);
  const [uptime, setUptime] = useState('00:42:15');
  const { user } = useAppSelector((state) => state.auth);

  const roomId = "TEST-ROOM";
  const userId = user?.id || "anonymous-123";
  const userName = user ? `${user.firstName} ${user.lastName}` : "Guest User";
  const isHost = user?.role === 'instructor';

  // UI Only: Toggle handlers
  const handleToggleMute = () => setIsMuted(prev => !prev);
  const handleToggleCamera = () => setIsCameraOff(prev => !prev);
  const handleEndStream = () => alert('Ending Stream...');

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#E5E7EB] p-4 md:p-8 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[100px] -z-10" />

      {/* Header Section */}
      <LiveHeader 
        roomID="TEST-ROOM"
        viewerCount={viewerCount}
        uptime={uptime}
        onEnd={handleEndStream}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col xl:flex-row gap-8 min-h-0 overflow-hidden">
        {/* Left: Video Section (70%) */}
        <div className="flex-[0.7] flex flex-col gap-6 h-full min-h-[400px]">
          <VideoSection viewerCount={viewerCount} />
          
          {/* Controls Bar (Desktop - Below Video) */}
          <div className="hidden xl:flex justify-center mt-auto">
            <ControlBar 
              isMuted={isMuted}
              isCameraOff={isCameraOff}
              onToggleMute={handleToggleMute}
              onToggleCamera={handleToggleCamera}
              onEnd={handleEndStream}
            />
          </div>
        </div>

        {/* Right: Chat Section (30%) */}
        <div className="flex-[0.3] flex flex-col min-h-[400px] xl:min-h-0 h-full">
          <ChatSection 
            roomId={roomId}
            userId={userId}
            userName={userName}
            isHost={isHost}
          />
        </div>
      </div>

      {/* Bottom Controls (Mobile/Tablet - Fixed for easier access) */}
      <div className="xl:hidden flex justify-center mt-8 sticky bottom-4 z-50 pointer-events-none">
        <ControlBar 
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onToggleMute={handleToggleMute}
          onToggleCamera={handleToggleCamera}
          onEnd={handleEndStream}
        />
      </div>
    </div>
  );
};

export default LiveStreamScreen;
