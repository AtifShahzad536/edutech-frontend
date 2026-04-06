import { useEffect, useState, useCallback, useMemo } from 'react';
import Pusher from 'pusher-js';
import axios from 'axios';
import API_URL from '@/config/api';

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1';

let pusherInstance: Pusher | null = null;
let connectionCount = 0;

export const useSocket = () => {
  const [pusher, setPusher] = useState<Pusher | null>(pusherInstance);

  useEffect(() => {
    if (!PUSHER_KEY) return;

    if (!pusherInstance) {
      pusherInstance = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        authEndpoint: `${API_URL}/pusher/auth`, // Keep 'pusher/auth' as it was
        forceTLS: true,
        auth: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      });
      console.log('[Pusher] Singleton initialized');
    }

    connectionCount++;
    setPusher(pusherInstance);

    return () => {
      connectionCount--;
      if (connectionCount === 0 && pusherInstance) {
        // Option 1: Keep it alive for the whole session
        // pusherInstance.disconnect();
        // pusherInstance = null;
      }
    };
  }, []);

  const emit = useCallback(async (event: string, data: any) => {
    // In Pusher, clients cannot emit directly to channels 
    // unless they are client-events on private channels.
    // We route this through our backend trigger endpoint.
    try {
      // Priority 1: If 'to' is specified, this is a private signaling event
      // Priority 2: If 'roomId' is specified, it's a shared classroom event
      // Priority 3: Fallback to global
      const targetId = data.to;
      const roomId = data.roomId || data.roomID;

      const channel = targetId
        ? `private-user-${targetId}`
        : (roomId ? `presence-room-${roomId}` : 'global');

      await axios.post(`${API_URL}/live/pusher/trigger`, {
        event,
        data,
        channel
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      console.error('Pusher trigger failed:', error);
    }
  }, []);

  const on = useCallback((channelName: string, event: string, callback: (data: any) => void) => {
    if (!pusher) return;

    // Pusher handles multiple subscribe calls by returning the same object,
    // but we should be careful about unbinding and unsubscribing.
    const channel = pusher.channel(channelName) || pusher.subscribe(channelName);

    channel.bind(event, callback);

    return () => {
      channel.unbind(event, callback);
      // We don't unsubscribe here because other listeners might still need it.
      // Pusher will handle cleaning up unused channels or we can do it on component unmount.
    };
  }, [pusher]);

  return useMemo(() => ({ pusher, emit, on, subscribe: (name: string) => pusher?.subscribe(name) }), [pusher, emit, on]);
};
