import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

import Button from "../../../components/common/Button";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput = ({
  onSendMessage,
  isLoading,
}: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage("");
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your question here..."
        rows={1}
        disabled={isLoading}
        maxLength={2000}
        aria-label="Your question"
        className="max-h-32 min-h-12 flex-1 resize-none rounded-xl border border-transparent bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      />

      <Button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="h-12 w-12 shrink-0 rounded-xl px-0"
        aria-label="Send message"
      >
        <Send size={19} />
      </Button>
    </form>
  );
};

export default ChatInput;