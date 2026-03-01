import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppMode,
  AiSpeechState,
  CapturedPhoto,
  Memory,
  VisionResult,
} from "@/types";

interface AppState {
  // Session state (transient)
  currentPhoto: CapturedPhoto | null;
  currentVisionResult: VisionResult | null;
  mode: AppMode;
  aiSpeechState: AiSpeechState;
  aiConnected: boolean;

  // Persisted
  memories: Memory[];

  // Actions
  setCurrentPhoto: (photo: CapturedPhoto | null) => void;
  setCurrentVisionResult: (result: VisionResult | null) => void;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
  setAiSpeechState: (state: AiSpeechState) => void;
  setAiConnected: (connected: boolean) => void;
  saveMemory: (photo: CapturedPhoto, visionResult?: VisionResult) => void;
  deleteMemory: (id: string) => void;
  getMemoriesByDay: () => Record<string, Memory[]>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPhoto: null,
      currentVisionResult: null,
      mode: "guide",
      aiSpeechState: "idle",
      aiConnected: false,
      memories: [],

      setCurrentPhoto: (photo) => set({ currentPhoto: photo }),
      setCurrentVisionResult: (result) => set({ currentVisionResult: result }),
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set((s) => ({
          mode: s.mode === "guide" ? "japanese-assist" : "guide",
        })),
      setAiSpeechState: (state) => set({ aiSpeechState: state }),
      setAiConnected: (connected) => set({ aiConnected: connected }),

      saveMemory: (photo, visionResult) =>
        set((s) => ({
          memories: [
            ...s.memories,
            {
              id: crypto.randomUUID(),
              photo,
              visionResult,
              savedAt: Date.now(),
            },
          ],
        })),

      deleteMemory: (id) =>
        set((s) => ({
          memories: s.memories.filter((m) => m.id !== id),
        })),

      getMemoriesByDay: () => {
        const memories = get().memories;
        const grouped: Record<string, Memory[]> = {};
        for (const m of memories) {
          const day = new Date(m.savedAt).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          (grouped[day] ??= []).push(m);
        }
        return grouped;
      },
    }),
    {
      name: "vox-storage",
      partialize: (state) => ({ memories: state.memories }),
    },
  ),
);
