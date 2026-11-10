import { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  Globe,
  Check,
  ChevronDown,
  Accessibility,
  Maximize2,
  Minimize2,
  Type,
  Eye,
} from "lucide-react";

interface KioskHeaderProps {
  onResetSession?: () => void;
  onToggleShortcuts?: () => void;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
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
 * Northstar University Kiosk Header
 * Matching the portrait reference design:
 * [🎓] NORTHSTAR UNIVERSITY             [ 🌐 EN ▾ | ♿ | ⛶ ]
 *      VIRTUAL INFORMATION KIOSK
 */
export const KioskHeader = ({ }: KioskHeaderProps) => {
  // Screen and Popover States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isAccessMenuOpen, setIsAccessMenuOpen] = useState(false);

  // Language & Accessibility State
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(
    SUPPORTED_LANGUAGES[0]
  );
  const [isLargeText, setIsLargeText] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [languageNotice, setLanguageNotice] = useState<string | null>(null);

  // Refs for outside-click dismissal
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

  // Toggle Fullscreen Kiosk
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
    }
  };

  // Language Selection
  const handleSelectLanguage = (lang: LanguageOption) => {
    setSelectedLanguage(lang);
    setIsLangMenuOpen(false);

    if (lang.code !== "en") {
      setLanguageNotice(
        `${lang.name} voice interaction is coming soon. English speech is active.`
      );
      setTimeout(() => setLanguageNotice(null), 4500);
    } else {
      setLanguageNotice(null);
    }
  };

  // Toggle Accessibility Text Size
  const toggleTextSize = () => {
    const nextState = !isLargeText;
    setIsLargeText(nextState);
    if (nextState) {
      document.documentElement.style.fontSize = "17px";
    } else {
      document.documentElement.style.fontSize = "";
    }
  };

  // Toggle High Contrast Mode
  const toggleHighContrast = () => {
    const nextState = !isHighContrast;
    setIsHighContrast(nextState);
    if (nextState) {
      document.documentElement.classList.add("kiosk-high-contrast");
    } else {
      document.documentElement.classList.remove("kiosk-high-contrast");
    }
  };

  return (
    <header className="relative z-30 flex items-center justify-between rounded-2xl sm:rounded-3xl border border-[#E2E8F0] bg-white/95 px-4 sm:px-6 py-2.5 sm:py-3 shadow-xs backdrop-blur-md shrink-0 w-full transition-colors">
      {/* ── Left: Institutional University Identity ── */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
        {/* Blue Graduation Cap Badge */}
        <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-[#1769D2] text-white shadow-xs">
          <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

        {/* University Name & Subtitle */}
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-xs xs:text-sm sm:text-base font-extrabold uppercase tracking-tight text-[#142D50] leading-tight truncate">
            APIIT Sri Lanka
          </h1>
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#64748B] mt-0.5 leading-none">
            AI Admissions & Marketing Kiosk
          </p>
        </div>
      </div>

      {/* ── Right: Integrated Pill Container [ 🌐 EN ▾ | ♿ | ⛶ ] ── */}
      <div className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-1 gap-1 shadow-2xs shrink-0">
        {/* 1. Language Selector Button & Dropdown */}
        <div className="relative" ref={langMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsLangMenuOpen(!isLangMenuOpen);
              setIsAccessMenuOpen(false);
            }}
            aria-expanded={isLangMenuOpen}
            aria-label="Select language"
            className="flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-bold text-[#142D50] hover:bg-white hover:text-[#1769D2] transition active:scale-95"
          >
            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#1769D2]" />
            <span>{selectedLanguage.nativeName}</span>
            <ChevronDown
              className={`h-3 w-3 text-[#64748B] transition-transform duration-200 ${isLangMenuOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Language Popover */}
          {isLangMenuOpen && (
            <div className="absolute right-0 top-10 z-50 w-40 rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-lg shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] border-b border-[#E2E8F0]/70 mb-1">
                Language
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang)}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${isSelected
                        ? "bg-blue-50 text-[#1769D2]"
                        : "text-[#142D50] hover:bg-[#F8FAFC]"
                      }`}
                  >
                    <span>{lang.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#1769D2]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Thin Divider */}
        <span className="h-4 w-px bg-slate-300" aria-hidden="true" />

        {/* 2. Accessibility Button & Popover */}
        <div className="relative" ref={accessMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsAccessMenuOpen(!isAccessMenuOpen);
              setIsLangMenuOpen(false);
            }}
            aria-expanded={isAccessMenuOpen}
            aria-label="Accessibility settings"
            title="Accessibility Settings"
            className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition active:scale-95 ${isLargeText || isHighContrast
                ? "bg-blue-50 text-[#1769D2]"
                : "text-[#142D50] hover:bg-white hover:text-[#1769D2]"
              }`}
          >
            <Accessibility className="h-4 w-4" />
          </button>

          {/* Accessibility Popover */}
          {isAccessMenuOpen && (
            <div className="absolute right-0 top-10 z-50 w-60 rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-lg shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#142D50]">
                  Accessibility
                </span>
                <span className="text-[10px] text-[#64748B]">Display Options</span>
              </div>

              <div className="space-y-2">
                {/* Font Scaling */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="h-3.5 w-3.5 text-[#64748B]" />
                    <span className="text-xs font-semibold text-[#142D50]">
                      Large Text
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTextSize}
                    className={`h-6 px-2.5 rounded-lg text-xs font-bold border transition ${isLargeText
                        ? "bg-[#1769D2] text-white border-[#1769D2]"
                        : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                      }`}
                  >
                    {isLargeText ? "Large" : "Default"}
                  </button>
                </div>

                {/* High Contrast Mode */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-[#64748B]" />
                    <span className="text-xs font-semibold text-[#142D50]">
                      Contrast
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleHighContrast}
                    className={`h-6 px-2.5 rounded-lg text-xs font-bold border transition ${isHighContrast
                        ? "bg-[#142D50] text-white border-[#142D50]"
                        : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                      }`}
                  >
                    {isHighContrast ? "High" : "Standard"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Thin Divider */}
        <span className="h-4 w-px bg-slate-300" aria-hidden="true" />

        {/* 3. Fullscreen Kiosk Mode Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-[#142D50] hover:bg-white hover:text-[#1769D2] transition active:scale-95"
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
        </button>
      </div>

      {/* Floating Language Notice */}
      {languageNotice && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-[90%] max-w-sm rounded-xl border border-blue-200 bg-blue-50/95 p-2 text-center text-xs font-medium text-blue-900 shadow-md">
          {languageNotice}
        </div>
      )}
    </header>
  );
};

export default KioskHeader;
