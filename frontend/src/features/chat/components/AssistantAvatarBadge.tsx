import React from "react";
import type { AvatarType } from "../../avatar/types/avatar.types";

interface AssistantAvatarBadgeProps {
  gender: AvatarType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * High-quality stylized SVG Portrait Avatar for Sophia & Alex,
 * matching the circular assistant badges in the Northstar University Kiosk visual reference.
 */
export const AssistantAvatarBadge: React.FC<AssistantAvatarBadgeProps> = ({
  gender,
  size = "md",
  className = "",
}) => {
  const sizeClass =
    size === "sm"
      ? "h-8 w-8"
      : size === "lg"
      ? "h-12 w-12"
      : "h-9 w-9 sm:h-10 sm:w-10";

  const isSophia = gender === "female";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ring-2 ring-white/90 shadow-xs bg-[#e2f0fd] flex items-center justify-center ${sizeClass} ${className}`}
    >
      {isSophia ? (
        // Sophia: Warm, professional female assistant portrait
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full object-cover"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle gradient */}
          <circle cx="50" cy="50" r="50" fill="url(#sophia_bg)" />
          
          {/* Hair back / Bun */}
          <ellipse cx="50" cy="24" rx="20" ry="14" fill="#3D2314" />
          <circle cx="50" cy="18" r="12" fill="#4A2E1B" />
          <path d="M50 14 C44 14 40 18 42 24 C44 30 56 30 58 24 C60 18 56 14 50 14 Z" fill="#2B180D" />

          {/* Neck */}
          <path d="M42 56 L42 68 L58 68 L58 56 Z" fill="#E8B298" />
          <path d="M42 58 C46 63 54 63 58 58 L58 64 L42 64 Z" fill="#D99E83" opacity="0.5" />

          {/* Face Base */}
          <path
            d="M32 40 C32 28 40 22 50 22 C60 22 68 28 68 40 C68 53 60 62 50 62 C40 62 32 53 32 40 Z"
            fill="#F6C3A6"
          />

          {/* Hair Front Bangs & Side Locks */}
          <path
            d="M31 38 C30 27 38 20 50 20 C62 20 70 27 69 38 C67 33 60 27 50 28 C40 27 33 33 31 38 Z"
            fill="#4A2E1B"
          />
          <path d="M30 36 C30 46 33 53 35 56 C34 50 33 42 33 36 Z" fill="#3D2314" />
          <path d="M70 36 C70 46 67 53 65 56 C66 50 67 42 67 36 Z" fill="#3D2314" />

          {/* Eyes & Eyebrows */}
          <ellipse cx="42" cy="38" rx="3" ry="2" fill="#2C1B10" />
          <ellipse cx="58" cy="38" rx="3" ry="2" fill="#2C1B10" />
          <circle cx="43" cy="37.5" r="0.9" fill="#FFFFFF" />
          <circle cx="59" cy="37.5" r="0.9" fill="#FFFFFF" />
          {/* Gentle Smile */}
          <path d="M44 49 C46 52 54 52 56 49" stroke="#993D3D" strokeWidth="1.8" strokeLinecap="round" />

          {/* White Shirt Collar */}
          <path d="M43 65 L50 78 L57 65 Z" fill="#FFFFFF" />
          <path d="M38 65 L44 76 L48 65 Z" fill="#F1F5F9" />
          <path d="M62 65 L56 76 L52 65 Z" fill="#F1F5F9" />

          {/* University Navy Blazer */}
          <path
            d="M20 100 L24 74 C26 69 32 67 38 67 L45 78 L50 94 L55 78 L62 67 C68 67 74 69 76 74 L80 100 Z"
            fill="#1565C0"
          />
          {/* Blazer Lapels */}
          <path d="M35 67 L46 84 L38 100 L23 100 Z" fill="#0D47A1" />
          <path d="M65 67 L54 84 L62 100 L77 100 Z" fill="#0D47A1" />

          <defs>
            <linearGradient id="sophia_bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#90CAF9" />
              <stop offset="1" stopColor="#E3F2FD" />
            </linearGradient>
          </defs>
        </svg>
      ) : (
        // Alex: Warm, professional male assistant portrait
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full object-cover"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle gradient */}
          <circle cx="50" cy="50" r="50" fill="url(#alex_bg)" />

          {/* Hair Back */}
          <path d="M30 36 C30 22 40 18 50 18 C60 18 70 22 70 36 Z" fill="#1E293B" />

          {/* Neck */}
          <path d="M42 54 L42 68 L58 68 L58 54 Z" fill="#E2B199" />
          <path d="M42 56 C46 61 54 61 58 56 L58 62 L42 62 Z" fill="#C99882" opacity="0.4" />

          {/* Face Base */}
          <path
            d="M33 38 C33 27 40 24 50 24 C60 24 67 27 67 38 C67 52 60 61 50 61 C40 61 33 52 33 38 Z"
            fill="#F3C3A8"
          />

          {/* Clean Parted Hair */}
          <path
            d="M31 34 C31 22 40 16 52 16 C63 16 69 22 69 32 C65 25 56 21 47 22 C39 23 34 27 31 34 Z"
            fill="#0F172A"
          />

          {/* Eyes & Eyebrows */}
          <path d="M38 33 Q43 31 46 33" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M54 33 Q57 31 62 33" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="42" cy="38" rx="2.8" ry="2" fill="#1E293B" />
          <ellipse cx="58" cy="38" rx="2.8" ry="2" fill="#1E293B" />
          <circle cx="43" cy="37.5" r="0.8" fill="#FFFFFF" />
          <circle cx="59" cy="37.5" r="0.8" fill="#FFFFFF" />
          {/* Confident Smile */}
          <path d="M44 49 C47 52 53 52 56 49" stroke="#993D3D" strokeWidth="1.8" strokeLinecap="round" />

          {/* Formal Shirt & University Tie */}
          <path d="M42 64 L50 76 L58 64 Z" fill="#FFFFFF" />
          {/* Teal / Cyan University Tie */}
          <path d="M48 68 L52 68 L54 84 L50 96 L46 84 Z" fill="#00897B" />
          <path d="M48 66 L52 66 L53 70 L47 70 Z" fill="#00695C" />

          {/* Dark Business Suit */}
          <path
            d="M20 100 L24 73 C26 68 32 66 38 66 L46 76 L50 94 L54 76 L62 66 C68 66 74 68 76 73 L80 100 Z"
            fill="#1E293B"
          />
          <path d="M35 66 L46 84 L38 100 L23 100 Z" fill="#0F172A" />
          <path d="M65 66 L54 84 L62 100 L77 100 Z" fill="#0F172A" />

          <defs>
            <linearGradient id="alex_bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#93C5FD" />
              <stop offset="1" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
};

export default AssistantAvatarBadge;

