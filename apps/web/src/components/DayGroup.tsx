import type { Memory } from "@/types";
import MemoryCard from "./MemoryCard";

interface Props {
  date: string;
  memories: Memory[];
  onDelete: (id: string) => void;
}

export default function DayGroup({ date, memories, onDelete }: Props) {
  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-medium text-white/50">{date}</h2>
      <div className="grid grid-cols-2 gap-3">
        {memories.map((m) => (
          <MemoryCard key={m.id} memory={m} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
