import os
import time
import tempfile
from fastapi import UploadFile

from google import genai
from dotenv import load_dotenv

load_dotenv()

# Shared client — uses stable v1 API
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


class MultimediaProcessor:
    def __init__(self):
        pass

    async def process_pdf(self, file: UploadFile) -> str:
        return await self._upload_to_gemini(file, mime_type="application/pdf")

    async def process_media(self, file: UploadFile, is_video: bool = True) -> str:
        mime_type = file.content_type or ("video/mp4" if is_video else "audio/mpeg")
        return await self._upload_to_gemini(file, mime_type=mime_type)

    async def _upload_to_gemini(self, file: UploadFile, mime_type: str) -> str:
        suffix = mime_type.split("/")[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{suffix}") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        try:
            print(f"Uploading {file.filename} to Gemini File API...")
            uploaded_file = client.files.upload(
                file=tmp_path,
                config={"mime_type": mime_type, "display_name": file.filename},
            )

            # Wait for the file to finish processing
            while uploaded_file.state.name == "PROCESSING":
                print(".", end="", flush=True)
                time.sleep(2)
                uploaded_file = client.files.get(name=uploaded_file.name)

            if uploaded_file.state.name == "FAILED":
                raise Exception("Gemini File API processing failed.")

            print(f"\nFile active: {uploaded_file.uri}")
            return uploaded_file.name  # File ID used as collection_id

        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)


processor = MultimediaProcessor()
