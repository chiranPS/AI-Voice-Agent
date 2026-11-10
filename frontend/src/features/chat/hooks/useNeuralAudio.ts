import { useCallback, useRef, useState } from "react";

export const useNeuralAudio = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playBase64Audio = useCallback((base64Data: string, onEnded?: () => void) => {
        // Stop any existing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        try {
            const audioUrl = `data:audio/mp3;base64,${base64Data}`;
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onplay = () => setIsPlaying(true);
            audio.onended = () => {
                setIsPlaying(false);
                audioRef.current = null;
                if (onEnded) onEnded();
            };
            audio.onerror = () => {
                setIsPlaying(false);
                audioRef.current = null;
            };

            audio.play().catch((err) => {
                console.warn("Audio autoplay blocked by browser policy:", err);
                setIsPlaying(false);
            });
        } catch (err) {
            console.error("Failed to decode and play neural audio:", err);
            setIsPlaying(false);
        }
    }, []);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    return {
        playBase64Audio,
        stopAudio,
        isPlaying,
        playNeuralAudio: playBase64Audio,
        stopNeuralAudio: stopAudio,
        isAudioPlaying: isPlaying,
    };
};