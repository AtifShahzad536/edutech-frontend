import { useCallback, useRef, useState, useMemo } from 'react';

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  const iceServers: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun.services.mozilla.com' },
      { urls: 'stun:global.stun.twilio.com:3478' },
    ],
    iceCandidatePoolSize: 10,
  };

  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  const getMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('[WebRTC] Error accessing media devices:', error);
      throw error;
    }
  }, []);

  const createPeerConnection = useCallback((
    targetId: string, 
    socketEmit: (event: string, data: any) => void,
    roomId: string,
    fromId: string,
    stream?: MediaStream
  ) => {
    // Check if we already have a healthy connection for this target
    const existingPc = peerConnections.current.get(targetId);
    if (existingPc) {
      const state = existingPc.connectionState;
      if (state === 'new' || state === 'connecting' || state === 'connected') {
        console.log(`[WebRTC] Reusing existing ${state} connection for:`, targetId);
        return existingPc;
      }
      console.log(`[WebRTC] Replacing old ${state} connection for:`, targetId);
      existingPc.close();
    }

    console.log('[WebRTC] Creating new PeerConnection for:', targetId);
    const pc = new RTCPeerConnection(iceServers);
    peerConnections.current.set(targetId, pc);

    // Initialize pending candidates queue
    pendingCandidates.current.set(targetId, []);

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketEmit('ice-candidate', { candidate: event.candidate, from: fromId, to: targetId, roomId });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state with ${targetId}:`, pc.connectionState);
      if (pc.connectionState === 'failed') {
        console.warn(`[WebRTC] Connection failed with ${targetId}. Consider restarting.`);
      }
    };

    pc.ontrack = (event) => {
      console.log(`[WebRTC] Received remote track from ${targetId}:`, event.streams[0].id);
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.set(targetId, event.streams[0]);
        return next;
      });
    };

    return pc;
  }, []);

  const addIceCandidate = useCallback(async (targetId: string, candidate: RTCIceCandidateInit) => {
    const pc = peerConnections.current.get(targetId);
    if (!pc) return;

    try {
      if (pc.remoteDescription && pc.remoteDescription.type) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        // Queue candidates until remote description is set
        const queue = pendingCandidates.current.get(targetId) || [];
        queue.push(candidate);
        pendingCandidates.current.set(targetId, queue);
      }
    } catch (e) {
      console.error(`[WebRTC] Error adding ICE candidate for ${targetId}:`, e);
    }
  }, []);

  const processPendingCandidates = useCallback(async (targetId: string) => {
    const pc = peerConnections.current.get(targetId);
    if (!pc || !pc.remoteDescription) return;

    const queue = pendingCandidates.current.get(targetId) || [];
    console.log(`[WebRTC] Processing ${queue.length} pending candidates for:`, targetId);
    
    for (const candidate of queue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error(`[WebRTC] Error processing pending candidate for ${targetId}:`, e);
      }
    }
    pendingCandidates.current.set(targetId, []);
  }, []);

  const closeAllConnections = useCallback(() => {
    console.log('[WebRTC] Closing all connections and stopping tracks...');
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();
    pendingCandidates.current.clear();
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    
    setLocalStream(null);
    setRemoteStreams(new Map());
  }, []);

  return useMemo(() => ({
    localStream,
    remoteStreams,
    peerConnections: peerConnections.current,
    getMedia,
    createPeerConnection,
    addIceCandidate,
    processPendingCandidates,
    closeAllConnections,
  }), [localStream, remoteStreams, getMedia, createPeerConnection, addIceCandidate, processPendingCandidates, closeAllConnections]);
};
