import { useRef, useState, DragEvent, ChangeEvent } from 'react';

interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onSummarize: () => void;
}

function FileUpload({ file, onFileSelect, onSummarize }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      onFileSelect(droppedFiles[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      onFileSelect(selectedFiles[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="text-center">
      <div
        className={`border-2 border-dashed rounded-xl p-20 cursor-pointer transition-all duration-200 backdrop-blur-sm ${
          isDragging
            ? 'border-blue-500 bg-blue-900/15 shadow-lg shadow-blue-900/30'
            : 'border-slate-600/40 hover:border-blue-500/60 hover:bg-slate-800/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="audio/*"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">🎤</div>
          <p className="text-slate-200 text-lg mb-2">
            Drag & drop your audio file here
          </p>
          <p className="text-slate-400 text-sm">or click to browse</p>
        </div>
      </div>

      {file && (
        <div className="mt-4 backdrop-blur-md bg-slate-800/30 border border-slate-700/30 rounded-lg p-3">
          <p className="text-slate-400 text-xs font-medium mb-1">Selected file:</p>
          <p className="text-cyan-400 font-semibold text-sm">{file.name}</p>
          <p className="text-slate-400 text-xs mt-1">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      <button
        onClick={onSummarize}
        disabled={!file}
        className={`mt-6 w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-200 shadow-lg ${
          file
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:shadow-blue-900/40 transform hover:-translate-y-0.5'
            : 'bg-slate-700/30 cursor-not-allowed opacity-40'
        }`}
      >
        🚀 Summarize Meeting
      </button>
    </div>
  );
}

export default FileUpload;
