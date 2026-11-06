import { X, Sparkles, HelpCircle } from "lucide-react";

interface FaqShortcutsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (question: string) => void;
}

const FAQ_PRESETS = [
  { category: "Library & Study", question: "What are the university library opening hours?" },
  { category: "Admissions", question: "How do I apply for undergraduate admission?" },
  { category: "Fees & Funding", question: "What scholarships and financial aids are available?" },
  { category: "Campus Support", question: "Where is the student accommodation office located?" },
  { category: "Contacts", question: "Who can I contact for international student queries?" },
];

export const FaqShortcutsDrawer = ({
  isOpen,
  onClose,
  onSelectQuestion,
}: FaqShortcutsDrawerProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Suggested Inquiries</h3>
              <p className="text-[11px] text-slate-500">Tap any question to ask the assistant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="mt-3.5 space-y-2 max-h-80 overflow-y-auto pr-1">
          {FAQ_PRESETS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSelectQuestion(item.question);
                onClose();
              }}
              className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left transition hover:border-slate-300 hover:bg-slate-100"
            >
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <div>
                <span className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                  {item.category}
                </span>
                <span className="text-xs text-slate-800">{item.question}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqShortcutsDrawer;
