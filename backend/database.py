"""
Database module for Meeting Summarizer history feature.
Uses SQLite for lightweight, file-based storage.
"""

import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
from contextlib import contextmanager

# Database file location
DB_PATH = Path("meeting_history.db")


@contextmanager
def get_db_connection():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Enable column access by name
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_database():
    """Initialize the database with required tables."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Create summaries table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS summaries (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                transcript TEXT NOT NULL,
                summary TEXT NOT NULL,
                key_decisions TEXT NOT NULL,
                action_items TEXT NOT NULL,
                duration_transcribe_s REAL NOT NULL,
                duration_summarize_s REAL NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        
        # Create index on timestamp for faster sorting
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_timestamp 
            ON summaries(timestamp DESC)
        """)
        
        conn.commit()
        print(f"✅ Database initialized at {DB_PATH}")


def save_summary(
    summary_id: str,
    filename: str,
    timestamp: str,
    transcript: str,
    summary: str,
    key_decisions: List[str],
    action_items: List[Dict[str, Any]],
    duration_transcribe_s: float,
    duration_summarize_s: float
) -> bool:
    """
    Save a summary to the database.
    
    Returns True if successful, False otherwise.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            now = datetime.now().isoformat()
            
            cursor.execute("""
                INSERT INTO summaries (
                    id, filename, timestamp, transcript, summary,
                    key_decisions, action_items, duration_transcribe_s,
                    duration_summarize_s, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                summary_id,
                filename,
                timestamp,
                transcript,
                summary,
                json.dumps(key_decisions),
                json.dumps(action_items),
                duration_transcribe_s,
                duration_summarize_s,
                now,
                now
            ))
            
            return True
    except Exception as e:
        print(f"❌ Error saving summary to database: {e}")
        return False


def get_all_summaries() -> List[Dict[str, Any]]:
    """
    Get all summaries from the database, sorted by timestamp (newest first).
    
    Returns list of summary metadata (without full transcript/summary for performance).
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                id, filename, timestamp, 
                substr(summary, 1, 100) as summary_preview
            FROM summaries
            ORDER BY timestamp DESC
        """)
        
        rows = cursor.fetchall()
        
        summaries = []
        for row in rows:
            summary_preview = row['summary_preview']
            if len(row['summary_preview']) >= 100:
                summary_preview += "..."
            
            summaries.append({
                'id': row['id'],
                'filename': row['filename'],
                'timestamp': row['timestamp'],
                'summary_preview': summary_preview
            })
        
        return summaries


def get_summary_by_id(summary_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a specific summary by ID.
    
    Returns full summary data or None if not found.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM summaries WHERE id = ?
        """, (summary_id,))
        
        row = cursor.fetchone()
        
        if not row:
            return None
        
        return {
            'id': row['id'],
            'filename': row['filename'],
            'timestamp': row['timestamp'],
            'transcript': row['transcript'],
            'summary': row['summary'],
            'key_decisions': json.loads(row['key_decisions']),
            'action_items': json.loads(row['action_items']),
            'duration_transcribe_s': row['duration_transcribe_s'],
            'duration_summarize_s': row['duration_summarize_s']
        }


def delete_summary(summary_id: str) -> bool:
    """
    Delete a summary by ID.
    
    Returns True if deleted, False if not found or error.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM summaries WHERE id = ?", (summary_id,))
            
            if cursor.rowcount > 0:
                print(f"✅ Deleted summary: {summary_id}")
                return True
            else:
                print(f"⚠️ Summary not found: {summary_id}")
                return False
    except Exception as e:
        print(f"❌ Error deleting summary: {e}")
        return False


def get_summary_count() -> int:
    """Get total count of summaries in database."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM summaries")
        row = cursor.fetchone()
        return row['count']


def search_summaries(query: str) -> List[Dict[str, Any]]:
    """
    Search summaries by filename or content.
    
    Returns list of matching summaries.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        search_pattern = f"%{query}%"
        
        cursor.execute("""
            SELECT 
                id, filename, timestamp,
                substr(summary, 1, 100) as summary_preview
            FROM summaries
            WHERE 
                filename LIKE ? OR
                transcript LIKE ? OR
                summary LIKE ?
            ORDER BY timestamp DESC
        """, (search_pattern, search_pattern, search_pattern))
        
        rows = cursor.fetchall()
        
        summaries = []
        for row in rows:
            summary_preview = row['summary_preview']
            if len(row['summary_preview']) >= 100:
                summary_preview += "..."
            
            summaries.append({
                'id': row['id'],
                'filename': row['filename'],
                'timestamp': row['timestamp'],
                'summary_preview': summary_preview
            })
        
        return summaries


def update_action_items(summary_id: str, action_items: List[Dict[str, Any]]) -> bool:
    """
    Update only the action_items field for a given summary.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            now = datetime.now().isoformat()
            cursor.execute(
                """
                UPDATE summaries
                SET action_items = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    json.dumps(action_items),
                    now,
                    summary_id,
                ),
            )
            return cursor.rowcount > 0
    except Exception as e:
        print(f"❌ Error updating action items: {e}")
        return False


# Initialize database on module import
init_database()
