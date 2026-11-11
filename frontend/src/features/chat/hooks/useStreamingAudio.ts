import { useCallback, useEffect, useRef, useState } from "react";
import type { AvatarType } from "../../avatar/types/avatar.types";

interface UseStreamingAudioProps {
  onFallback?: (text: string, avatar: AvatarType) => void;
}

export const useStreamingAudio = ({ onFallback }: UseStreamingAudioProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const isWorkletLoadedRef = useRef<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const activeStreamIdRef = useRef<string | null>(null);
  const currentStreamIdRef = useRef<string | null>(null);
  const streamStartTimeRef = useRef<number>(0);
  const onEndedCallbackRef = useRef<(() => void) | null>(null);
  const currentTextRef = useRef<string>("");
  const currentAvatarRef = useRef<AvatarType>("female");

  // Determine WebSocket URL dynamically based on current environment
  const getWebSocketUrl = useCallback((): string => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    if (apiBase.startsWith("http")) {
      const parsed = new URL(apiBase);
      const wsProto = parsed.protocol === "https:" ? "wss:" : "ws:";
      return `${wsProto}//${parsed.host}/api/chat/audio-stream`;
    }
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname || "localhost";
    return `${protocol}//${host}:8000/api/chat/audio-stream`;
  }, []);

  // Initialize Web Audio API and load PCM AudioWorklet
  const initAudioEngine = useCallback(async (): Promise<boolean> => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
      }

      const audioCtx = audioContextRef.current;
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      if (!isWorkletLoadedRef.current) {
        await audioCtx.audioWorklet.addModule("/pcm-player-processor.js");
        const workletNode = new AudioWorkletNode(audioCtx, "pcm-player-processor");

        workletNode.port.onmessage = (event) => {
          const type = event.data?.type;
          if (type === "playback_started") {
            setIsPlaying(true);
            const ttfs = Math.round(performance.now() - streamStartTimeRef.current);
            console.log(`[Audio Latency] Time-to-First-Sound (TTFS): ${ttfs}ms`);
          } else if (type === "playback_ended") {
            setIsPlaying(false);
            if (onEndedCallbackRef.current) {
              onEndedCallbackRef.current();
              onEndedCallbackRef.current = null;
            }
          } else if (type === "playback_cleared") {
            setIsPlaying(false);
          }
        };

        workletNode.connect(audioCtx.destination);
        workletNodeRef.current = workletNode;
        isWorkletLoadedRef.current = true;
      }

      return true;
    } catch (err) {
      console.warn("Failed to initialize AudioWorklet audio engine:", err);
      return false;
    }
  }, []);

  // Ensure WebSocket connection is open and ready
  const ensureWebSocket = useCallback((): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        resolve(wsRef.current);
        return;
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
        const checkReady = () => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            resolve(wsRef.current);
          } else if (wsRef.current?.readyState === WebSocket.CLOSED) {
            reject(new Error("WebSocket closed during connection"));
          } else {
            setTimeout(checkReady, 50);
          }
        };
        checkReady();
        return;
      }

      setIsConnecting(true);
      const url = getWebSocketUrl();
      const ws = new WebSocket(url);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnecting(false);
        console.log("[Audio Stream WS] Connected to backend audio WebSocket.");
        resolve(ws);
      };

      ws.onmessage = (event: MessageEvent) => {
        // 1. Binary frames: Raw linear16 PCM audio chunk from backend
        if (event.data instanceof ArrayBuffer) {
          // If the chunk doesn't match active stream, discard it
          if (currentStreamIdRef.current !== activeStreamIdRef.current) {
            return;
          }

          if (workletNodeRef.current) {
            const int16 = new Int16Array(event.data);
            const float32 = new Float32Array(int16.length);
            for (let i = 0; i < int16.length; i++) {
              float32[i] = int16[i] / (int16[i] < 0 ? 32768.0 : 32767.0);
            }
            workletNodeRef.current.port.postMessage(
              { type: "push", samples: float32 },
              [float32.buffer]
            );
          }
          return;
        }

        // 2. Text frames: JSON control messages
        try {
          const data = JSON.parse(event.data);
          if (data.type === "stream_start") {
            currentStreamIdRef.current = data.stream_id;
            console.log(`[Audio Stream WS] Stream started (${data.stream_id}, rate: ${data.sample_rate}Hz)`);
          } else if (data.type === "stream_end") {
            if (data.stream_id === activeStreamIdRef.current) {
              console.log(
                `[Audio Stream WS] Stream end received (${data.chunks_count} chunks, ${data.bytes_count} bytes in ${data.duration_ms}ms)`
              );
              // Inform worklet that stream is done so it triggers playback_ended once buffer empties
              workletNodeRef.current?.port.postMessage({ type: "flush" });
            }
          } else if (data.type === "stream_cancelled") {
            console.log(`[Audio Stream WS] Stream cancelled confirmation (${data.stream_id})`);
            setIsPlaying(false);
          } else if (data.type === "stream_error") {
            console.warn(`[Audio Stream WS] Server error:`, data.error);
            if (onFallback && currentTextRef.current) {
              onFallback(currentTextRef.current, currentAvatarRef.current);
            }
          }
        } catch (e) {
          console.error("[Audio Stream WS] Error parsing message:", e);
        }
      };

      ws.onerror = (e) => {
        setIsConnecting(false);
        console.warn("[Audio Stream WS] Connection error:", e);
        reject(e);
      };

      ws.onclose = () => {
        setIsConnecting(false);
        console.log("[Audio Stream WS] Disconnected.");
        wsRef.current = null;
      };
    });
  }, [getWebSocketUrl, onFallback]);

  // Stop active playback immediately (barge-in support)
  const stopAudio = useCallback(() => {
    const streamId = activeStreamIdRef.current;
    if (streamId && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            action: "cancel",
            stream_id: streamId,
          })
        );
      } catch (err) {
        console.warn("[Audio Stream WS] Error sending cancel:", err);
      }
    }

    // Instantly dump worklet buffer (0ms audio stop)
    if (workletNodeRef.current) {
      workletNodeRef.current.port.postMessage({ type: "clear" });
    }

    activeStreamIdRef.current = null;
    currentStreamIdRef.current = null;
    setIsPlaying(false);
    if (onEndedCallbackRef.current) {
      onEndedCallbackRef.current();
      onEndedCallbackRef.current = null;
    }
  }, []);

  // Initiate real-time progressive TTS audio stream
  const playStreamAudio = useCallback(
    async (
      text: string,
      voiceGender: AvatarType = "female",
      onEnded?: () => void
    ) => {
      const cleanText = text.trim();
      if (!cleanText) return;

      // 1. Cancel previous playback immediately (barge-in)
      stopAudio();

      currentTextRef.current = cleanText;
      currentAvatarRef.current = voiceGender;
      onEndedCallbackRef.current = onEnded || null;

      const streamId = crypto.randomUUID();
      activeStreamIdRef.current = streamId;
      streamStartTimeRef.current = performance.now();

      // 2. Initialize Audio Engine (AudioContext + Worklet)
      const engineReady = await initAudioEngine();
      if (!engineReady) {
        console.warn("AudioWorklet engine unavailable, triggering fallback TTS.");
        if (onFallback) onFallback(cleanText, voiceGender);
        return;
      }

      // 3. Connect/Reuse WebSocket
      try {
        const ws = await ensureWebSocket();
        ws.send(
          JSON.stringify({
            action: "synthesize",
            text: cleanText,
            voice_gender: voiceGender,
            stream_id: streamId,
          })
        );
      } catch (err) {
        console.warn("Failed to connect audio WebSocket, triggering fallback:", err);
        if (onFallback) onFallback(cleanText, voiceGender);
      }
    },
    [stopAudio, initAudioEngine, ensureWebSocket, onFallback]
  );

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stopAudio]);

  return {
    playStreamAudio,
    stopAudio,
    isAudioPlaying: isPlaying,
    isPlaying,
    isConnecting,
    initAudioEngine,
  };
};

