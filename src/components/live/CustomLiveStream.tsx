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
  const { emit, on, pusher } = useSocket();
  const { 
    localStream, remoteStreams, getMedia, createPeerConnection, 
    addIceCandidate, processPendingCandidates, closeAllConnections, peerConnections 
  } = useWebRTC();
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

  const initStream = useCallback(async (isRetry = false) => {
    console.log(`[WebRTC] ${isRetry ? 'Retrying' : 'Initializing'} Stream for role:`, role);
    if (!isRetry) setIsInitializing(true);
    setError(null);
    try {
      if (role === 'Host') {
        const stream = await getMedia();
        console.log('[WebRTC] Media captured successfully:', stream.id);
        onStreamReady?.();
        emit('user-joined', { roomId: roomID, from: userID, userId: userID, userName, role });
      } else {
        console.log('[WebRTC] Audience sending join signal...');
        emit('user-joined', { roomId: roomID, from: userID, userId: userID, userName, role });
      }
      if (!isRetry) setIsInitializing(false);
    } catch (err: any) {
      console.error('[WebRTC] Initialization error:', err);
      if (!isRetry) {
        setError({ 
          title: 'Signal Error', 
          message: err.message || 'Could not access camera or microphone.' 
        });
        setIsInitializing(false);
      }
    }
  }, [role, roomID, userID, userName, getMedia, emit]);

  // Auto-retry for audience if no remote stream arrives
  useEffect(() => {
    if (role === 'Audience' && remoteStreams.size === 0 && !isInitializing) {
      const timer = setTimeout(() => {
        if (remoteStreams.size === 0) {
          console.log('[WebRTC] No stream received after 5s, retrying join signal...');
          initStream(true);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [role, remoteStreams.size, isInitializing, initStream]);

  useEffect(() => {
    if (role === 'Audience') {
       initStream();
    }
  }, [role, initStream]);

  useEffect(() => {
    const roomChannelName = `presence-room-${roomID}`;
    const userChannelName = `private-user-${userID}`;
    
    console.log(`[Socket] Comp mounting. Subscribing to: ${roomChannelName} and ${userChannelName}`);
    
    // Subscribe to both the shared room and private signaling channels
    if (pusher) {
       console.log('[Socket] Pusher state:', pusher.connection.state);
       
       const roomChannel = pusher.subscribe(roomChannelName);
       const userChannel = pusher.subscribe(userChannelName);

       roomChannel.bind('pusher:subscription_succeeded', () => console.log(`[Socket] Successfully subscribed to room: ${roomChannelName}`));
       userChannel.bind('pusher:subscription_succeeded', () => console.log(`[Socket] Successfully subscribed to user channel: ${userChannelName}`));
       
       roomChannel.bind('pusher:subscription_error', (err: any) => console.error(`[Socket] Error subscribing to room:`, err));
       userChannel.bind('pusher:subscription_error', (err: any) => console.error(`[Socket] Error subscribing to user channel:`, err));
    }

    // Discovery on room channel (Everyone listens)
    // Real-time Viewer Count and Discovery (Using Pusher's native presence events)
    if (pusher) {
       const roomChannel = pusher.channel(roomChannelName) || pusher.subscribe(roomChannelName);
       
       // Sync initial count when subscribing
       roomChannel.bind('pusher:subscription_succeeded', (members: any) => {
         console.log(`[Socket] Subscribed to room. Initial members: ${members.count}`);
         setViewerCount(members.count);
       });

       roomChannel.bind('pusher:member_added', (member: any) => {
         const studentId = member.id;
         console.log(`[WebRTC] Member Joined: ${studentId}`);
         setViewerCount(prev => prev + 1);

         if (role === 'Host' && localStream) {
            console.log(`[WebRTC] Host creating offer for: ${studentId}`);
            const pc = createPeerConnection(studentId, emit, roomID, userID, localStream);
            pc.createOffer().then(async (offer) => {
               await pc.setLocalDescription(offer);
               await processPendingCandidates(studentId);
               emit('offer', { offer, from: userID, to: studentId, roomId: roomID });
            });
         }
       });

       roomChannel.bind('pusher:member_removed', (member: any) => {
         const studentId = member.id;
         console.log(`[WebRTC] Member Removed: ${studentId}`);
         setViewerCount(prev => Math.max(0, prev - 1));

         if (role === 'Host') {
           const pc = peerConnections.get(studentId);
           if (pc) {
             pc.close();
             peerConnections.delete(studentId);
           }
         }
       });
    }

    // Keep custom user-joined as a fallback for re-syncs
    const hostOnUserJoined = on(roomChannelName, 'user-joined', async (data: any) => {
      const { userId, from, role: userRole } = data;
      const effectiveFrom = from || userId;
      
      if (role === 'Host' && userRole === 'Audience') {
        console.log(`[WebRTC] Fallback user-joined received: ${effectiveFrom}`);
        if (!localStream) return;
        const pc = createPeerConnection(effectiveFrom, emit, roomID, userID, localStream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await processPendingCandidates(effectiveFrom);
        emit('offer', { offer, from: userID, to: effectiveFrom, roomId: roomID });
      }
    });

    // Handle signals on private user channel (Only target listens)
    const audienceOnOffer = on(userChannelName, 'offer', async (data: any) => {
      const { offer, to } = data;
      const from = data.from || data.userId || data.senderId;
      
      if (role === 'Audience' && to === userID) {
        console.log('[WebRTC] Offer received from:', from);
        if (!from) return;

        const pc = createPeerConnection(from, emit, roomID, userID);
        
        if (pc.remoteDescription && pc.connectionState === 'connected') {
          console.log('[WebRTC] Already connected to host, ignoring redundant offer.');
          return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await processPendingCandidates(from);
        emit('answer', { answer, from: userID, to: from, roomId: roomID });
      }
    });

    const hostOnAnswer = on(userChannelName, 'answer', async (data: any) => {
      const { answer, to } = data;
      const from = data.from || data.userId || data.senderId;

      if (role === 'Host' && to === userID) {
        console.log('[WebRTC] Answer received from:', from);
        if (!from) return;
        const pc = peerConnections.get(from);
        if (pc) {
          if (pc.connectionState === 'connected') return;
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          await processPendingCandidates(from);
        }
      }
    });

    const onIceCandidate = on(userChannelName, 'ice-candidate', async (data: any) => {
      const { candidate, to } = data;
      const from = data.from || data.userId || data.senderId;

      if (to === userID) {
        if (!from) return;
        await addIceCandidate(from, candidate);
      }
    });

    // Final room cleanup for audience
    const onUserLeftFallback = on(roomChannelName, 'user-left', ({ userId }: { userId: string }) => {
      if (role === 'Host') { // Audience doesn't need to track user-left
        const pc = peerConnections.get(userId);
        if (pc) {
          pc.close();
          peerConnections.delete(userId);
          setViewerCount(prev => Math.max(0, prev - 1));
        }
      }
    });

    return () => {
      if (hostOnUserJoined) hostOnUserJoined();
      if (audienceOnOffer) audienceOnOffer();
      if (hostOnAnswer) hostOnAnswer();
      if (onIceCandidate) onIceCandidate();
      if (onUserLeftFallback) onUserLeftFallback();
    };
  }, [pusher, localStream, role, createPeerConnection, emit, on, roomID, userID]); // removed peerConnections map from deps to prevent re-runs on handshake

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
              style={{ 
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                perspective: 1000,
                transform: 'translateZ(0)'
              }}
            />

          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
            {remoteStreams.size > 0 ? (
               Array.from(remoteStreams.values()).map((stream, idx) => (
                  <video 
                    key={idx}
                    autoPlay 
                    playsInline 
                    muted={isAudioMuted}
                    ref={(el) => { if(el) el.srcObject = stream }}
                    className="flex-1 w-full h-full object-cover"
                    style={{ 
                      willChange: 'transform',
                      backfaceVisibility: 'hidden',
                      perspective: 1000,
                      transform: 'translateZ(0)'
                    }}
                  />
                ))
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                     <FiActivity className="text-gray-700 h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em]">Waiting for Host</p>
                    <button 
                      onClick={() => initStream(true)}
                      className="text-indigo-500 text-[8px] font-black uppercase tracking-widest hover:underline flex items-center gap-2 mx-auto"
                    >
                      <FiRefreshCw className="h-2.5 w-2.5" />
                      Retry Connection
                    </button>
                  </div>
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
                     onClick={() => initStream(false)}
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

      {/* Global User Count & Control HUD */}
      <div className="absolute top-6 left-6 z-40 flex items-center gap-3">
        <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2.5 shadow-2xl">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <span className="text-[10px] font-black text-white tracking-widest uppercase">Live</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-2">
              <FiUsers className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[11px] font-black text-white tabular-nums tracking-widest uppercase">{viewerCount}</span>
            </div>
        </div>
        
        {role === 'Audience' && (
          <button 
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all shadow-2xl ${isAudioMuted ? 'bg-red-500/20 text-red-500 border-red-500/20' : 'bg-black/60 text-white border-white/10 backdrop-blur-xl'}`}
          >
            {isAudioMuted ? <FiMicOff className="h-5 w-5" /> : <FiMic className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Redundant Host Controls removed, handled by parent Studio UI */}
    </div>
  );
});

export default React.memo(CustomLiveStream);
