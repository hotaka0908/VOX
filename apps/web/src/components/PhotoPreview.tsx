import type { CapturedPhoto } from "@/types";

interface Props {
  photo: CapturedPhoto;
  onRetake: () => void;
  onAskGuide: () => void;
  onSave: () => void;
}

export default function PhotoPreview({ photo, onRetake, onAskGuide, onSave }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-vox-bg">
      <div className="flex-1 overflow-hidden">
        <img
          src={photo.dataUrl}
          alt="Captured"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex flex-col gap-3 p-6 pb-10">
        <button
          onClick={onAskGuide}
          className="w-full rounded-xl bg-vox-primary py-4 text-base font-semibold text-white transition-all active:scale-[0.98]"
        >
          Ask Guide
        </button>
        <div className="flex gap-3">
          <button
            onClick={onRetake}
            className="flex-1 rounded-xl border border-white/20 py-3 text-sm font-medium text-white/80 transition-all active:scale-[0.98]"
          >
            Retake
          </button>
          <button
            onClick={onSave}
            className="flex-1 rounded-xl border border-vox-accent/40 py-3 text-sm font-medium text-vox-accent transition-all active:scale-[0.98]"
          >
            Save Only
          </button>
        </div>
      </div>
    </div>
  );
}
