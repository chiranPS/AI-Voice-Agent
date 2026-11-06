import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = ({
  message,
  onRetry,
}: ErrorMessageProps) => {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
      role="alert"
    >
      <AlertCircle
        className="mt-0.5 shrink-0 text-red-600"
        size={20}
      />

      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">
          {message}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm font-semibold text-red-700 underline hover:text-red-900"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;