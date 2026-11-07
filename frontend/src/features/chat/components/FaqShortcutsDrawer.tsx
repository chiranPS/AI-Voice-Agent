import { X, HelpCircle, BookOpen } from "lucide-react";

interface FaqShortcutsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (question: string) => void;
}

const FAQ_PRESETS = [
  {
    category: "Admissions",
    tag: "Requirements & Deadlines",
    question: "How do I apply for undergraduate admission?",
  },
  {
    category: "Library & Study",
    tag: "Access & Hours",
    question: "What are the university library opening hours?",
  },
  {
    category: "Scholarships & Aid",
    tag: "Financial Support",
    question: "What scholarships and financial aids are available?",
  },
  {
    category: "Student Services",
    tag: "Administration Desks",
    question: "Where is the student services desk located?",
  },
  {
    category: "Accommodation",
    tag: "Halls of Residence",
    question: "Where can I find information on student accommodation?",
  },
  {
    category: "International",
    tag: "Global Student Desk",
    question: "Who can I contact for international student queries?",
  },
];

export const FaqShortcutsDrawer = ({
  isOpen,
  onClose,
  onSelectQuestion,
}: FaqShortcutsDrawerProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1769D2] border border-blue-100">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#142D50]">
                University Information Directory
              </h3>
              <p className="text-xs text-[#64748B]">
                Tap any common campus topic to ask the assistant
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close directory"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {FAQ_PRESETS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSelectQuestion(item.question);
                onClose();
              }}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-left transition hover:border-[#1769D2] hover:bg-blue-50/40 active:scale-98 shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#1769D2]">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold tracking-wider text-[#1769D2] uppercase">
                    {item.category} • {item.tag}
                  </span>
                  <span className="text-xs font-semibold text-[#142D50] truncate block">
                    {item.question}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqShortcutsDrawer;
