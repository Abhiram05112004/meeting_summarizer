interface LoadingStateProps {
  status: string;
}

function LoadingState({ status }: LoadingStateProps) {
  return (
    <div className="text-center py-16">
      <div className="inline-block">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto mb-6 shadow-lg shadow-cyan-900/50"></div>
      </div>
      <p className="text-slate-200 font-semibold text-lg">{status}</p>
      <p className="text-slate-400 text-sm mt-2">This may take a few moments...</p>
    </div>
  );
}

export default LoadingState;
