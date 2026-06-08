export default function Loading() {
  return (
    <div className="bg-[var(--t-bg)] min-h-screen pt-[120px] px-5 sm:px-10 lg:px-20">
      <div className="max-w-[1760px] mx-auto">
        <div className="skeleton h-8 w-56 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--t-border)] overflow-hidden">
              <div className="skeleton aspect-[4/3] rounded-none" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
