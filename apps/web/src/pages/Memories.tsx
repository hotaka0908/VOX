import { useAppStore } from "@/stores/app-store";
import DayGroup from "@/components/DayGroup";
import { ImageIcon } from "lucide-react";

export default function Memories() {
  const memories = useAppStore((s) => s.memories);
  const deleteMemory = useAppStore((s) => s.deleteMemory);
  const getMemoriesByDay = useAppStore((s) => s.getMemoriesByDay);

  const grouped = getMemoriesByDay();
  const days = Object.keys(grouped).sort((a, b) => {
    // Sort newest first by comparing the first memory's savedAt in each group
    const aTime = grouped[a][0]?.savedAt ?? 0;
    const bTime = grouped[b][0]?.savedAt ?? 0;
    return bTime - aTime;
  });

  if (memories.length === 0) {
    return (
      <div className="flex h-[80dvh] flex-col items-center justify-center gap-4 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <ImageIcon size={28} className="text-white/30" />
        </div>
        <p className="text-center text-sm text-white/40">
          No memories yet.
          <br />
          Take a photo to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-vox-bg px-4 pb-24 pt-6">
      <h1 className="mb-6 text-xl font-semibold text-white">My Memories</h1>
      {days.map((day) => (
        <DayGroup
          key={day}
          date={day}
          memories={grouped[day]}
          onDelete={deleteMemory}
        />
      ))}
    </div>
  );
}
