export default function Loading() {
  return (
    <div className="container-x py-6 animate-pulse">
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block h-96 rounded-xl bg-muted" />
        <div>
          <div className="mb-4 h-12 rounded-xl bg-muted" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-xl border border-border overflow-hidden">
                <div className="aspect-square bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-3 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
