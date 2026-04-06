import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { FiActivity, FiRefreshCw, FiAlertTriangle, FiVideo, FiVideoOff, FiMic, FiMicOff, FiPhoneOff, FiUsers } from 'react-icons/fi';

interface CustomLiveStreamProps {
  roomID: string;
  userID: string;
  userName: string;
  role: 'Host' | 'Audience';
  onToggleAudio?: (isMuted: boolean) => void;
  onToggleVideo?: (isVideoOff: boolean) => void;
  onStreamReady?: () => void;
}

export interface CustomLiveStreamHandle {
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleFullScreen: () => void;
  isMuted: boolean;
  isVideoOff: boolean;
}

const CustomLiveStream = forwardRef<CustomLiveStreamHandle, CustomLiveStreamProps>(({ 
  roomID, userID, userName, role, onToggleAudio, onToggleVideo, onStreamReady 
}, ref) => {
  const { emit, on, off, socket } = useSocket();
  const { localStream, remoteStreams, getMedia, createPeerConnection, closeAllConnections, peerConnections } = useWebRTC();
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleAudio = useCallback(() => {
    console.log('[WebRTC] Toggling Audio. Current Mute State:', isAudioMuted);
    if (localStream) {
      const track = localStream.getAudioTracks()[0];
      if (track) {
        track.enabled = isAudioMuted; // If currently muted, enabled should be true
        setIsAudioMuted(!isAudioMuted);
        onToggleAudio?.(!isAudioMuted);
      }
    }
  }, [localStream, isAudioMuted]);

  const toggleVideo = useCallback(() => {
    console.log('[WebRTC] Toggling Video. Current Off State:', isVideoOff);
    if (localStream) {
      const track = localStream.getVideoTracks()[0];
      if (track) {
        track.enabled = isVideoOff; // If currently off, enabled should be true
        setIsVideoOff(!isVideoOff);
        onToggleVideo?.(!isVideoOff);
      }
    }
  }, [localStream, isVideoOff]);

  const toggleFullScreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  }, []);

  useImperativeHandle(ref, () => ({
    toggleVideo,
    toggleAudio,
    toggleFullScreen,
    isMuted: isAudioMuted,
    isVideoOff: isVideoOff
  }), [toggleVideo, toggleAudio, toggleFullScreen, isAudioMuted, isVideoOff]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const initStream = useCallback(async () => {
    console.log('[WebRTC] Initializing Stream for role:', role);
    setIsInitializing(true);
    setError(null);
    try {
      if (role === 'Host') {
        console.log('[WebRTC] Capturing local media...');
        const stream = await getMedia();
        console.log('[WebRTC] Media captured successfully:', stream.id);
        onStreamReady?.();
        emit('join-stream', { roomId: roomID, userId: userID, userName, role });
      } else {
        console.log('[WebRTC] Joining as audience...');
        emit('join-stream', { roomId: roomID, userId: userID, userName, role });
      }
      setIsInitializing(false);
    } catch (err: any) {
      console.error('[WebRTC] Initialization error:', err);
      setError({ 
        title: 'Signal Error', 
        message: err.message || 'Could not access camera or microphone. Please check permissions.' 
      });
      setIsInitializing(false);
    }
  }, [role, roomID, userID, userName, getMedia, emit]);

  useEffect(() => {
    if (role === 'Audience') {
       initStream();
    }
  }, [role, initStream]);

  useEffect(() => {
    if (!socket) return;

    console.log('[WebRTC] Registering socket listeners. Local Stream Available:', !!localStream);

    on('user-joined', async ({ userId, role: userRole }: { userId: string, role: string }) => {
      console.log('[WebRTC] User joined:', userId, userRole);
      if (role === 'Host' && userRole === 'Audience') {
        if (!localStream) {
          console.warn('[WebRTC] User joined but local stream not ready yet.');
          return;
        }
        console.log('[WebRTC] Host creating offer for:', userId);
        const pc = createPeerConnection(userId, emit, localStream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        emit('offer', { offer, to: userId });
        setViewerCount(prev => prev + 1);
      }
    });

    on('offer', async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
      console.log('[WebRTC] Offer received from:', from);
      if (role === 'Audience') {
        const pc = createPeerConnection(from, emit);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        emit('answer', { answer, to: from });
      }
    });

    on('answer', async ({ answer, from }: { answer: RTCSessionDescriptionInit, from: string }) => {
      console.log('Answer received from:', from);
      const pc = peerConnections.get(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    on('ice-candidate', async ({ candidate, from }: { candidate: RTCIceCandidateInit, from: string }) => {
      const pc = peerConnections.get(from);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    on('user-left', ({ userId }: { userId: string }) => {
      const pc = peerConnections.get(userId);
      if (pc) {
        pc.close();
        peerConnections.delete(userId);
        setViewerCount(prev => Math.max(0, prev - 1));
      }
    });

    return () => {
      off('user-joined');
      off('offer');
      off('answer');
      off('ice-candidate');
      off('user-left');
    };
  }, [socket, localStream, role, createPeerConnection, emit, on, off, peerConnections]);

  useEffect(() => {
    return () => {
      closeAllConnections();
    };
  }, [closeAllConnections]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#070708] flex items-center justify-center overflow-hidden group/live">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-50" />

      {/* Main Content Area */}
      <div className="relative w-full h-full flex items-center justify-center">
        {role === 'Host' ? (
          <div className="relative w-full h-full">
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className={`w-full h-full object-cover transition-all duration-1000 ${localStream ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            />
            {/* Local HUD info */}
            {localStream && (
              <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                       <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                       <span className="text-[9px] font-black text-white uppercase tracking-widest">Host Studio</span>
                    </div>
                    <div className="bg-black/40 backdrop-blur-xl px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                       <FiUsers className="h-3 w-3 text-indigo-400" />
                       <span className="text-[9px] font-bold text-gray-300 tabular-nums">{viewerCount} Live</span>
                    </div>
                 </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
            {remoteStreams.size > 0 ? (
               Array.from(remoteStreams.values()).map((stream, idx) => (
                  <video 
                    key={idx}
                    autoPlay 
                    playsInline 
                    ref={(el) => { if(el) el.srcObject = stream }}
                    className="flex-1 w-full h-full object-cover"
                  />
                ))
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                     <FiActivity className="text-gray-700 h-6 w-6" />
                  </div>
                  <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em]">Waiting for Host</p>
               </div>
            )}
          </div>
        )}

        {/* Cinematic Placeholder / Error Overlay */}
        {(!localStream && role === 'Host') && !isInitializing && !error && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#070708]/40 backdrop-blur-sm transition-all duration-700 p-4">
                <div className="w-full max-w-[260px] bg-[#0f0f11]/95 border border-white/10 rounded-2xl p-4 md:p-8 flex flex-col items-center text-center gap-4 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                   {/* Compact Icons Row */}
                   <div className="flex -space-x-2.5">
                      <div className="w-8 h-8 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center rotate-[-10deg] shadow-md">
                         <FiVideo className="h-3.5 w-3.5 md:h-5 md:w-5 text-white" />
                      </div>
                      <div className="w-8 h-8 md:w-12 md:h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center rotate-[10deg] shadow-md relative z-10">
                         <FiMic className="h-3.5 w-3.5 md:h-5 md:w-5 text-white" />
                      </div>
                   </div>

                   <div className="space-y-1">
                      <h2 className="text-white text-xs md:text-base font-bold tracking-tight">Studio Setup</h2>
                      <p className="text-gray-500 text-[8px] md:text-[10px] leading-relaxed font-medium">
                        Allow camera &amp; microphone to begin.
                      </p>
                   </div>
                   
                   <button 
                     onClick={initStream}
                     className="w-full py-2 md:py-3.5 bg-white hover:bg-gray-100 text-black rounded-xl font-black text-[9px] md:text-[11px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                   >
                      Get Started
                   </button>

                   <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                      <p className="text-[7px] md:text-[8px] text-gray-700 font-black uppercase tracking-widest">Secure</p>
                   </div>
                </div>
            </div>
        )}

        {/* Fullscreen Loading/Error Overlay */}
        {(isInitializing || error) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#070708]/95 backdrop-blur-3xl transition-all duration-500 px-6">
            {isInitializing ? (
               <div className="text-center space-y-8">
                  <div className="relative w-20 h-20 mx-auto">
                     <div className="absolute inset-0 border-2 border-indigo-500/10 rounded-full" />
                     <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <FiActivity className="text-indigo-500 h-6 w-6 animate-pulse" />
                     </div>
                  </div>
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Syncing Pipeline</p>
               </div>
            ) : (
               <div className="max-w-xs w-full text-center space-y-8 animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto border border-red-500/20">
                      <FiAlertTriangle className="text-red-500 h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-white text-sm font-black uppercase tracking-widest">{error?.title}</h3>
                     <p className="text-gray-500 text-[9px] uppercase tracking-widest leading-loose">{error?.message}</p>
                  </div>
                  <button 
                      onClick={() => window.location.reload()}
                      className="w-full py-4 bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                      Retry Connection
                  </button>
               </div>
            )}
          </div>
        )}
      </div>

      {/* Redundant Host Controls removed, handled by parent Studio UI */}
    </div>
  );
});

export default CustomLiveStream;
