export default function Loading() {
  return (
    <div className="container-x py-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-muted mb-6" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-4 rounded-xl border border-border p-4">
              <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-lg bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-5 w-1/4 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-64 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
