import React from "react";
import {
  Home,
  LayoutGrid,
  AudioLines,
  RotateCcw,
  Settings,
} from "lucide-react";

interface KioskBottomNavProps {
  activeTab?: string;
  onHome: () => void;
  onCategories: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onReset: () => void;
  onSettings: () => void;
}

/**
 * Floating Institutional Bottom Navigation Dock
 * Directly matching the bottom dock in the Northstar University Kiosk visual reference:
 * [ (⌂ Home) | ⊞ Categories | ılı Voice | ⟲ Reset | ⚙ Settings ]
 */
export const KioskBottomNav: React.FC<KioskBottomNavProps> = ({
  activeTab = "home",
  onHome,
  onCategories,
  voiceEnabled,
  onToggleVoice,
  onReset,
  onSettings,
}) => {
  return (
    <nav
      aria-label="Kiosk Bottom Navigation"
      className="relative z-30 mx-auto flex w-full max-w-lg items-center justify-between rounded-full border border-[#E2E8F0] bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-md shrink-0 transition-all"
    >
      {/* 1. Home (Active Royal Blue Pill) */}
      <button
        type="button"
        onClick={onHome}
        aria-label="Home"
        className={`flex items-center gap-1.5 rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-bold transition-all active:scale-95 ${
          activeTab === "home"
            ? "bg-[#1769D2] text-white shadow-xs"
            : "text-[#142D50] hover:text-[#1769D2]"
        }`}
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </button>

      {/* Divider */}
      <span className="h-5 w-px bg-slate-200" aria-hidden="true" />

      {/* 2. Categories */}
      <button
        type="button"
        onClick={onCategories}
        aria-label="Categories"
        className="flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#142D50] hover:text-[#1769D2] transition-all active:scale-95"
      >
        <LayoutGrid className="h-4 w-4 text-[#1769D2]" />
        <span className="hidden xs:inline">Categories</span>
      </button>

      {/* Divider */}
      <span className="h-5 w-px bg-slate-200" aria-hidden="true" />

      {/* 3. Voice Toggle */}
      <button
        type="button"
        onClick={onToggleVoice}
        aria-label={voiceEnabled ? "Mute Voice" : "Enable Voice"}
        title={voiceEnabled ? "Voice is ON (click to mute)" : "Voice is MUTED (click to enable)"}
        className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
          voiceEnabled
            ? "text-[#142D50] hover:text-[#1769D2]"
            : "text-amber-600 hover:text-amber-700"
        }`}
      >
        <AudioLines className={`h-4 w-4 ${voiceEnabled ? "text-[#1769D2]" : "text-amber-600"}`} />
        <span className="hidden xs:inline">{voiceEnabled ? "Voice" : "Muted"}</span>
      </button>

      {/* Divider */}
      <span className="h-5 w-px bg-slate-200" aria-hidden="true" />

      {/* 4. Reset Conversation */}
      <button
        type="button"
        onClick={onReset}
        aria-label="Reset Conversation"
        title="Start a fresh conversation"
        className="flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#142D50] hover:text-[#1769D2] transition-all active:scale-95"
      >
        <RotateCcw className="h-4 w-4 text-[#1769D2]" />
        <span className="hidden xs:inline">Reset</span>
      </button>

      {/* Divider */}
      <span className="h-5 w-px bg-slate-200" aria-hidden="true" />

      {/* 5. Settings / Accessibility */}
      <button
        type="button"
        onClick={onSettings}
        aria-label="Settings"
        title="Kiosk Settings & Topics"
        className="flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#142D50] hover:text-[#1769D2] transition-all active:scale-95"
      >
        <Settings className="h-4 w-4 text-[#1769D2]" />
        <span className="hidden xs:inline">Settings</span>
      </button>
    </nav>
  );
};

export default KioskBottomNav;
