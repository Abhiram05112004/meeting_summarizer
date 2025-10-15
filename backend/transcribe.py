



import os
from pathlib import Path
import assemblyai as aai
from dotenv import load_dotenv
load_dotenv()
def transcribe_with_assemblyai(audio_path: str | os.PathLike) -> str:
    api_key = os.getenv("ASSEMBLYAI_API_KEY")
    if not api_key:
        raise RuntimeError("Set ASSEMBLYAI_API_KEY in your environment first.")
    aai.settings.api_key = api_key

    audio_path = Path(audio_path)
    if not audio_path.exists():
        raise FileNotFoundError(f"Audio not found: {audio_path}")

    # Minimal config; AssemblyAI can handle most common formats (.mp3, .wav, .m4a, etc.)
    config = aai.TranscriptionConfig()
    transcriber = aai.Transcriber(config=config)
    transcript = transcriber.transcribe(str(audio_path))

    if getattr(transcript, "status", None) == "error":
        raise RuntimeError(f"Transcription failed: {transcript.error}")

    return (transcript.text or "").strip()
