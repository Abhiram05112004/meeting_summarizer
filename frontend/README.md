# Meeting Summarizer - React Frontend

A modern React frontend for the Meeting Summarizer application, built with Vite, TypeScript, and Tailwind CSS.

## Features

- 🎨 Modern, responsive UI with Tailwind CSS
- 📤 Drag-and-drop file upload
- ⚡ Fast development with Vite
- 🔒 Type-safe with TypeScript
- 🎯 Clean component architecture

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8000`

## Installation

1. Navigate to the frontend directory:
```powershell
cd "d:\meeting summary generator\frontend"
```

2. Install dependencies:
```powershell
npm install
```

## Running the Application

### Development Mode

Start the development server with hot reload:

```powershell
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

Build for production:

```powershell
npm run build
```

Preview the production build:

```powershell
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx       # File upload component with drag-drop
│   │   ├── LoadingState.tsx     # Loading spinner component
│   │   ├── ResultsDisplay.tsx   # Display transcript and summary
│   │   └── ErrorDisplay.tsx     # Error message component
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles with Tailwind
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Backend Setup

Make sure the backend is running before starting the frontend:

```powershell
cd "d:\meeting summary generator\backend"
uvicorn main:app --reload
```

The frontend expects the backend API at `http://localhost:8000`

## Usage

1. Open the app in your browser at `http://localhost:3000`
2. Drag and drop an audio file or click to browse
3. Click "Summarize Meeting"
4. View the transcript and AI-generated summary
5. Click "Summarize Another Meeting" to process more files

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client (for API calls)

## API Integration

The frontend communicates with the FastAPI backend via:

- **POST** `/summarize-audio/` - Upload audio and get summary

Response format:
```json
{
  "transcript": "string",
  "summary": "string",
  "duration_transcribe_s": 0.0,
  "duration_summarize_s": 0.0
}
```

## Troubleshooting

### Port Already in Use
If port 3000 is in use, Vite will prompt you to use a different port.

### Backend Connection Error
- Ensure the backend is running on `http://localhost:8000`
- Check CORS settings in the backend
- Verify your `.env` file has the required API keys

### Build Errors
- Delete `node_modules` and reinstall: `npm install`
- Clear Vite cache: `npx vite --force`

## Environment Variables

No frontend environment variables are required. The backend URL is configured in `vite.config.ts` as a proxy.
