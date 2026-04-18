import os
import asyncio
from typing import List, Any

from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# New unified SDK client — uses stable v1 API (not v1beta)
client = genai.Client(api_key=GOOGLE_API_KEY)

# Fallback chain — each model has its own independent quota bucket
MODELS_PRIORITY = [
    "gemini-2.0-flash",       # Primary
    "gemini-2.0-flash-lite",  # Lighter model, higher free-tier limits
    "gemini-1.5-flash",       # Legacy fallback
]

SYSTEM_PROMPT = (
    "You are an AI assistant helping a user with their uploaded document, audio, or video file. "
    "The file is attached to this request. "
    "If the file is a video or audio, YOU MUST pinpoint specific moments in the content to support your answers. "
    "CRITICAL FORMATTING REQUIREMENT: When referencing a specific part of the video or audio, ALWAYS use the exact tag format [PLAY:MM:SS]. "
    "For example: 'The speaker mentions the budget at [PLAY:02:15]' or 'Check out the introduction at [PLAY:00:00]'. "
    "This tag is required to generate the 'Play' button in the UI. DO NOT USE ANY OTHER TIMESTAMP FORMAT."
)

MAX_RETRIES = 3
BASE_BACKOFF = 2  # seconds; doubles each attempt: 2 → 4 → 8


def _is_quota_error(e: Exception) -> bool:
    msg = str(e).lower()
    return "429" in msg or "quota" in msg or "resource_exhausted" in msg


async def _invoke_with_fallback(fn):
    """
    Tries fn(model_name) across MODELS_PRIORITY with exponential backoff.
    Returns the result of the first successful call.
    Raises the last exception if all models are exhausted.
    """
    last_error = None
    for model_name in MODELS_PRIORITY:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                print(f"DEBUG: model={model_name} attempt={attempt}")
                return fn(model_name)
            except Exception as e:
                last_error = e
                if _is_quota_error(e):
                    if attempt < MAX_RETRIES:
                        wait = BASE_BACKOFF * (2 ** (attempt - 1))
                        print(f"WARN: Quota hit on {model_name}, retrying in {wait}s...")
                        await asyncio.sleep(wait)
                    else:
                        print(f"WARN: All retries exhausted for {model_name}, trying next model...")
                        break
                else:
                    raise  # Non-quota errors bubble up immediately
    raise last_error


class QAService:

    async def get_answer(self, collection_id: str, question: str, history: List[Any] = []):
        try:
            print(f"DEBUG: get_answer collection_id={collection_id}")

            # Fetch the already-uploaded file reference
            file_obj = client.files.get(name=collection_id)
            print(f"DEBUG: file uri={file_obj.uri} mime={file_obj.mime_type}")

            def _call(model_name):
                # Build chat history — file is injected as the very first user turn
                gemini_history = [
                    types.Content(
                        role="user",
                        parts=[
                            types.Part.from_text("Here is the file context for my questions."),
                            types.Part.from_uri(
                                file_uri=file_obj.uri,
                                mime_type=file_obj.mime_type,
                            ),
                        ],
                    ),
                    types.Content(
                        role="model",
                        parts=[types.Part.from_text(
                            "Understood. I have access to the file and am ready to answer your questions."
                        )],
                    ),
                ]

                for msg in history:
                    role = "user" if msg["role"] == "user" else "model"
                    gemini_history.append(
                        types.Content(role=role, parts=[types.Part.from_text(msg["content"])])
                    )

                chat = client.chats.create(
                    model=model_name,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                    ),
                    history=gemini_history,
                )
                response = chat.send_message(question)
                return response.text

            answer = await _invoke_with_fallback(_call)
            return {"answer": answer, "timestamps": []}

        except Exception as e:
            print(f"ERROR in get_answer: {e}")
            if _is_quota_error(e):
                msg = (
                    "⚠️ API quota exceeded for all available models. Your free-tier daily limit "
                    "has been reached. Please wait a few minutes and try again, or enable billing "
                    "at https://ai.google.dev to remove rate limits."
                )
            else:
                msg = f"Error interacting with Gemini: {str(e)}"
            return {"answer": msg, "timestamps": []}

    async def get_summary(self, collection_id: str):
        try:
            file_obj = client.files.get(name=collection_id)

            def _call(model_name):
                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Part.from_uri(
                            file_uri=file_obj.uri,
                            mime_type=file_obj.mime_type,
                        ),
                        types.Part.from_text("Provide a concise summary of this file content."),
                    ],
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                    ),
                )
                return response.text

            summary = await _invoke_with_fallback(_call)
            return {"summary": summary}

        except Exception as e:
            print(f"ERROR in get_summary: {e}")
            if _is_quota_error(e):
                msg = (
                    "⚠️ API quota exceeded. Your free-tier daily limit has been reached. "
                    "Please wait a few minutes and try again, or enable billing at "
                    "https://ai.google.dev to remove rate limits."
                )
            else:
                msg = f"Error generating summary: {str(e)}"
            return {"summary": msg}


qa_service = QAService()
