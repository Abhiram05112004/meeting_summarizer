



import logging
import os
import time
import uuid
from pathlib import Path
from datetime import datetime

import aiofiles
import google.generativeai as genai
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import json

# Assuming transcribe_with_assemblyai is in a file at the same level
# If your app.py is structured differently, you may need to adjust the import.
from transcribe import transcribe_with_assemblyai
from summarize import generate_summary_from_transcript
import database as db
import database as db
# --- Configuration & Setup ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Load API keys from .env file or environment
# Ensure you have a .env file in the backend directory or set these variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("API key not found. Please set GEMINI_API_KEY or GOOGLE_API_KEY.")
genai.configure(api_key=GEMINI_API_KEY)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Note: History is now stored in SQLite database (meeting_history.db)
# The database is automatically initialized by the database module

# --- Gemini Summarization Logic ---
BASIC_PROMPT = (
    "Summarize the following meeting transcript into three clear sections: "
    "1) Summary: A concise paragraph highlighting the key points. "
    "2) Key Decisions: A bulleted list of all significant decisions made. "
    "3) Action Items: A bulleted list starting with strong verbs, detailing tasks to be done."
)

# --- FastAPI Application ---
app = FastAPI(
    title="Meeting Summarizer API",
    description="An API to transcribe audio and generate a meeting summary.",
)

# Allow all origins for simple local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ActionItem(BaseModel):
    """Model for an action item."""
    description: str
    owner: Optional[str] = None
    due_date: Optional[str] = None
    completed: bool = False
    order: Optional[int] = None

class SummaryData(BaseModel):
    """Structured summary data."""
    summary: str
    key_decisions: List[str]
    action_items: List[ActionItem]

class SummaryResponse(BaseModel):
    """Response model for a successful summarization."""
    id: str
    filename: str
    timestamp: str
    transcript: str
    summary_data: SummaryData
    duration_transcribe_s: float = Field(..., description="Time taken for transcription in seconds.")
    duration_summarize_s: float = Field(..., description="Time taken for summarization in seconds.")

class HistoryItem(BaseModel):
    """Model for history list item."""
    id: str
    filename: str
    timestamp: str
    summary_preview: str  # First 100 chars of summary

class HistoryListResponse(BaseModel):
    """Response model for history list."""
    items: List[HistoryItem]

class UpdateActionItemsRequest(BaseModel):
    """Request model to update action items for a given summary."""
    action_items: List[ActionItem]

@app.post("/summarize-audio/", response_model=SummaryResponse)
async def summarize_audio_endpoint(file: UploadFile = File(...)):
    """
    Accepts an audio file, transcribes it, and returns a summary.
    """
    # Generate unique ID for this summary
    summary_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    # Save the uploaded file temporarily
    file_suffix = Path(file.filename).suffix or ".tmp"
    temp_path = UPLOAD_DIR / f"{summary_id}{file_suffix}"
    
    try:
        async with aiofiles.open(temp_path, "wb") as out_file:
            while content := await file.read(1024 * 1024):  # Read in 1MB chunks
                await out_file.write(content)
        
        # 1. Transcribe
        logging.info(f"Starting transcription for {temp_path}...")
        t0 = time.time()
        transcript = transcribe_with_assemblyai(temp_path)
        t1 = time.time()
        duration_transcribe = t1 - t0
        logging.info(f"Transcription finished in {duration_transcribe:.2f}s.")

        # 2. Summarize
        summary_text = generate_summary_from_transcript(transcript)
        t2 = time.time()
        duration_summarize = t2 - t1
        logging.info(f"Summarization finished in {duration_summarize:.2f}s.")
        
        # Log the raw response for debugging
        logging.info(f"Raw summary text (first 500 chars): {summary_text[:500]}")
        logging.info(f"Raw summary text type: {type(summary_text)}")
        logging.info(f"Raw summary text length: {len(summary_text)}")

        # Parse the JSON response
        try:
            # Clean the response text (remove markdown code blocks if present)
            clean_summary = summary_text.strip()
            
            # Remove markdown code fences
            if clean_summary.startswith("```json"):
                clean_summary = clean_summary[7:]
            elif clean_summary.startswith("```"):
                clean_summary = clean_summary[3:]
            
            if clean_summary.endswith("```"):
                clean_summary = clean_summary[:-3]
            
            clean_summary = clean_summary.strip()
            
            # Try to extract JSON if there's extra text
            # Look for the first { and last }
            first_brace = clean_summary.find('{')
            last_brace = clean_summary.rfind('}')
            
            if first_brace != -1 and last_brace != -1 and first_brace < last_brace:
                clean_summary = clean_summary[first_brace:last_brace + 1]
            
            logging.info(f"Cleaned summary (first 200 chars): {clean_summary[:200]}")
            
            summary_json = json.loads(clean_summary)
            
            logging.info(f"Successfully parsed JSON with keys: {summary_json.keys()}")
            
            # Validate that we have the expected structure
            if not isinstance(summary_json, dict):
                raise ValueError("Response is not a JSON object")
            
            # Extract fields with validation
            summary_text_content = summary_json.get("summary", "")
            key_decisions_list = summary_json.get("key_decisions", [])
            action_items_list = summary_json.get("action_items", [])
            
            # Log extracted values
            logging.info(f"Extracted summary: '{summary_text_content[:100]}...'")
            logging.info(f"Extracted key_decisions: {key_decisions_list}")
            logging.info(f"Extracted action_items: {action_items_list}")
            
            # Ensure they are the right types
            if not isinstance(summary_text_content, str):
                summary_text_content = str(summary_text_content)
            if not isinstance(key_decisions_list, list):
                key_decisions_list = []
            if not isinstance(action_items_list, list):
                action_items_list = []
            
            # Convert action items to ActionItem objects
            action_items = []
            for item in action_items_list:
                if isinstance(item, dict):
                    action_items.append(ActionItem(**item))
            
            summary_data = SummaryData(
                summary=summary_text_content,
                key_decisions=key_decisions_list,
                action_items=action_items
            )
            
            logging.info(f"✅ Created SummaryData successfully:")
            logging.info(f"   - Summary length: {len(summary_data.summary)} chars")
            logging.info(f"   - Key decisions count: {len(summary_data.key_decisions)}")
            logging.info(f"   - Action items count: {len(summary_data.action_items)}")
            logging.info(f"   - Summary content: '{summary_data.summary[:100]}...'")
            logging.info(f"   - Key decisions: {summary_data.key_decisions}")
            logging.info(f"   - Action items: {[item.description for item in summary_data.action_items]}")
            
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            logging.error(f"Failed to parse summary JSON: {e}")
            logging.error(f"Problematic text: {clean_summary[:500] if 'clean_summary' in locals() else summary_text[:500]}")
            # Fallback to basic structure - put the raw text in summary
            summary_data = SummaryData(
                summary="Error parsing response. Please try again.",
                key_decisions=["Failed to extract key decisions"],
                action_items=[]
            )

        response = SummaryResponse(
            id=summary_id,
            filename=file.filename or "unknown.audio",
            timestamp=timestamp,
            transcript=transcript,
            summary_data=summary_data,
            duration_transcribe_s=duration_transcribe,
            duration_summarize_s=duration_summarize,
        )
        
        # Log the response being sent to frontend
        logging.info(f"📤 Sending response to frontend:")
        logging.info(f"   - ID: {response.id}")
        logging.info(f"   - Filename: {response.filename}")
        logging.info(f"   - Summary data type: {type(response.summary_data)}")
        logging.info(f"   - Summary: '{response.summary_data.summary[:100]}...'")
        logging.info(f"   - Key decisions: {response.summary_data.key_decisions}")
        logging.info(f"   - Action items: {len(response.summary_data.action_items)} items")
        
        # Save to database
        db.save_summary(
            summary_id=summary_id,
            filename=file.filename or "unknown.audio",
            timestamp=timestamp,
            transcript=transcript,
            summary=summary_data.summary,
            key_decisions=summary_data.key_decisions,
            action_items=[item.dict() for item in summary_data.action_items],
            duration_transcribe_s=duration_transcribe,
            duration_summarize_s=duration_summarize
        )
        
        logging.info(f"Saved summary to database: {summary_id}")
        
        return response

    except Exception as e:
        logging.error(f"An error occurred: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/history", response_model=HistoryListResponse)
async def get_history():
    """
    Returns a list of all saved summaries from database.
    """
    summaries = db.get_all_summaries()
    
    items = [
        HistoryItem(
            id=s['id'],
            filename=s['filename'],
            timestamp=s['timestamp'],
            summary_preview=s['summary_preview']
        )
        for s in summaries
    ]
    
    return HistoryListResponse(items=items)

@app.get("/history/{summary_id}", response_model=SummaryResponse)
async def get_history_item(summary_id: str):
    """
    Returns a specific summary by ID from database.
    """
    data = db.get_summary_by_id(summary_id)
    
    if not data:
        raise HTTPException(status_code=404, detail="History item not found")
    
    try:
        # Reconstruct action items
        action_items = [ActionItem(**item) for item in data["action_items"]]
        
        summary_data = SummaryData(
            summary=data["summary"],
            key_decisions=data["key_decisions"],
            action_items=action_items
        )
        
        return SummaryResponse(
            id=data["id"],
            filename=data["filename"],
            timestamp=data["timestamp"],
            transcript=data["transcript"],
            summary_data=summary_data,
            duration_transcribe_s=data["duration_transcribe_s"],
            duration_summarize_s=data["duration_summarize_s"],
        )
    except Exception as e:
        logging.error(f"Error loading history item: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/history/{summary_id}/action-items", response_model=SummaryResponse)
async def update_action_items(summary_id: str, request: UpdateActionItemsRequest):
    """
    Update the action items for a given summary.
    """
    # Ensure summary exists
    existing = db.get_summary_by_id(summary_id)
    if not existing:
        raise HTTPException(status_code=404, detail="History item not found")

    # Persist new action items
    ok = db.update_action_items(
        summary_id,
        [item.dict() for item in request.action_items]
    )
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to update action items")

    # Return the updated item
    updated = db.get_summary_by_id(summary_id)
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to load updated item")

    action_items = [ActionItem(**item) for item in updated["action_items"]]
    summary_data = SummaryData(
        summary=updated["summary"],
        key_decisions=updated["key_decisions"],
        action_items=action_items,
    )
    return SummaryResponse(
        id=updated["id"],
        filename=updated["filename"],
        timestamp=updated["timestamp"],
        transcript=updated["transcript"],
        summary_data=summary_data,
        duration_transcribe_s=updated["duration_transcribe_s"],
        duration_summarize_s=updated["duration_summarize_s"],
    )

@app.delete("/history/{summary_id}")
async def delete_history_item(summary_id: str):
    """
    Deletes a specific history item by ID from database.
    """
    success = db.delete_summary(summary_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="History item not found")
    
    return {"status": "deleted", "id": summary_id}

@app.get("/history/search/{query}")
async def search_history(query: str):
    """
    Search summaries by filename or content.
    """
    summaries = db.search_summaries(query)
    
    items = [
        HistoryItem(
            id=s['id'],
            filename=s['filename'],
            timestamp=s['timestamp'],
            summary_preview=s['summary_preview']
        )
        for s in summaries
    ]
    
    return HistoryListResponse(items=items)

@app.get("/stats")
def get_stats():
    """
    Get statistics about stored summaries.
    """
    count = db.get_summary_count()
    return {
        "total_summaries": count,
        "database_file": str(db.DB_PATH)
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
