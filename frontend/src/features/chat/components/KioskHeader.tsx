import {
  Sparkles,
  Menu,
  Maximize2,
  Minimize2,
  RotateCcw,
  Volume2,
  VolumeX,
  GraduationCap,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";

interface KioskHeaderProps {
  onResetSession: () => void;
  onToggleShortcuts?: () => void;
  isOnline?: boolean;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
}

/**
 * Modern University UI Kiosk Header
 * Features high-impact official branding, live campus clock,
 * online readiness indicator, and touchscreen-optimized utility controls.
 */
export const KioskHeader = ({
  onResetSession,
  onToggleShortcuts,
  isOnline = true,
  voiceEnabled = true,
  onToggleVoice,
}: KioskHeaderProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Live campus kiosk clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="relative z-30 flex items-center justify-between rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border border-sky-100 shadow-md shadow-blue-900/5 px-3.5 sm:px-6 py-2.5 sm:py-3 mb-2 sm:mb-3 shrink-0 w-full overflow-hidden">
      {/* Brand & Assistant Version - Prominently Highlighted */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Modern Vibrant Gradient Icon Badge */}
        <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-600 to-cyan-400 text-white shadow-md shadow-blue-500/25 ring-2 ring-sky-100">
          <GraduationCap className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-300 text-slate-900 shadow-xs">
            <Sparkles className="h-2.5 w-2.5" />
          </div>
        </div>

        <div className="min-w-0 flex flex-col justify-center">
          {/* Micro Tag */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 leading-none">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600" />
            <span>Northstar University • Virtual Information Kiosk</span>
          </div>

          {/* Main Prominent Title */}
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-sm xs:text-base sm:text-lg lg:text-xl font-black tracking-tight text-slate-900 leading-tight truncate">
              North Star University <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">AI Assistant</span>
            </h1>
            <span className="hidden sm:inline-flex items-center text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 border border-blue-200 shadow-2xs">
              V2 Kiosk
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Live Time, Online Status & Utility Cluster */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Live Kiosk Clock (Desktop & Tablet) */}
        {currentTime && (
          <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            <span>{currentTime}</span>
          </div>
        )}

        {/* Crisp Online Status Badge with Pulse */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 py-1 sm:py-1.5 shadow-2xs ${
            isOnline
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-slate-300 bg-slate-100 text-slate-700"
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isOnline && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isOnline ? "bg-emerald-600" : "bg-slate-400"
              }`}
            />
          </span>
          <span className="text-[11px] sm:text-xs font-bold tracking-wide">
            {isOnline ? "System Ready" : "Offline"}
          </span>
        </div>

        {/* Audio Mute / Unmute Toggle */}
        {onToggleVoice && (
          <button
            type="button"
            onClick={onToggleVoice}
            title={voiceEnabled ? "Mute Spoken Voice" : "Enable Spoken Voice"}
            aria-label={voiceEnabled ? "Mute voice" : "Enable voice"}
            className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border shadow-2xs transition active:scale-95 ${
              voiceEnabled
                ? "border-sky-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-blue-600"
                : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        )}

        {/* Reset / New Session Button */}
        <button
          type="button"
          onClick={onResetSession}
          title="Start Fresh Conversation"
          aria-label="Start Fresh Conversation"
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-sky-200 bg-white text-slate-700 shadow-2xs transition hover:border-sky-300 hover:bg-sky-50 hover:text-blue-600 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Fullscreen Kiosk Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen Kiosk" : "Enter Fullscreen Kiosk"}
          aria-label={isFullscreen ? "Exit Fullscreen Kiosk" : "Enter Fullscreen Kiosk"}
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-sky-200 bg-white text-slate-700 shadow-2xs transition hover:border-sky-300 hover:bg-sky-50 hover:text-blue-600 active:scale-95"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        {/* Menu / FAQ Shortcuts Drawer Button */}
        {onToggleShortcuts && (
          <button
            type="button"
            onClick={onToggleShortcuts}
            title="Browse Topics & Services"
            aria-label="Browse Topics & Services"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-sky-200 bg-white text-slate-700 shadow-2xs transition hover:border-sky-300 hover:bg-sky-50 hover:text-blue-600 active:scale-95"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
};

export default KioskHeader;
