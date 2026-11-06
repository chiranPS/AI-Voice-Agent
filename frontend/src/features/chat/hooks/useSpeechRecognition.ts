import { useCallback, useRef, useState } from "react";

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
  };
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: SpeechRecognitionResult;
    length: number;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onspeechstart?: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

/**
 * Speech Recognition Hook (STT)
 * Uses browser Web Speech API for low-latency voice capture.
 * Supports barge-in callback to cancel ongoing TTS audio.
 */
export const useSpeechRecognition = (
  onTranscript: (transcript: string) => void,
  onBargeIn?: () => void
) => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onBargeInRef = useRef(onBargeIn);

  onTranscriptRef.current = onTranscript;
  onBargeInRef.current = onBargeIn;

  const startListening = useCallback(() => {
    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognitionAPI =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (recognitionRef.current) {
      return;
    }

    setError(null);
    setInterimTranscript("");

    // Halt any playing avatar speech immediately when mic opens
    if (onBargeInRef.current) {
      onBargeInRef.current();
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onspeechstart = () => {
      // User started talking, trigger barge-in
      if (onBargeInRef.current) {
        onBargeInRef.current();
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      setInterimTranscript(interim);

      if (finalTranscript.trim()) {
        onTranscriptRef.current(finalTranscript.trim());
        setInterimTranscript("");
      }
    };

    recognition.onerror = (event) => {
      const errorMap: Record<string, string> = {
        "not-allowed": "Microphone permission was denied. Please allow microphone access.",
        "no-speech": "No speech detected. Please tap the mic and speak again.",
        "audio-capture": "No microphone hardware detected.",
        network: "Network connection error during voice recognition.",
      };

      setError(errorMap[event.error] || "Speech recognition error. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsListening(true);

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setError("Unable to access microphone. Please try again.");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    interimTranscript,
    error,
    startListening,
    stopListening,
  };
};

export default useSpeechRecognition;
