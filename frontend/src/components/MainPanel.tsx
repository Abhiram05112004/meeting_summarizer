import FileUpload from './FileUpload';
import LoadingState from './LoadingState';
import ResultsDisplay from './ResultsDisplay';
import ErrorDisplay from './ErrorDisplay';
import { SummaryResponse } from '../App';

interface MainPanelProps {
  file: File | null;
  loading: boolean;
  loadingStatus: string;
  result: SummaryResponse | null;
  error: string | null;
  onFileSelect: (file: File) => void;
  onSummarize: () => Promise<void> | void;
  onReset: () => void;
  onResultUpdate: (updated: SummaryResponse) => void;
}

function MainPanel({
  file,
  loading,
  loadingStatus,
  result,
  error,
  onFileSelect,
  onSummarize,
  onReset,
  onResultUpdate,
}: MainPanelProps) {
  return (
    <div className="w-full max-w-9xl">
      <div className="w-full backdrop-blur-xl bg-slate-800/20 border border-slate-700/30 rounded-2xl shadow-2xl px-9">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-cyan-400 to-slate-300 bg-clip-text text-transparent mb-3">
          🎙️ Meeting Summarizer
        </h1>
        <p className="text-center text-slate-400 text-sm mb">Upload your meeting audio and get AI-powered insights</p>

        {!loading && !result && (
          <FileUpload file={file} onFileSelect={onFileSelect} onSummarize={onSummarize} />
        )}

        {loading && <LoadingState status={loadingStatus} />}

        {result && !loading && (
          <ResultsDisplay result={result} onReset={onReset} onResultUpdate={onResultUpdate} />
        )}

        {error && <ErrorDisplay message={error} />}
      </div>
    </div>
  );
}

export default MainPanel;
