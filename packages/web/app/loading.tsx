export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1326]/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <div className="mono-text text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
          Loading registry...
        </div>
      </div>
    </div>
  );
}
