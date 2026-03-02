import { useState } from "react";
import type { Memory } from "@/types";
import { X, Download } from "lucide-react";

interface Props {
  memory: Memory;
  onDelete: (id: string) => void;
}

export default function MemoryCard({ memory, onDelete }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const time = new Date(memory.savedAt).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const onSavePhoto = () => {
    const link = document.createElement("a");
    link.href = memory.photo.dataUrl;
    link.download = `vox-memory-${Date.now()}.jpg`;
    link.click();
  };

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-xl bg-vox-surface cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
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
          onClick={(e) => {
            e.stopPropagation();
            onDelete(memory.id);
          }}
          className="absolute right-2 top-2 hidden rounded-full bg-black/50 px-2 py-1 text-[10px] text-white/70 group-hover:block active:block"
        >
          削除
        </button>
      </div>

      {/* Expanded modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsExpanded(false)}
        >
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2"
          >
            <X size={24} className="text-white" />
          </button>

          <div className="max-h-[80vh] max-w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={memory.photo.dataUrl}
              alt="Memory"
              className="max-h-[70vh] max-w-full rounded-lg object-contain"
            />
            <div className="mt-4 flex justify-center">
              <button
                onClick={onSavePhoto}
                className="flex items-center gap-2 rounded-full bg-vox-primary px-6 py-3 text-sm font-medium text-white"
              >
                <Download size={18} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
