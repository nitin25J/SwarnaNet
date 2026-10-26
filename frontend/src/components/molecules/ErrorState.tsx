import { Button } from "@/components/atoms/Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-8 text-center"
    >
      <p className="font-medium text-rose-900">Unable to load dashboard</p>
      <p className="mt-1 max-w-md text-sm text-rose-700">{message}</p>
      {onRetry ? (
        <Button className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
