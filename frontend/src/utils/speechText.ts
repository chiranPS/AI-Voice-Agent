/**
 * APIIT Sri Lanka Kiosk - Speech Text Preprocessing & Phonetic Normalizer
 * 
 * Cleans assistant responses before sending to the browser Text-to-Speech (TTS) engine:
 * - Phonetically normalizes institutional terms (APIIT, A/L, O/L, BSc, LKR)
 * - Strips Markdown markers (bold, italics, headers, code, tables, links)
 * - Inserts natural conversational pauses (commas, periods) for human-like cadence
 * - Removes raw symbols, emojis, and slashes so the voice does not announce literal punctuation
 */
export function prepareSpeechText(text: string): string {
  if (!text || typeof text !== "string") return "";

  let cleaned = text;

  // 1. Remove Markdown code blocks (fenced ```...```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, " ");

  // 2. Remove inline code formatting `code` -> code
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

  // 3. Remove Markdown images ![alt](url)
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");

  // 4. Convert Markdown links [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // 5. Remove Markdown table divider rows like |---|---|
  cleaned = cleaned.replace(/^\s*\|?(\s*:?-+:?\s*\|)+\s*$/gm, "");

  // 6. Handle Markdown table content rows: convert "| Col 1 | Col 2 |" -> "Col 1, Col 2."
  cleaned = cleaned.replace(/^\s*\|(.+)\|\s*$/gm, (_, row) => {
    return (
      row
        .split("|")
        .map((cell: string) => cell.trim())
        .filter(Boolean)
        .join(", ") + ". "
    );
  });

  // 7. Remove blockquotes (> text)
  cleaned = cleaned.replace(/^\s*>\s*/gm, "");

  // 8. Convert headings into punctuated spoken sentences
  cleaned = cleaned.replace(/^#{1,6}\s*(.+)$/gm, (_, h) => {
    const trimmed = h.trim();
    return /[.!?]$/.test(trimmed) ? `${trimmed} ` : `${trimmed}. `;
  });

  // 9. Remove bold and italic markers (*, **, ***, _, __, ___)
  cleaned = cleaned.replace(/\*\*\*(.*?)\*\*\*/g, "$1");
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*(.*?)\*/g, "$1");
  cleaned = cleaned.replace(/___(.*?)___/g, "$1");
  cleaned = cleaned.replace(/__(.*?)__/g, "$1");
  cleaned = cleaned.replace(/_(.*?)_/g, "$1");

  // 10. Remove strikethrough (~~text~~)
  cleaned = cleaned.replace(/~~(.*?)~~/g, "$1");

  // =========================================================================
  // PHONETIC & INSTITUTIONAL NORMALIZATION (Crucial for Natural Sri Lankan Pronunciation)
  // =========================================================================

  // A. Institution Name: Pronounce "APIIT" as "App-it" (short, natural form)
  cleaned = cleaned.replace(/\bAPIIT\b/gi, "App-it");

  // B. Examinations: Catch all variations (A/Levels, A/Level, A/Ls, A/L, GCE A/L)
  cleaned = cleaned.replace(/\bA\/Levels?\b/gi, "A Levels");
  cleaned = cleaned.replace(/\bA\/Ls\b/gi, "A Levels");
  cleaned = cleaned.replace(/\bA\/L\b/gi, "A Level");
  cleaned = cleaned.replace(/\bO\/Levels?\b/gi, "O Levels");
  cleaned = cleaned.replace(/\bO\/Ls\b/gi, "O Levels");
  cleaned = cleaned.replace(/\bO\/L\b/gi, "O Level");

  // C. Degree Designations: Natural expanded academic phrasing
  cleaned = cleaned.replace(/\bBSc\s*\(\s*Hons\s*\)/gi, "B.S.C. Honours");
  cleaned = cleaned.replace(/\bBEng\s*\(\s*Hons\s*\)/gi, "B.Eng. Honours");
  cleaned = cleaned.replace(/\bBSc\b/gi, "B.S.C.");
  cleaned = cleaned.replace(/\bBEng\b/gi, "B.Eng.");
  cleaned = cleaned.replace(/\bMSc\b/gi, "M.S.C.");
  cleaned = cleaned.replace(/\bMBA\b/gi, "M.B.A.");
  cleaned = cleaned.replace(/\bPhD\b/gi, "P.H.D.");

  // D. Geography & Currency
  cleaned = cleaned.replace(/\bUK\b/g, "U.K.");
  cleaned = cleaned.replace(/\bLKR\s*([\d,]+)/gi, "$1 Sri Lankan Rupees");
  cleaned = cleaned.replace(/Rs\.?\s*([\d,]+)/gi, "$1 Rupees");

  // =========================================================================
  // CADENCE & NATURAL PAUSES
  // =========================================================================

  // 11. Remove bullet list markers and add a natural breath pause between items
  cleaned = cleaned.replace(/^\s*[-*+]\s+(.+)$/gm, (_, item) => {
    const trimmed = item.trim();
    return /[.!?]$/.test(trimmed) ? `${trimmed} ` : `${trimmed}. `;
  });

  // 12. Remove numbered list markers and add pause
  cleaned = cleaned.replace(/^\s*\d+[.)]\s+(.+)$/gm, (_, item) => {
    const trimmed = item.trim();
    return /[.!?]$/.test(trimmed) ? `${trimmed} ` : `${trimmed}. `;
  });

  // 13. Replace colons with natural pauses, except inside times (e.g., 10:30 AM)
  cleaned = cleaned.replace(/(?<!\d):|:(?!\d)/g, ", ");

  // 14. Remove remaining technical punctuation and symbols
  cleaned = cleaned.replace(/[*#_~`^<>{}|[\]\\]/g, " ");

  // 15. Remove emojis and checkmark glyphs
  cleaned = cleaned.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, "");
  cleaned = cleaned.replace(/[✓✔✗✕•·]/g, "");

  // 16. Normalize punctuation and spacing
  cleaned = cleaned.replace(/\.{2,}/g, ".");
  cleaned = cleaned.replace(/,{2,}/g, ",");
  cleaned = cleaned.replace(/,\s*\./g, ".");

  // Remove spaces before punctuation
  cleaned = cleaned.replace(/\s+([.,!?])/g, "$1");

  // Ensure breathing spaces after periods and commas
  cleaned = cleaned.replace(/([.!?])(?=[A-Za-z])/g, "$1 ");
  cleaned = cleaned.replace(/(?<!\d),/g, ", ");
  cleaned = cleaned.replace(/,(?!\d)/g, ", ");

  // Clean repeated whitespace
  cleaned = cleaned.replace(/\s+/g, " ");

  return cleaned.trim();
}
