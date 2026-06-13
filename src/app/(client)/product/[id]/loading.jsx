export default function Loading() {
  return (
    <div className="container-x py-6 animate-pulse">
      <div className="h-4 w-48 rounded bg-muted mb-4" />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_320px]">
        <div className="aspect-square rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-20 rounded-xl bg-muted" />
          <div className="h-10 rounded-lg bg-muted" />
          <div className="flex gap-2">
            <div className="h-12 flex-1 rounded-lg bg-muted" />
            <div className="h-12 flex-1 rounded-lg bg-muted" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-xl bg-muted" />
          <div className="h-40 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
