import type { AppMode } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  mode: AppMode;
  onToggle: () => void;
}

export default function ModeToggle({ mode, onToggle }: Props) {
  const isAssist = mode === "japanese-assist";

  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
        isAssist
          ? "bg-vox-accent/20 text-vox-accent"
          : "bg-white/10 text-white/70",
      )}
    >
      <div
        className={cn(
          "h-2 w-2 rounded-full transition-colors",
          isAssist ? "bg-vox-accent" : "bg-white/40",
        )}
      />
      {isAssist ? "JP Assist" : "Guide"}
    </button>
  );
}
