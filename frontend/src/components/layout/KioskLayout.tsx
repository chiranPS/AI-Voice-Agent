import type { ReactNode } from "react";

interface KioskLayoutProps {
  children: ReactNode;
}

/**
 * Modern Light Kiosk Layout Container.
 * Features a soft, professional light blue gradient backdrop (#f0f7ff -> #f8fafc)
 * with gentle atmospheric ambient glows that highlight the kiosk interface.
 */
export const KioskLayout = ({ children }: KioskLayoutProps) => {
  return (
    <div className="relative flex h-[100dvh] w-full max-w-[100vw] flex-col overflow-hidden bg-gradient-to-b from-sky-50/70 via-slate-50 to-blue-50/40 text-slate-900 antialiased selection:bg-sky-200">
      {/* Subtle Ambient Light Blue Atmosphere */}
      <div className="pointer-events-none fixed -top-40 left-1/2 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-sky-200/35 blur-[140px]" />
      <div className="pointer-events-none fixed bottom-0 left-10 h-80 w-80 rounded-full bg-blue-100/30 blur-[130px]" />
      <div className="pointer-events-none fixed top-1/3 right-10 h-80 w-80 rounded-full bg-cyan-100/30 blur-[130px]" />

      {/* Main Content Shell: Full viewport height, no horizontal overflow */}
      <div className="relative z-10 flex flex-1 flex-col w-full max-w-[1600px] mx-auto h-full min-h-0 p-2 sm:p-4 lg:p-5 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default KioskLayout;
