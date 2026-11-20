interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

/** One dashboard statistic card. Shared by both role overviews. */
export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold text-stone-900">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}
