import type { ReactNode } from "react";

interface KioskLayoutProps {
  children: ReactNode;
}

/**
 * Production-Ready APIIT Sri Lanka AI Admissions & Information Kiosk Layout
 * - Unified single application container
 * - Predominantly clean White (#FFFFFF) canvas
 * - Responsive viewport container handling desktop, tablet, mobile and physical touchscreens
 */
export const KioskLayout = ({ children }: KioskLayoutProps) => {
  return (
    <div className="relative flex h-[100dvh] w-full max-w-[100vw] flex-col overflow-hidden bg-[#F5F6F7] text-[#202124] antialiased selection:bg-red-100 selection:text-[#ED1C24]">
      {/* 
        Single Unified Main Application Container:
        Fills the entire screen on mobile and kiosk touchscreen displays;
        centered with generous margins on ultra-wide desktop monitors.
      */}
      <div className="relative flex flex-1 flex-col w-full h-full max-w-[1440px] mx-auto bg-white overflow-hidden sm:shadow-sm sm:border sm:border-[#E5E7EB]/70">
        {children}
      </div>
    </div>
  );
};

export default KioskLayout;
