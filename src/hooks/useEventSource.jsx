import { useState, useEffect, useRef, useCallback } from 'react';

export function useEventSource(roomId, eventNames = []) {
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [eventData, setEventData] = useState({});

  const eventSourceRef = useRef(null);
  const eventHandlersRef = useRef({});
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // Memoize event names to prevent infinite reconnect loops
  const memoizedEventNames = JSON.stringify(eventNames);

  const connect = useCallback(() => {
    if (!roomId) return;

    // Purge existing connection state before establishing a new one
    if (eventSourceRef.current) {
      if (eventHandlersRef.current) {
        Object.entries(eventHandlersRef.current).forEach(([eventName, handler]) => {
          eventSourceRef.current.removeEventListener(eventName, handler);
        });
      }
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Programmatically query and extract the active Guest JWT tracking token
    const token = localStorage.getItem('token') || '';
    const url = `/api/race/${roomId}/stream?token=${encodeURIComponent(token)}`;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    setIsReconnecting(reconnectAttemptsRef.current > 0);
    setConnectionStatus('CONNECTING');

    eventSource.onopen = () => {
      setConnectionStatus('CONNECTED');
      setIsReconnecting(false);
      reconnectAttemptsRef.current = 0; // Reset backoff on successful connection
    };

    eventSource.onerror = (error) => {
      // Prevent browser from auto-reconnecting infinitely without our controlled backoff
      eventSource.close();
      setConnectionStatus('ERROR');
      scheduleRecovery();
    };

    // Dynamically iterate and bind parameterized event listeners
    const handlers = {};
    const parsedEventNames = JSON.parse(memoizedEventNames);
    
    parsedEventNames.forEach((eventName) => {
      const handler = (event) => {
        let parsedPayload;
        try {
          parsedPayload = JSON.parse(event.data);
        } catch {
          parsedPayload = event.data;
        }
        setEventData((prev) => ({
          ...prev,
          [eventName]: parsedPayload,
        }));
      };
      handlers[eventName] = handler;
      eventSource.addEventListener(eventName, handler);
    });

    eventHandlersRef.current = handlers;
  }, [roomId, memoizedEventNames]);

  const scheduleRecovery = useCallback(() => {
    if (reconnectTimeoutRef.current) return; // Already scheduling a recovery

    setIsReconnecting(true);
    setConnectionStatus('RECONNECTING');

    // Progressive exponential backoff strategy accompanied by randomized jitter
    const baseDelay = 1000;
    const maxDelay = 30000;
    const attempt = reconnectAttemptsRef.current;
    const exponentialBackoff = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    const jitter = Math.random() * 1000;
    const nextRetryDelay = exponentialBackoff + jitter;

    reconnectAttemptsRef.current += 1;

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connect();
    }, nextRetryDelay);
  }, [connect]);

  // Main lifecycle supervisor: Strict Mode Shielding
  useEffect(() => {
    connect();

    // Explicit unmount teardown sequence
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        // Systematically decouple all dynamically mapped event listeners
        if (eventHandlersRef.current) {
          Object.entries(eventHandlersRef.current).forEach(([eventName, handler]) => {
            eventSourceRef.current.removeEventListener(eventName, handler);
          });
        }
        // Systematically invoke eventSource.close()
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      // Completely flush all active local connection status trackers
      setConnectionStatus('DISCONNECTED');
      setIsReconnecting(false);
      setEventData({});
    };
  }, [connect]);

  // Mobile Background Sleep/Wake Life-Cycle Injections
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const es = eventSourceRef.current;
        // Instantly evaluate current connection integrity and purge frozen socket states
        // EventSource.CLOSED = 2
        if (!es || es.readyState === 2 || connectionStatus === 'ERROR' || connectionStatus === 'DISCONNECTED') {
          if (es) {
            es.close();
          }
          // Trigger an automated connection recovery cycle
          scheduleRecovery();
        }
      }
    };

    // Wire up a persistent window system event observer
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connectionStatus, scheduleRecovery]);

  return {
    connectionStatus,
    isReconnecting,
    eventData,
  };
}

export default useEventSource;
