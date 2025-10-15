# Quick Start Guide

## Initial Setup (First Time Only)

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd "meeting summary generator"
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pip install fastapi uvicorn aiofiles python-dotenv assemblyai google-generativeai

# Create environment file
cp .env.example .env

# Edit .env and add your API keys:
# - Get AssemblyAI key: https://www.assemblyai.com/
# - Get Gemini key: https://ai.google.dev/
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

## Running the Application

### Terminal 1 - Backend
```bash
cd backend
python -m uvicorn main:app --reload
```
Backend runs on: http://localhost:8000

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

## First Use

1. Open http://localhost:5173 in your browser
2. Drag and drop an audio file or click to upload
3. Click "🚀 Summarize Meeting"
4. View your results:
   - Full transcript (expandable)
   - Meeting summary
   - Key decisions
   - Action items with checkboxes

## Need Help?

- Full documentation: See main [README.md](README.md)
- Troubleshooting: Check [README.md#troubleshooting](README.md#troubleshooting)
- Data flow: See [DATA_FLOW_VERIFICATION.md](DATA_FLOW_VERIFICATION.md)

## API Keys Required

⚠️ **Important**: You need two API keys to run this project:

1. **AssemblyAI** (for transcription): https://www.assemblyai.com/
2. **Google Gemini** (for summarization): https://ai.google.dev/

Add them to `backend/.env` file (see `.env.example` for template)
