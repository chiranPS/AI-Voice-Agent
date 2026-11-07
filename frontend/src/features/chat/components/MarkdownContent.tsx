import React from "react";

interface MarkdownContentProps {
  content: string;
}

/**
 * Lightweight, accessible Markdown renderer tailored for university kiosk answers.
 * Parses headings, bullet lists, numbered lists, bold text, inline code, and paragraphs.
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  if (!content) return null;

  // Split content into blocks by double newlines or single newlines
  const lines = content.split("\n");

  const blocks: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let keyCounter = 0;

  const flushList = () => {
    if (!currentList) return;
    const ListTag = currentList.type;
    const isUl = currentList.type === "ul";

    blocks.push(
      <ListTag
        key={`list-${keyCounter++}`}
        className={`my-2 space-y-1.5 ${
          isUl ? "list-disc pl-5 marker:text-[#1769D2]" : "list-decimal pl-5 marker:font-bold marker:text-[#142D50]"
        }`}
      >
        {currentList.items.map((item, idx) => (
          <li key={idx} className="text-xs sm:text-sm leading-relaxed text-[#142D50]">
            {parseInline(item)}
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    // Check for Headings
    if (line.startsWith("### ")) {
      flushList();
      blocks.push(
        <h4
          key={`h4-${keyCounter++}`}
          className="mt-3 mb-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#142D50] border-b border-[#E2E8F0]/70 pb-1"
        >
          {parseInline(line.replace(/^###\s+/, ""))}
        </h4>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h3
          key={`h3-${keyCounter++}`}
          className="mt-3.5 mb-1.5 text-sm sm:text-base font-bold text-[#142D50]"
        >
          {parseInline(line.replace(/^##\s+/, ""))}
        </h3>
      );
      continue;
    }

    if (line.startsWith("# ")) {
      flushList();
      blocks.push(
        <h2
          key={`h2-${keyCounter++}`}
          className="mt-4 mb-2 text-base sm:text-lg font-bold text-[#142D50]"
        >
          {parseInline(line.replace(/^#\s+/, ""))}
        </h2>
      );
      continue;
    }

    // Check for Bullet Lists (- or * or •)
    if (/^[-*•]\s+/.test(line)) {
      const itemText = line.replace(/^[-*•]\s+/, "");
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      continue;
    }

    // Check for Numbered Lists (1., 2., etc.)
    if (/^\d+\.\s+/.test(line)) {
      const itemText = line.replace(/^\d+\.\s+/, "");
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      continue;
    }

    // Regular Paragraph
    flushList();
    blocks.push(
      <p
        key={`p-${keyCounter++}`}
        className="my-1.5 text-xs sm:text-sm leading-relaxed text-[#142D50] first:mt-0 last:mb-0"
      >
        {parseInline(line)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-1">{blocks}</div>;
};

/**
 * Parses inline formatting: **bold**, `code`, and [links](url)
 */
function parseInline(text: string): React.ReactNode {
  // Regex splitting by bold (**...**), inline code (`...`), or links ([text](url))
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={`b-${match.index}`} className="font-bold text-[#142D50]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={`c-${match.index}`}
          className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono text-[#1769D2]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[") && token.includes("](")) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={`a-${match.index}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#1769D2] underline decoration-blue-300 hover:text-blue-800"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default MarkdownContent;

