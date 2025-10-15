import { useState, useEffect } from 'react';
import MainPanel from './components/MainPanel';

export interface ActionItem {
  description: string;
  owner: string | null;
  due_date: string | null;
  completed?: boolean;
  order?: number | null;
}

export interface SummaryData {
  summary: string;
  key_decisions: string[];
  action_items: ActionItem[];
}

export interface SummaryResponse {
  id: string;
  filename: string;
  timestamp: string;
  transcript: string;
  summary_data: SummaryData;
  duration_transcribe_s: number;
  duration_summarize_s: number;
}

export interface HistoryItem {
  id: string;
  filename: string;
  timestamp: string;
  summary_preview: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [result, setResult] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  // Load history on mount
  const loadHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/history');
      const data = await response.json();
      setHistory(data.items);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  // Load history when component mounts
  useEffect(() => {
    loadHistory();
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
  };

  const handleSummarize = async () => {
    if (!file) {
      setError('No file selected');
      return;
    }

    setLoading(true);
    setLoadingStatus('Uploading and transcribing audio...');
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/summarize-audio/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
      }

      setLoadingStatus('Generating summary...');
      const data: SummaryResponse = await response.json();
      
      // Debug: Log the received data
      console.log('Received summary response:', data);
      console.log('Summary data:', data.summary_data);
      console.log('Summary text:', data.summary_data?.summary);
      console.log('Key decisions:', data.summary_data?.key_decisions);
      console.log('Action items:', data.summary_data?.action_items);
      
      setResult(data);
      
      // Reload history to include the new item
      await loadHistory();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const handleHistoryClick = async (historyId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/history/${historyId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load history item');
      }
      
      const data: SummaryResponse = await response.json();
      setResult(data);
      setFile(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load history';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (historyId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the history click
    
    if (!confirm('Are you sure you want to delete this history item?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/history/${historyId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete history item');
      }
      
      // Reload history
      await loadHistory();
      
      // Clear result if it was the deleted item
      if (result?.id === historyId) {
        setResult(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete history';
      setError(errorMessage);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-slate-800/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-cyan-900/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="flex flex-1 relative z-10">
      {/* History Sidebar */}
      <div
        className={`${
          showHistory ? 'w-72' : 'w-0'
        } transition-all duration-300 backdrop-blur-xl bg-slate-900/40 border-r border-slate-700/30 shadow-2xl overflow-y-auto flex flex-col sticky top-0 h-screen`}
      >
        <div className="p-3 border-b border-slate-700/30 flex items-center justify-between backdrop-blur-sm">
          <h2 className="text-base font-bold text-slate-200">📂 History</h2>
          <button
            onClick={() => setShowHistory(false)}
            className="text-slate-400 hover:text-slate-200 transition-colors text-sm"
          >
            ✕
          </button>
        </div>
        
        {/* New Button */}
        <div className="p-2.5 border-b border-slate-700/30">
          <button
            onClick={handleReset}
            className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg hover:shadow-blue-900/50 backdrop-blur-sm"
          >
            <span className="text-base">➕</span>
            <span>New Summary</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-4 text-center text-slate-400">
              <p className="text-sm">No history yet</p>
              <p className="text-xs mt-1">Upload an audio file to get started</p>
            </div>
          ) : (
            <div className="space-y-1.5 p-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleHistoryClick(item.id)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all duration-150 group backdrop-blur-md ${
                    result?.id === item.id 
                      ? 'bg-slate-700/40 border border-slate-600/40 shadow-lg' 
                      : 'bg-slate-800/30 hover:bg-slate-700/30 border border-slate-700/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[15px] text-slate-200 truncate">
                        {item.filename}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatDate(item.timestamp)}
                      </p>
                      <p className="text-[11px] text-slate-300 mt-1.5 line-clamp-2 leading-snug">
                        {item.summary_preview}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteHistory(item.id, e)}
                      className="ml-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity text-sm"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
  <div className="flex-1 flex justify-center">
        {!showHistory && (
          <button
            onClick={() => setShowHistory(true)}
            className="fixed left-4 top-4 backdrop-blur-md bg-slate-800/50 border border-slate-700/50 p-2.5 rounded-full shadow-2xl hover:shadow-blue-900/50 transition-all duration-200 z-10 text-slate-200 text-sm"
            title="Show history"
          >
            📂
          </button>
        )}
        
        <div className="w-full max-w-6xl">
          <MainPanel
            file={file}
            loading={loading}
            loadingStatus={loadingStatus}
            result={result}
            error={error}
            onFileSelect={handleFileSelect}
            onSummarize={handleSummarize}
            onReset={handleReset}
            onResultUpdate={(updated) => setResult(updated)}
          />
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;
