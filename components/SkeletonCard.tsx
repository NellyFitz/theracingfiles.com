export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
      <div className="h-48 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 skeleton rounded w-1/3" />
        <div className="h-4 skeleton rounded w-2/3" />
        <div className="h-3 skeleton rounded w-full" />
        <div className="h-px bg-[#1e1e1e]" />
        <div className="flex gap-4">
          <div className="h-4 skeleton rounded w-16" />
          <div className="h-4 skeleton rounded w-16" />
        </div>
      </div>
    </div>
  );
}
