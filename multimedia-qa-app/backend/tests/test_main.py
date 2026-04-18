import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import MagicMock, patch

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Multimedia Q&A API is running"}

@patch("services.processor.processor.process_pdf")
def test_upload_pdf(mock_process):
    mock_process.return_value = "test_collection_id"
    
    # Create a mock PDF file
    file_content = b"%PDF-1.4"
    files = {"file": ("test.pdf", file_content, "application/pdf")}
    data = {"file_type": "pdf"}
    
    response = client.post("/upload", files=files, data=data)
    
    assert response.status_code == 200
    assert response.json()["collection_id"] == "test_collection_id"
    assert response.json()["status"] == "success"

@patch("services.qa_service.qa_service.get_answer")
def test_chat(mock_qa):
    mock_qa.return_value = {
        "answer": "Test answer",
        "timestamps": [{"start": 0, "end": 10}]
    }
    
    payload = {
        "collection_id": "test_id",
        "question": "What is this?",
        "history": []
    }
    
    response = client.post("/chat", json=payload)
    
    assert response.status_code == 200
    assert response.json()["answer"] == "Test answer"

@patch("services.qa_service.qa_service.get_summary")
def test_summary(mock_summary):
    mock_summary.return_value = {"summary": "Test summary"}
    
    response = client.get("/summary/test_id")
    
    assert response.status_code == 200
    assert response.json()["summary"] == "Test summary"
