interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading sales data" }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}…</span>
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
      <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}
