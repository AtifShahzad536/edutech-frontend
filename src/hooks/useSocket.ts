import { useEffect, useState, useCallback, useMemo } from 'react';
import Pusher from 'pusher-js';
import axios from 'axios';
import API_URL from '@/config/api';

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1';

export const useSocket = () => {
  const [pusher, setPusher] = useState<Pusher | null>(null);

  useEffect(() => {
    if (!PUSHER_KEY) return;

    const pusherClient = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: `${API_URL}/pusher/auth`,
      forceTLS: true,
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    });

    setPusher(pusherClient);

    return () => {
      pusherClient.disconnect();
    };
  }, []);

  const emit = useCallback(async (event: string, data: any) => {
    // In Pusher, clients cannot emit directly to channels 
    // unless they are client-events on private channels.
    // We route this through our backend trigger endpoint.
    try {
      // Use roomId if provided, else fallback to a default or global channel
      const roomId = data.roomId || data.roomID || (data.to ? null : 'global');
      const channel = roomId ? `presence-room-${roomId}` : (data.to ? `private-user-${data.to}` : 'global');
      
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
    const channel = pusher.subscribe(channelName);
    channel.bind(event, callback);
    return () => {
      channel.unbind(event, callback);
    };
  }, [pusher]);

  return useMemo(() => ({ pusher, emit, on, subscribe: (name: string) => pusher?.subscribe(name) }), [pusher, emit, on]);
};
