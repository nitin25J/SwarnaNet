interface ChartHeaderProps {
  title: string;
  description?: string;
}

export function ChartHeader({ title, description }: ChartHeaderProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}
