import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.models.faq_embedding import EMBEDDING_DIMENSIONS

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
EMBEDDING_MODEL = os.getenv(
    "GEMINI_EMBEDDING_MODEL",
    "gemini-embedding-2",
)

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured")

client = genai.Client(api_key=API_KEY)


def generate_document_embedding(
    question: str,
    answer: str,
) -> list[float]:
    content = (
        f"title: {question} | "
        f"text: {answer}"
    )

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=content,
        config=types.EmbedContentConfig(
            output_dimensionality=EMBEDDING_DIMENSIONS,
        ),
    )

    values = response.embeddings[0].values

    if len(values) != EMBEDDING_DIMENSIONS:
        raise ValueError(
            f"Expected {EMBEDDING_DIMENSIONS} dimensions, "
            f"received {len(values)}"
        )

    return values


def generate_query_embedding(question: str) -> list[float]:
    content = f"task: search result | query: {question}"

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=content,
        config=types.EmbedContentConfig(
            output_dimensionality=EMBEDDING_DIMENSIONS,
        ),
    )

    values = response.embeddings[0].values

    if len(values) != EMBEDDING_DIMENSIONS:
        raise ValueError(
            f"Expected {EMBEDDING_DIMENSIONS} dimensions, "
            f"received {len(values)}"
        )

    return values

def generate_document_chunk_embedding(
    title: str,
    content: str,
) -> list[float]:
    """
    Generate an embedding for an extracted document chunk.
    """

    text = (
        f"task: search result | "
        f"title: {title} | "
        f"text: {content}"
    )

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(
            output_dimensionality=EMBEDDING_DIMENSIONS,
        ),
    )

    values = response.embeddings[0].values

    if len(values) != EMBEDDING_DIMENSIONS:
        raise ValueError(
            f"Expected {EMBEDDING_DIMENSIONS} dimensions, "
            f"received {len(values)}"
        )

    return values