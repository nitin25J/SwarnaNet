interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center"
    >
      <p className="font-medium text-slate-800">{title}</p>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}
