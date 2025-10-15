# 🎙️ Meeting Summarizer

An AI-powered meeting summarizer that transcribes audio files and generates comprehensive summaries with key decisions and action items.

![Meeting Summarizer](https://img.shields.io/badge/Status-Production%20Ready-green)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Video Demo of Application](#https://drive.google.com/file/d/1j0wyd_l9rneP3_WeAlbFCNICkzAn_rQv/view?usp=sharing)

## ✨ Features

### Core Features
- 🎤 **Audio Transcription**: Uses AssemblyAI for accurate speech-to-text conversion
- 🤖 **AI-Powered Summarization**: Leverages Google Gemini 2.5 Pro for intelligent analysis
- 📊 **Structured Output**: Organizes results into three clear sections:
  - Meeting Summary
  - Key Decisions
  - Action Items with checkboxes

### User Interface
- 🎨 **Professional Design**: Glassmorphism UI with slate/blue/cyan color scheme
- 📱 **Responsive Layout**: Works seamlessly on desktop and mobile devices
- 📂 **History Sidebar**: ChatGPT-style sidebar for easy access to past summaries
- 🔄 **Interactive Action Items**: 
  - Check/uncheck completion status
  - Edit descriptions, owners, and due dates
  - Drag-and-drop to reorder
  - Add new tasks on the fly

### Data Management
- 💾 **SQLite Database**: Persistent storage for all summaries
- 🔍 **Full Transcript Display**: Collapsible view of complete transcription
- 📤 **Export Options**: 
  - Copy to clipboard
  - Export to CSV
  - Export to Word (.doc)
  - Save as PDF (print)

### Advanced Features
- 🛡️ **Safety Filter Handling**: Automatic retry with sanitized prompts
- 🔒 **Error Recovery**: Graceful fallback mechanisms
- 📝 **Comprehensive Logging**: Detailed logs for debugging
- ⚡ **Real-time Updates**: Instant feedback during processing

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │ ───▶ │  FastAPI     │ ───▶ │ AssemblyAI  │
│  (React)    │ ◀─── │   Backend    │      │ Transcribe  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Gemini     │
                     │ Summarizer   │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   SQLite     │
                     │   Database   │
                     └──────────────┘
```

## 📦 Prerequisites

### Backend Requirements
- Python 3.9 or higher
- pip (Python package manager)
- AssemblyAI API key ([Get one here](https://www.assemblyai.com/))
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Frontend Requirements
- Node.js 18 or higher
- npm or yarn

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "meeting summary generator"
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install fastapi uvicorn aiofiles python-dotenv assemblyai google-generativeai
```

#### Create Environment File
Create a `.env` file in the `backend` directory:
```env
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Initialize Database
The database will be automatically created on first run. The file `meeting_history.db` will be created in the backend directory.

### 3. Frontend Setup

#### Install Node Dependencies
```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

**Port**: Default is `8000`. Change in `main.py` if needed.

**CORS Settings**: Currently allows all origins. Update in `main.py` for production:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Upload Directory**: Files are temporarily stored in `backend/uploads/`. Automatically cleaned after processing.

### Gemini Model Settings

In `backend/summarize.py`:
- **Model**: `gemini-2.5-pro`
- **Temperature**: `0.7`
- **Max Output Tokens**: `1024`
- **Response Format**: JSON
- **Safety Filters**: All set to `BLOCK_NONE`

## 🎯 Usage

### Starting the Application

#### 1. Start Backend Server
```bash
cd backend
python -m uvicorn main:app --reload
```
Backend will run on `http://localhost:8000`

#### 2. Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Using the Application

1. **Upload Audio File**:
   - Drag and drop an audio file onto the upload area
   - Or click to browse and select a file
   - Supported formats: Any audio format supported by AssemblyAI

2. **Process**:
   - Click "🚀 Summarize Meeting" button
   - Wait for transcription and summarization (progress shown)

3. **Review Results**:
   - **Transcript**: Expand to view full transcription
   - **Meeting Summary**: Read the AI-generated summary
   - **Key Decisions**: Review important decisions made
   - **Action Items**: Manage tasks with interactive features

4. **Manage Action Items**:
   - ✅ Check boxes to mark complete
   - ✏️ Click edit icon to modify details
   - 🗑️ Click delete icon to remove
   - ➕ Add new tasks with "Add New Task" button
   - 🔄 Drag and drop to reorder

5. **Export**:
   - **Copy**: Copy all content to clipboard
   - **CSV**: Download action items as CSV
   - **Word**: Save as .doc file
   - **PDF**: Print or save as PDF

6. **Access History**:
   - Use sidebar to view past summaries
   - Click any item to reload
   - Delete unwanted items

## 📚 API Documentation

### Endpoints

#### `POST /summarize-audio/`
Upload and process audio file.

**Request**: 
- Content-Type: `multipart/form-data`
- Body: `file` (audio file)

**Response**:
```json
{
  "id": "uuid",
  "filename": "meeting.mp3",
  "timestamp": "2025-10-15T10:30:00",
  "transcript": "Full meeting transcript...",
  "summary_data": {
    "summary": "Meeting summary text...",
    "key_decisions": ["Decision 1", "Decision 2"],
    "action_items": [
      {
        "description": "Task description",
        "owner": "John Doe",
        "due_date": "2025-10-20",
        "completed": false,
        "order": 0
      }
    ]
  },
  "duration_transcribe_s": 5.2,
  "duration_summarize_s": 3.8
}
```

#### `GET /history`
Get all summaries.

**Response**:
```json
{
  "items": [
    {
      "id": "uuid",
      "filename": "meeting.mp3",
      "timestamp": "2025-10-15T10:30:00",
      "summary_preview": "First 100 chars..."
    }
  ]
}
```

#### `GET /history/{summary_id}`
Get specific summary by ID.

#### `PATCH /history/{summary_id}/action-items`
Update action items for a summary.

**Request**:
```json
{
  "action_items": [
    {
      "description": "Updated task",
      "owner": "Jane",
      "due_date": "2025-10-25",
      "completed": true,
      "order": 0
    }
  ]
}
```

#### `DELETE /history/{summary_id}`
Delete a summary.

#### `GET /health`
Health check endpoint.

#### `GET /stats`
Get summary statistics.

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Uvicorn**: ASGI server
- **AssemblyAI SDK**: Speech-to-text API
- **Google Generative AI (Gemini)**: LLM for summarization
- **SQLite**: Database
- **Pydantic**: Data validation
- **aiofiles**: Async file operations
- **python-dotenv**: Environment variable management

### Frontend
- **React 18**: UI library
- **TypeScript 5**: Type safety
- **Vite 5**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **HTML5 Drag-and-Drop API**: File upload

### AI/ML Services
- **AssemblyAI**: Audio transcription
- **Google Gemini 2.5 Pro**: Summary generation

## 📁 Project Structure

```
meeting summary generator/
├── backend/
│   ├── main.py                 # FastAPI application & API endpoints
│   ├── summarize.py            # Gemini integration
│   ├── transcribe.py           # AssemblyAI integration
│   ├── database.py             # SQLite operations
│   ├── test_json_parsing.py   # Test script
│   ├── migrate_to_db.py        # Database migration script
│   ├── .env                    # API keys (not in repo)
│   ├── meeting_history.db      # SQLite database (auto-created)
│   └── uploads/                # Temporary file storage
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main application component
│   │   ├── main.tsx            # Entry point
│   │   ├── index.css           # Global styles
│   │   └── components/
│   │       ├── MainPanel.tsx        # Content container
│   │       ├── Navbar.tsx           # Top navigation (removed)
│   │       ├── FileUpload.tsx       # Upload interface
│   │       ├── LoadingState.tsx     # Loading indicator
│   │       ├── ResultsDisplay.tsx   # Summary display
│   │       └── ErrorDisplay.tsx     # Error messages
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── DATA_FLOW_VERIFICATION.md   # Technical documentation
├── DATABASE_MIGRATION.md        # Migration guide
├── DATABASE_QUICK_START.md      # Database setup
├── HISTORY_FEATURE.md           # History feature docs
├── START_SERVERS.md             # Server startup guide
└── README.md                    # This file
```

## 🐛 Troubleshooting

### Backend Issues

#### "API key not found"
- Ensure `.env` file exists in `backend/` directory
- Check that `ASSEMBLYAI_API_KEY` and `GEMINI_API_KEY` are set
- Verify no extra spaces or quotes around keys

#### "Content generation blocked" (finish_reason=2)
- This is a Gemini safety filter issue
- The system automatically retries with a safer prompt
- If it persists, check your audio content
- May need to use a different audio file

#### Database Errors
- Delete `meeting_history.db` and restart (will recreate)
- Check file permissions
- Ensure SQLite is installed

#### Port Already in Use
```bash
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

### Frontend Issues

#### "Failed to fetch"
- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in `main.py`
- Verify no firewall blocking

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Check for type issues
npm run type-check
```

### Common Issues

#### Empty Key Decisions or Action Items
- Check backend logs for JSON parsing errors
- Verify Gemini API key is valid
- The prompt now requires at least 2-3 decisions

#### Audio File Not Processing
- Check file format is supported
- Verify file size is reasonable (< 100MB recommended)
- Check backend logs for transcription errors

## 📝 Development

### Running Tests
```bash
cd backend
python test_json_parsing.py
```

### Debugging

**Backend Logs**: Check terminal running uvicorn for detailed logs including:
- Raw Gemini response
- JSON parsing steps
- Extracted data
- API responses

**Frontend Logs**: Open browser console (F12) to see:
- API responses
- Component render data
- Error messages

### Code Quality

**Backend**:
```bash
# Format code
black backend/

# Type checking
mypy backend/
```

**Frontend**:
```bash
# Lint
npm run lint

# Format
npm run format
```

## 🚀 Production Deployment

### Backend
1. Set `reload=False` in uvicorn
2. Use production ASGI server (e.g., gunicorn)
3. Set specific CORS origins
4. Use environment variables for sensitive data
5. Set up proper logging
6. Configure backup for SQLite database

### Frontend
1. Build production bundle: `npm run build`
2. Serve `dist/` folder with static file server
3. Configure proper API base URL
4. Enable HTTPS
5. Set up CDN if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- **AssemblyAI** for transcription services
- **Google Gemini** for AI summarization
- **React** and **FastAPI** communities

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Made with ❤️ using React, FastAPI, and AI**
