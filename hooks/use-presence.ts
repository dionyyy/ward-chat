"use client";

import { useEffect, useRef, useCallback } from "react";
import { updatePresence, heartbeat } from "@/server/actions/presence";

interface UsePresenceOptions {
  enabled?: boolean;
  idleTimeout?: number; // ms before going idle (default: 5 min)
  heartbeatInterval?: number; // ms between heartbeats (default: 2 min)
}

/**
 * Hook that manages user presence:
 * - Sets status to ONLINE on mount
 * - Detects idle (no mouse/keyboard) and sets IDLE
 * - Sends periodic heartbeats to keep presence alive in Redis
 * - Sets OFFLINE on unmount/page close
 */
export function usePresence({
  enabled = true,
  idleTimeout = 5 * 60 * 1000, // 5 minutes
  heartbeatInterval = 2 * 60 * 1000, // 2 minutes
}: UsePresenceOptions = {}) {
  const isIdleRef = useRef(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStatusRef = useRef<string>("ONLINE");

  const setStatus = useCallback(
    async (status: string) => {
      if (!enabled) return;
      if (currentStatusRef.current === status) return;

      currentStatusRef.current = status;
      try {
        await updatePresence(status);
      } catch {
        // Silently fail - presence is non-critical
      }
    },
    [enabled]
  );

  const resetIdleTimer = useCallback(() => {
    if (!enabled) return;

    // If we were idle, go back online
    if (isIdleRef.current) {
      isIdleRef.current = false;
      setStatus("ONLINE");
    }

    // Reset the timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      isIdleRef.current = true;
      setStatus("IDLE");
    }, idleTimeout);
  }, [enabled, idleTimeout, setStatus]);

  useEffect(() => {
    if (!enabled) return;

    // Go online on mount
    setStatus("ONLINE");

    // Start idle detection
    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Start initial idle timer
    resetIdleTimer();

    // Start heartbeat
    heartbeatTimerRef.current = setInterval(async () => {
      try {
        await heartbeat();
      } catch {
        // Silently fail
      }
    }, heartbeatInterval);

    // Handle page visibility changes
    function handleVisibilityChange() {
      if (document.hidden) {
        // Page is hidden - go idle after a shorter timeout
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
          isIdleRef.current = true;
          setStatus("IDLE");
        }, 30000); // 30 seconds when tab is hidden
      } else {
        // Page visible again - reset
        resetIdleTimer();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Handle page unload - set offline
    function handleBeforeUnload() {
      // Use sendBeacon for reliable delivery on page close
      navigator.sendBeacon?.(
        "/api/presence",
        JSON.stringify({ status: "OFFLINE" })
      );
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Cleanup
      events.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);

      // Go offline on unmount
      setStatus("OFFLINE");
    };
  }, [enabled, resetIdleTimer, heartbeatInterval, setStatus]);

  return { setStatus };
}
