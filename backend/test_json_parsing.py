"""
Test script to verify JSON parsing and data extraction
"""
import json
from main import ActionItem, SummaryData

# Simulate a Gemini response
test_json = '''
{
  "summary": "This is a test meeting summary discussing project timelines and budget allocation.",
  "key_decisions": [
    "Approved Q4 budget of $50,000",
    "Decided to hire 2 new developers",
    "Set project deadline for December 15th"
  ],
  "action_items": [
    {
      "description": "Prepare budget report",
      "owner": "John Doe",
      "due_date": "2025-10-20"
    },
    {
      "description": "Post job listings",
      "owner": "HR Team",
      "due_date": "2025-10-18"
    },
    {
      "description": "Update project timeline",
      "owner": null,
      "due_date": null
    }
  ]
}
'''

print("=" * 60)
print("Testing JSON Parsing Flow")
print("=" * 60)

# Step 1: Parse JSON
print("\n1. Parsing JSON...")
summary_json = json.loads(test_json.strip())
print(f"   ✅ JSON parsed successfully")
print(f"   Keys: {summary_json.keys()}")

# Step 2: Extract fields
print("\n2. Extracting fields...")
summary_text_content = summary_json.get("summary", "")
key_decisions_list = summary_json.get("key_decisions", [])
action_items_list = summary_json.get("action_items", [])

print(f"   Summary: '{summary_text_content[:50]}...'")
print(f"   Key Decisions ({len(key_decisions_list)} items): {key_decisions_list}")
print(f"   Action Items ({len(action_items_list)} items)")

# Step 3: Convert to Pydantic models
print("\n3. Converting to Pydantic models...")
action_items = []
for item in action_items_list:
    if isinstance(item, dict):
        action_items.append(ActionItem(**item))
        print(f"   ✅ Created ActionItem: {item['description']}")

summary_data = SummaryData(
    summary=summary_text_content,
    key_decisions=key_decisions_list,
    action_items=action_items
)

print(f"\n4. Final SummaryData:")
print(f"   - Summary length: {len(summary_data.summary)} chars")
print(f"   - Key decisions: {len(summary_data.key_decisions)} items")
print(f"   - Action items: {len(summary_data.action_items)} items")

# Step 4: Verify data integrity
print("\n5. Verifying data integrity...")
assert summary_data.summary == summary_text_content, "Summary mismatch!"
assert summary_data.key_decisions == key_decisions_list, "Key decisions mismatch!"
assert len(summary_data.action_items) == len(action_items_list), "Action items count mismatch!"

print("   ✅ All data extracted correctly!")

# Step 5: Convert to dict (simulate JSON response)
print("\n6. Converting to dict (like FastAPI does)...")
response_dict = summary_data.dict()
print(f"   Response dict keys: {response_dict.keys()}")
print(f"   Summary: '{response_dict['summary'][:50]}...'")
print(f"   Key Decisions: {response_dict['key_decisions']}")
print(f"   Action Items: {len(response_dict['action_items'])} items")

print("\n" + "=" * 60)
print("✅ ALL TESTS PASSED - Data extraction working correctly!")
print("=" * 60)
