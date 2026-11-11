import { X, HelpCircle, BookOpen, GraduationCap, CreditCard, Award, Building, Globe } from "lucide-react";

interface FaqShortcutsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (question: string) => void;
}

const FAQ_PRESETS = [
  {
    category: "Programmes",
    tag: "Computing & Business",
    icon: GraduationCap,
    question: "What undergraduate degree programmes are offered with Staffordshire University?",
  },
  {
    category: "Admissions",
    tag: "Entry Criteria",
    icon: BookOpen,
    question: "What are the entry requirements after A/Levels or O/Levels for computing and business?",
  },
  {
    category: "Foundation",
    tag: "Progression Route",
    icon: Building,
    question: "How does the APIIT Foundation Programme lead into Staffordshire University Year 1?",
  },
  {
    category: "Tuition Fees",
    tag: "Investment & Instalments",
    icon: CreditCard,
    question: "What are the tuition fees and payment instalment options for degree programmes?",
  },
  {
    category: "Scholarships",
    tag: "Financial Support",
    icon: Award,
    question: "What merit scholarships and fee reductions are available for prospective students?",
  },
  {
    category: "UK Transfer",
    tag: "Global Mobility",
    icon: Globe,
    question: "Can I transfer credits to Staffordshire University in the UK during my studies?",
  },
  {
    category: "Campus & Life",
    tag: "Colombo 02",
    icon: Building,
    question: "Where is the APIIT City Campus located and what facilities are available for students?",
  },
  {
    category: "Contact Desk",
    tag: "Direct Support",
    icon: HelpCircle,
    question: "How do I schedule an in-person admissions consultation or campus tour?",
  },
];

export const FaqShortcutsDrawer = ({
  isOpen,
  onClose,
  onSelectQuestion,
}: FaqShortcutsDrawerProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEECEE] text-[#ED1C24]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#202124]">
                APIIT Admissions Information Directory
              </h3>
              <p className="text-xs text-[#6B7280]">
                Select any frequently asked campus topic to consult the AI assistant
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close directory"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F5F6F7] hover:text-[#202124] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {FAQ_PRESETS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelectQuestion(item.question);
                  onClose();
                }}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F5F6F7] hover:bg-[#FEECEE] hover:border-[#ED1C24]/30 p-3 text-left transition active:scale-98 shadow-2xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-[#ED1C24] group-hover:bg-[#ED1C24] group-hover:text-white transition">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold tracking-wider text-[#ED1C24] uppercase">
                      {item.category} • {item.tag}
                    </span>
                    <span className="text-xs font-semibold text-[#202124] truncate block mt-0.5">
                      {item.question}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FaqShortcutsDrawer;
