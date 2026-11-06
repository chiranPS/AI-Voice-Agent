import re

from pathlib import Path

import pymupdf
from docx import Document as WordDocument


def clean_text(text: str) -> str:
    """
    Clean extracted text while preserving paragraph structure.
    """

    text = text.replace("\x00", " ")

    lines = [
        re.sub(r"[ \t]+", " ", line).strip()
        for line in text.splitlines()
    ]

    cleaned_lines = []

    for line in lines:
        if line:
            cleaned_lines.append(line)
        elif cleaned_lines and cleaned_lines[-1] != "":
            cleaned_lines.append("")

    return "\n".join(cleaned_lines).strip()


def extract_pdf(file_path: Path) -> list[dict]:
    """
    Extract text from each PDF page.
    """

    extracted_pages = []

    with pymupdf.open(file_path) as pdf:

        for page_number, page in enumerate(pdf, start=1):

            text = page.get_text("text")

            text = clean_text(text)

            if text:
                extracted_pages.append({
                    "page_number": page_number,
                    "content": text,
                })

    return extracted_pages


def extract_docx(file_path: Path) -> list[dict]:
    """
    Extract paragraphs and tables from a DOCX file.
    """

    document = WordDocument(file_path)

    content_parts = []

    for paragraph in document.paragraphs:

        text = paragraph.text.strip()

        if text:
            content_parts.append(text)

    for table in document.tables:

        for row in table.rows:

            cells = [
                cell.text.strip()
                for cell in row.cells
            ]

            row_text = " | ".join(
                cell for cell in cells if cell
            )

            if row_text:
                content_parts.append(row_text)

    extracted_text = clean_text(
        "\n\n".join(content_parts)
    )

    if not extracted_text:
        return []

    return [{
        "page_number": None,
        "content": extracted_text,
    }]


def extract_txt(file_path: Path) -> list[dict]:
    """
    Extract text from a TXT file.
    """

    try:
        text = file_path.read_text(encoding="utf-8-sig")

    except UnicodeDecodeError:
        text = file_path.read_text(encoding="cp1252")

    text = clean_text(text)

    if not text:
        return []

    return [{
        "page_number": None,
        "content": text,
    }]


def extract_document_text(
    file_path: str | Path,
    file_type: str,
) -> list[dict]:
    """
    Extract document text based on its file type.

    Returns a list of extracted content sections.
    """

    file_path = Path(file_path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"Document file not found: {file_path}"
        )

    if file_type == "pdf":
        extracted_content = extract_pdf(file_path)

    elif file_type == "docx":
        extracted_content = extract_docx(file_path)

    elif file_type == "txt":
        extracted_content = extract_txt(file_path)

    else:
        raise ValueError(
            f"Unsupported document type: {file_type}"
        )

    if not extracted_content:
        raise ValueError(
            "No readable text was found in this document. "
            "The file may be empty or contain scanned pages."
        )

    return extracted_content

def chunk_extracted_content(
    extracted_sections: list[dict],
    chunk_size: int = 700,
    overlap: int = 100,
) -> list[dict]:
    """
    Split extracted document text into overlapping word-based chunks.

    Page numbers are retained using the page containing
    the first word of each chunk.
    """

    if chunk_size <= 0:
        raise ValueError("Chunk size must be greater than zero.")

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError(
            "Overlap must be non-negative and smaller than chunk size."
        )

    words_with_pages = []

    for section in extracted_sections:

        page_number = section.get("page_number")

        words = section["content"].split()

        for word in words:
            words_with_pages.append({
                "word": word,
                "page_number": page_number,
            })

    if not words_with_pages:
        return []

    chunks = []

    start = 0
    chunk_index = 0

    while start < len(words_with_pages):

        end = min(
            start + chunk_size,
            len(words_with_pages),
        )

        chunk_words = words_with_pages[start:end]

        content = " ".join(
            item["word"] for item in chunk_words
        )

        chunks.append({
            "chunk_index": chunk_index,
            "page_number": chunk_words[0]["page_number"],
            "content": content,
            "token_count": len(chunk_words),
        })

        chunk_index += 1

        if end >= len(words_with_pages):
            break

        start = end - overlap

    return chunks