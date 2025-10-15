interface ErrorDisplayProps {
  message: string;
}

function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="mt-6 backdrop-blur-md bg-red-500/20 border-2 border-red-400/30 rounded-xl p-5">
      <div className="flex items-start">
        <span className="text-2xl mr-3">⚠️</span>
        <div>
          <h3 className="font-bold text-red-300 mb-1">Error</h3>
          <p className="text-red-200">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default ErrorDisplay;
