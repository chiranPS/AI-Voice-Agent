/**
 * Northstar University Kiosk - Speech Text Preprocessing Utility
 * 
 * Cleans assistant responses before sending to the browser Text-to-Speech (TTS) engine:
 * - Strips Markdown markers (bold, italics, headers, code, bullet/numbered lists, tables, links)
 * - Converts formatting and punctuation into natural spoken pauses
 * - Preserves numbers, dates, times, currency amounts, and university terminology
 * - Removes raw symbols and emoji glyphs so the voice doesn't read technical markup aloud
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
        .join(", ") + "."
    );
  });

  // 7. Remove blockquotes (> text)
  cleaned = cleaned.replace(/^\s*>\s*/gm, "");

  // 8. Convert headings into punctuated spoken sentences
  cleaned = cleaned.replace(/^#{1,6}\s*(.+)$/gm, (_, h) => {
    const trimmed = h.trim();
    return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
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

  // 11. Remove bullet list markers and ensure natural pauses between items
  cleaned = cleaned.replace(/^\s*[-*+]\s+(.+)$/gm, (_, item) => {
    const trimmed = item.trim();
    return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  });

  // 12. Remove numbered list markers and ensure natural pauses between items
  cleaned = cleaned.replace(/^\s*\d+[.)]\s+(.+)$/gm, (_, item) => {
    const trimmed = item.trim();
    return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  });

  // 13. Replace colons with natural pauses, except inside times like 10:30 AM or 9:00
  cleaned = cleaned.replace(/(?<!\d):|:(?!\d)/g, ".");

  // 14. Remove unnecessary special characters that TTS would otherwise read aloud
  cleaned = cleaned.replace(/[*#_~`^<>{}|[\]\\]/g, " ");

  // 15. Remove emojis and checkmark glyphs so TTS does not announce symbol names
  cleaned = cleaned.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, "");
  cleaned = cleaned.replace(/[✓✔✗✕]/g, "");

  // 16. Normalize punctuation and whitespace:
  cleaned = cleaned.replace(/\.{2,}/g, ".");
  cleaned = cleaned.replace(/,{2,}/g, ",");
  cleaned = cleaned.replace(/,\s*\./g, ".");

  // Remove spaces before punctuation (e.g., "Registrar ." -> "Registrar.")
  cleaned = cleaned.replace(/\s+([.,!?])/g, "$1");

  // Ensure natural spacing after punctuation when followed by words (preserve numbers like $14,500 or 3.14)
  cleaned = cleaned.replace(/([.!?])(?=[A-Za-z])/g, "$1 ");
  cleaned = cleaned.replace(/(?<!\d),/g, ", ");
  cleaned = cleaned.replace(/,(?!\d)/g, ", ");

  // Clean repeated whitespace
  cleaned = cleaned.replace(/\s+/g, " ");

  return cleaned.trim();
}

export default prepareSpeechText;
