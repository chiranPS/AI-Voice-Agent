interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator = ({
  message = "Thinking...",
}: LoadingIndicatorProps) => {
  return (
    <div
      className="flex items-center gap-3 py-3"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600" />
      </div>

      <span className="text-sm text-slate-500">
        {message}
      </span>
    </div>
  );
};

export default LoadingIndicator;