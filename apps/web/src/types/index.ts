export type AppMode = "guide" | "japanese-assist";

export type AiSpeechState = "idle" | "listening" | "thinking" | "speaking";

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export interface VisionResult {
  description: string;
  landmarks: string[];
  suggestedTopics: string[];
}

export interface Memory {
  id: string;
  photo: CapturedPhoto;
  visionResult?: VisionResult;
  savedAt: number;
}
