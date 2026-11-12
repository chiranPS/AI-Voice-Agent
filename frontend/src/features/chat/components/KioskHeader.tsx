import { useState, useEffect, useRef } from "react";
import {
  Globe,
  Check,
  ChevronDown,
  Accessibility,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Hand,
  User,
} from "lucide-react";
import type { AvatarType } from "../../avatar/types/avatar.types";
import type { AvatarAgentState } from "../../avatar/components/AvatarStage";

interface KioskHeaderProps {
  onResetSession?: () => void;
  onToggleShortcuts?: () => void;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
  selectedAvatar?: AvatarType;
  onAvatarChange?: (avatar: AvatarType) => void;
  avatarState?: AvatarAgentState;
  isOnline?: boolean;
  onTriggerWave?: () => void;
  isWaving?: boolean;
  isLoading?: boolean;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "EN" },
  { code: "si", name: "Sinhala", nativeName: "සිං" },
  { code: "ta", name: "Tamil", nativeName: "தமி" },
];

/**
 * Integrated Professional APIIT University Kiosk Header
 * Naturally part of the single unified kiosk surface (no separate boxed card).
 */
export const KioskHeader = ({
  onResetSession,
  onToggleShortcuts,
  voiceEnabled = true,
  onToggleVoice,
  selectedAvatar = "female",
  onAvatarChange,
  avatarState = "idle",
  isOnline = true,
  onTriggerWave,
  isWaving = false,
  isLoading = false,
}: KioskHeaderProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isAccessMenuOpen, setIsAccessMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(
    SUPPORTED_LANGUAGES[0]
  );
  const [isLargeText, setIsLargeText] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [languageNotice, setLanguageNotice] = useState<string | null>(null);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const accessMenuRef = useRef<HTMLDivElement>(null);

  // Fullscreen sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle outside clicks to close dropdown menus
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setIsLangMenuOpen(false);
      }
      if (accessMenuRef.current && !accessMenuRef.current.contains(target)) {
        setIsAccessMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLangMenuOpen(false);
        setIsAccessMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSelectLanguage = (lang: LanguageOption) => {
    setSelectedLanguage(lang);
    setIsLangMenuOpen(false);
    if (lang.code !== "en") {
      setLanguageNotice(
        `${lang.name} translation mode active. Responses will be adapted.`
      );
      setTimeout(() => setLanguageNotice(null), 4000);
    }
  };

  const toggleLargeText = () => {
    const newState = !isLargeText;
    setIsLargeText(newState);
    if (newState) {
      document.documentElement.classList.add("text-lg");
    } else {
      document.documentElement.classList.remove("text-lg");
    }
  };

  const toggleHighContrast = () => {
    const newState = !isHighContrast;
    setIsHighContrast(newState);
    if (newState) {
      document.documentElement.classList.add("contrast-125");
    } else {
      document.documentElement.classList.remove("contrast-125");
    }
  };

  // Human-readable status mapping
  let statusText = "Online & Ready";
  let dotColor = "bg-[#34EBAE]";
  let ping = true;

  if (!isOnline) {
    statusText = "Offline";
    dotColor = "bg-slate-400";
    ping = false;
  } else if (avatarState === "listening") {
    statusText = "Listening...";
    dotColor = "bg-[#34EBAE]";
  } else if (avatarState === "thinking") {
    statusText = "Processing inquiry...";
    dotColor = "bg-[#ED1C24]";
  } else if (avatarState === "speaking") {
    statusText = "Responding...";
    dotColor = "bg-[#34EBAE]";
  } else if (avatarState === "waving") {
    statusText = "Welcoming you!";
    dotColor = "bg-[#ED1C24]";
  }

  return (
    <header className="relative z-30 w-full shrink-0 bg-white px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 border-b border-[#E5E7EB]/60">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* ── Left: Official APIIT Logo & Institutional Brand Identity ── */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <img
            src="/apiit-logo.png"
            alt="APIIT Sri Lanka - Inspire love for learning"
            className="h-7 xs:h-8 sm:h-9 md:h-10 w-auto object-contain shrink-0"
          />

          {/* Thin Brand Divider */}
          <div className="hidden sm:block h-7 w-px bg-[#E5E7EB]" aria-hidden="true" />

          {/* Assistant Title & Tagline */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-[#202124] tracking-tight leading-none truncate">
                AI Campus Assistant
              </h1>
              {/* Subtle Live Availability Pill */}
              <div className="hidden xs:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F5F6F7] border border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280]">
                <span className="relative flex h-2 w-2">
                  {ping && (
                    <span
                      className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotColor} opacity-75`}
                    />
                  )}
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`}
                  />
                </span>
                <span className="text-[10px] tracking-wide font-medium">{statusText}</span>
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-[#6B7280] mt-1 leading-none truncate">
              Admissions & Student Information Kiosk
            </p>
          </div>
        </div>

        {/* ── Right: Integrated Action Controls ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Persona Switcher (Sofia / Alex) */}
          {onAvatarChange && (
            <div className="hidden md:inline-flex items-center rounded-full bg-[#F5F6F7] p-1 border border-[#E5E7EB]">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onAvatarChange("female")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  selectedAvatar === "female"
                    ? "bg-[#ED1C24] text-white shadow-xs font-bold"
                    : "text-[#6B7280] hover:text-[#202124]"
                }`}
                title="Switch to Sofia (Female Voice)"
              >
                <User className="h-3 w-3" />
                <span>Sofia</span>
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onAvatarChange("male")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  selectedAvatar === "male"
                    ? "bg-[#ED1C24] text-white shadow-xs font-bold"
                    : "text-[#6B7280] hover:text-[#202124]"
                }`}
                title="Switch to Alex (Male Voice)"
              >
                <User className="h-3 w-3" />
                <span>Alex</span>
              </button>
            </div>
          )}

          {/* Say Hello Button (Wave greeting trigger) */}
          {onTriggerWave && (
            <button
              type="button"
              disabled={isLoading || isWaving}
              onClick={onTriggerWave}
              title="Greet assistant with interactive wave"
              aria-label="Greet assistant"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-[#FEECEE] text-[#ED1C24] border border-[#ED1C24]/30 hover:border-[#ED1C24] px-3 py-1.5 text-xs font-semibold transition active:scale-95 shadow-2xs"
            >
              <Hand className="h-3.5 w-3.5 text-[#ED1C24]" />
              <span>Say Hello</span>
            </button>
          )}

          {/* Explore Topics Button */}
          {onToggleShortcuts && (
            <button
              type="button"
              onClick={onToggleShortcuts}
              title="Browse University Topics & FAQs"
              aria-label="Browse University Topics & FAQs"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F6F7] hover:bg-[#EBECEF] text-[#202124] px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition active:scale-95 border border-[#E5E7EB]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#ED1C24]" />
              <span className="hidden sm:inline">Topics</span>
            </button>
          )}

          {/* Voice Response Mute Toggle */}
          {onToggleVoice && (
            <button
              type="button"
              onClick={onToggleVoice}
              title={voiceEnabled ? "Voice is ON (click to mute)" : "Voice is MUTED (click to enable)"}
              aria-label={voiceEnabled ? "Mute Voice" : "Enable Voice"}
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition active:scale-95 border ${
                voiceEnabled
                  ? "bg-[#F5F6F7] text-[#202124] border-[#E5E7EB] hover:border-slate-300"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {voiceEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsLangMenuOpen(!isLangMenuOpen);
                setIsAccessMenuOpen(false);
              }}
              aria-expanded={isLangMenuOpen}
              aria-label="Select language"
              className="flex items-center gap-1 rounded-full bg-[#F5F6F7] hover:bg-[#EBECEF] px-2.5 py-1.5 text-xs font-semibold text-[#202124] border border-[#E5E7EB] transition active:scale-95"
            >
              <Globe className="h-3.5 w-3.5 text-[#6B7280]" />
              <span>{selectedLanguage.nativeName}</span>
              <ChevronDown
                className={`h-3 w-3 text-[#6B7280] transition-transform duration-200 ${
                  isLangMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 top-11 z-50 w-44 rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB]/70 mb-1">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage.code === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang)}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-[#FEECEE] text-[#ED1C24] font-bold"
                          : "text-[#202124] hover:bg-[#F5F6F7]"
                      }`}
                    >
                      <span>{lang.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#ED1C24]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Accessibility Settings */}
          <div className="relative" ref={accessMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsAccessMenuOpen(!isAccessMenuOpen);
                setIsLangMenuOpen(false);
              }}
              aria-expanded={isAccessMenuOpen}
              aria-label="Accessibility options"
              title="Accessibility Settings"
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition active:scale-95 border ${
                isLargeText || isHighContrast
                  ? "bg-[#FEECEE] text-[#ED1C24] border-[#ED1C24]/30"
                  : "bg-[#F5F6F7] text-[#202124] border-[#E5E7EB] hover:border-slate-300"
              }`}
            >
              <Accessibility className="h-4 w-4" />
            </button>

            {isAccessMenuOpen && (
              <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-[#E5E7EB] bg-white p-3.5 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#202124]">
                    Accessibility
                  </span>
                  <span className="text-[10px] text-[#6B7280]">Display Mode</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-[#202124]">
                        Enlarge Text
                      </span>
                      <span className="block text-[10px] text-[#6B7280]">
                        High visibility typography
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={toggleLargeText}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        isLargeText ? "bg-[#ED1C24]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                          isLargeText ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-[#202124]">
                        High Contrast
                      </span>
                      <span className="block text-[10px] text-[#6B7280]">
                        Enhanced contrast mode
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={toggleHighContrast}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        isHighContrast ? "bg-[#ED1C24]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                          isHighContrast ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reset / Clear Session Button */}
          {onResetSession && (
            <button
              type="button"
              onClick={onResetSession}
              title="Reset Conversation Session"
              aria-label="Reset Conversation Session"
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#F5F6F7] hover:bg-[#EBECEF] text-[#6B7280] hover:text-[#ED1C24] border border-[#E5E7EB] transition active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}

          {/* Fullscreen Toggle (for touchscreen kiosk hardware) */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Kiosk Mode"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Kiosk Mode"}
            className="hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#F5F6F7] hover:bg-[#EBECEF] text-[#6B7280] hover:text-[#202124] border border-[#E5E7EB] transition active:scale-95"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Temporary toast banner for accessibility / language notifications */}
      {languageNotice && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-1.5 rounded-full bg-[#202124] text-white text-xs font-medium shadow-md animate-in fade-in slide-in-from-top-1 z-40">
          {languageNotice}
        </div>
      )}
    </header>
  );
};

export default KioskHeader;
