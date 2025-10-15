"""
Migration script to convert JSON history files to SQLite database.
Run this once if you have existing JSON files in the history/ folder.
"""

import json
from pathlib import Path
import database as db

HISTORY_DIR = Path("history")

def migrate():
    """Migrate JSON files to database."""
    if not HISTORY_DIR.exists():
        print("ℹ️  No history directory found, nothing to migrate")
        print("✨ Database is ready for new summaries!")
        return
    
    json_files = list(HISTORY_DIR.glob("*.json"))
    
    if not json_files:
        print("ℹ️  No JSON files found in history directory")
        print("✨ Database is ready for new summaries!")
        return
    
    print(f"📂 Found {len(json_files)} JSON files to migrate\n")
    
    success_count = 0
    error_count = 0
    
    for json_file in json_files:
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            # Save to database
            saved = db.save_summary(
                summary_id=data["id"],
                filename=data["filename"],
                timestamp=data["timestamp"],
                transcript=data.get("transcript", ""),
                summary=data["summary_data"]["summary"],
                key_decisions=data["summary_data"]["key_decisions"],
                action_items=data["summary_data"]["action_items"],
                duration_transcribe_s=data["duration_transcribe_s"],
                duration_summarize_s=data["duration_summarize_s"]
            )
            
            if saved:
                success_count += 1
                print(f"✅ Migrated: {data['filename']}")
            else:
                error_count += 1
                print(f"❌ Failed to migrate: {data['filename']}")
                
        except Exception as e:
            error_count += 1
            print(f"❌ Error migrating {json_file.name}: {e}")
    
    print(f"\n{'='*60}")
    print(f"🎉 Migration complete!")
    print(f"✅ Successfully migrated: {success_count} summaries")
    if error_count > 0:
        print(f"❌ Errors: {error_count}")
    print(f"{'='*60}\n")
    
    # Ask if user wants to delete JSON files
    response = input("Do you want to delete the JSON files? (yes/no): ").strip().lower()
    if response in ['yes', 'y']:
        for json_file in json_files:
            try:
                json_file.unlink()
                print(f"🗑️  Deleted: {json_file.name}")
            except Exception as e:
                print(f"⚠️  Could not delete {json_file.name}: {e}")
        
        # Try to remove directory if empty
        try:
            if not list(HISTORY_DIR.glob("*.json")):
                HISTORY_DIR.rmdir()
                print(f"🗑️  Removed empty history directory")
        except:
            pass
        
        print("\n✨ Cleanup complete!")
    else:
        print("\n📁 JSON files preserved in history/ directory")
        print("   You can manually delete them when ready.")

if __name__ == "__main__":
    print("="*60)
    print("🗄️  Meeting Summarizer - Database Migration Tool")
    print("="*60)
    print()
    print("This script will migrate your history from JSON files")
    print("to the new SQLite database.")
    print()
    
    migrate()
    
    # Show database stats
    count = db.get_summary_count()
    print(f"\n📊 Database now contains {count} summaries")
    print(f"💾 Location: {db.DB_PATH.absolute()}")
