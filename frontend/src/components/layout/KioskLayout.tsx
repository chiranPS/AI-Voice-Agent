import type { ReactNode } from "react";

interface KioskLayoutProps {
  children: ReactNode;
}

/**
 * Institutional Northstar University Kiosk Layout Container
 * Features a luminous, professional light-blue atmospheric sky backdrop (#bfe0fe -> #eff6ff)
 * with soft ambient gradients that match the portrait kiosk reference.
 * Optimized for full touchscreen kiosk responsiveness across portrait and landscape screens.
 */
export const KioskLayout = ({ children }: KioskLayoutProps) => {
  return (
    <div className="relative flex h-[100dvh] w-full max-w-[100vw] flex-col overflow-hidden bg-gradient-to-b from-[#bfe0fe] via-[#e2f0fd] to-[#b3d7fc] text-[#142D50] antialiased selection:bg-blue-200">
      {/* Soft Ambient Light & Campus Architectural Vignettes */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-300/30 to-transparent" />
      <div className="pointer-events-none fixed -top-32 left-1/2 h-[450px] w-[650px] -translate-x-1/2 rounded-full bg-white/40 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-blue-400/25 to-transparent" />

      {/* Main Content Shell: Full viewport height, responsive max width, handles both portrait kiosk and tablet/desktop gracefully */}
      <div className="relative z-10 flex flex-1 flex-col w-full max-w-[1100px] xl:max-w-[1240px] mx-auto h-full min-h-0 p-2 sm:p-3 lg:p-4 gap-2 sm:gap-2.5 overflow-y-auto lg:overflow-hidden scrollbar-none">
        {children}
      </div>
    </div>
  );
};

export default KioskLayout;
