export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="正在加载">
      <div className="h-8 w-28 animate-pulse rounded-lg bg-card" />
      <div className="h-40 animate-pulse rounded-3xl bg-card" />
      <div className="h-16 animate-pulse rounded-2xl bg-card" />
      <div className="h-16 animate-pulse rounded-2xl bg-card" />
    </div>
  );
}
