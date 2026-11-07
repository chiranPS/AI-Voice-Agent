import React from "react";
import {
  GraduationCap,
  Building2,
  Users,
  FileText,
  BookOpen,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

export interface CategoryItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  query: string;
}

export const KIOSK_CATEGORIES: CategoryItem[] = [
  {
    id: "admissions",
    title: "Admissions & Programs",
    icon: GraduationCap,
    query: "How do I apply for undergraduate and postgraduate admissions at Northstar University?",
  },
  {
    id: "facilities",
    title: "Campus Facilities",
    icon: Building2,
    query: "What campus facilities, library study spaces, and computer labs are available?",
  },
  {
    id: "services",
    title: "Student Services",
    icon: Users,
    query: "Where is the student services desk and what student support services are available?",
  },
  {
    id: "policies",
    title: "Policies & Guidelines",
    icon: FileText,
    query: "Tell me about student attendance policy and official campus guidelines.",
  },
  {
    id: "academic",
    title: "Academic Information",
    icon: BookOpen,
    query: "What is the academic calendar, course registration procedure, and exam schedule?",
  },
  {
    id: "enquiries",
    title: "General Enquiries",
    icon: HelpCircle,
    query: "What are the general university contact details and campus reception hours?",
  },
];

interface CategoryGridProps {
  onSelectCategory: (query: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * University Information Categories Grid
 * 6 touch-friendly white rounded cards arranged in 2 columns:
 * - Admissions & Programs      - Campus Facilities
 * - Student Services           - Policies & Guidelines
 * - Academic Information       - General Enquiries
 */
export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  disabled = false,
  className = "",
}) => {
  return (
    <section
      aria-label="University Information Categories"
      className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-3.5 w-full shrink-0 ${className}`}
    >
      {KIOSK_CATEGORIES.map((cat) => {
        const IconComponent = cat.icon;
        return (
          <button
            key={cat.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectCategory(cat.query)}
            className="group flex min-h-[58px] sm:min-h-[66px] lg:min-h-[74px] items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white/95 px-4 sm:px-5 py-3 sm:py-3.5 text-left shadow-2xs backdrop-blur-xs transition-all hover:border-[#1769D2] hover:bg-white hover:shadow-xs active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          >
            {/* Left: Icon Badge & Category Name */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-[#E8F0FE] text-[#1769D2] group-hover:bg-[#1769D2] group-hover:text-white transition-colors duration-200">
                <IconComponent className="h-5.5 w-5.5 sm:h-6 sm:w-6" />
              </div>
              <span className="text-xs sm:text-sm lg:text-base font-bold text-[#142D50] group-hover:text-[#1769D2] transition-colors truncate">
                {cat.title}
              </span>
            </div>

            {/* Right: Touch Indicator Chevron */}
            <ChevronRight className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-[#1769D2] shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>
        );
      })}
    </section>
  );
};

export default CategoryGrid;
