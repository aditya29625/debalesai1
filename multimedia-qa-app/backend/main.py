import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import uuid
from dotenv import load_dotenv

from services.processor import processor
from services.qa_service import qa_service

load_dotenv()

app = FastAPI(title="Multimedia Q&A API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[float] = None

class ChatRequest(BaseModel):
    collection_id: str
    question: str
    history: List[ChatMessage] = []

@app.get("/")
async def root():
    return {"message": "Multimedia Q&A API is running"}

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    file_type: str = Form(...)
):
    try:
        if file_type == "pdf":
            collection_id = await processor.process_pdf(file)
        elif file_type in ["audio", "video"]:
            collection_id = await processor.process_media(file, is_video=(file_type == "video"))
        else:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        return {"filename": file.filename, "status": "success", "collection_id": collection_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        result = await qa_service.get_answer(request.collection_id, request.question, request.history)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/summary/{collection_id:path}")
async def get_summary(collection_id: str):
    try:
        result = await qa_service.get_summary(collection_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
