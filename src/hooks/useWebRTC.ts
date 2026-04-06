import { useCallback, useRef, useState, useMemo } from 'react';

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  const localStreamRef = useRef<MediaStream | null>(null);

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
      console.error('Error accessing media devices:', error);
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
    const pc = new RTCPeerConnection(iceServers);
    peerConnections.current.set(targetId, pc);

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketEmit('ice-candidate', { candidate: event.candidate, from: fromId, to: targetId, roomId });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.set(targetId, event.streams[0]);
        return next;
      });
    };

    return pc;
  }, []);

  const closeAllConnections = useCallback(() => {
    console.log('[WebRTC] Closing all connections and stopping tracks...');
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        console.log('[WebRTC] Stopping track:', track.kind);
        track.stop();
      });
      localStreamRef.current = null;
    }
    
    setLocalStream(null);
    setRemoteStreams(new Map());
  }, []); // Stable dependency array

  return useMemo(() => ({
    localStream,
    remoteStreams,
    peerConnections: peerConnections.current,
    getMedia,
    createPeerConnection,
    closeAllConnections,
  }), [localStream, remoteStreams, getMedia, createPeerConnection, closeAllConnections]);
};
