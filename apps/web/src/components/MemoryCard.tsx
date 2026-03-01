import type { Memory } from "@/types";

interface Props {
  memory: Memory;
  onDelete: (id: string) => void;
}

export default function MemoryCard({ memory, onDelete }: Props) {
  const time = new Date(memory.savedAt).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="group relative overflow-hidden rounded-xl bg-vox-surface">
      <img
        src={memory.photo.dataUrl}
        alt="Memory"
        className="aspect-square w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
        <p className="text-xs font-medium text-white/90">{time}</p>
        {memory.visionResult && (
          <p className="mt-0.5 line-clamp-2 text-[11px] text-white/60">
            {memory.visionResult.landmarks[0] || memory.visionResult.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDelete(memory.id)}
        className="absolute right-2 top-2 hidden rounded-full bg-black/50 px-2 py-1 text-[10px] text-white/70 group-hover:block active:block"
      >
        Delete
      </button>
    </div>
  );
}
