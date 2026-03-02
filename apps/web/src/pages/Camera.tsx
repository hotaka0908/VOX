import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCamera } from "@/hooks/useCamera";
import { useAppStore } from "@/stores/app-store";
import ModeToggle from "@/components/ModeToggle";
import { Image, Mic, MicOff, Camera as CameraIcon } from "lucide-react";
import type { CapturedPhoto } from "@/types";

export default function Camera() {
  const navigate = useNavigate();
  const { videoRef, isActive, error, startCamera, stopCamera, capture } = useCamera();
  const setCurrentPhoto = useAppStore((s) => s.setCurrentPhoto);
  const mode = useAppStore((s) => s.mode);
  const toggleMode = useAppStore((s) => s.toggleMode);

  const [isVoiceActive, setIsVoiceActive] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const onCapture = () => {
    const photo = capture();
    if (photo) {
      setCurrentPhoto(photo);
      stopCamera();
      navigate("/guide");
    }
  };

  const onToggleVoice = () => {
    if (!isVoiceActive) {
      // Start voice mode without photo
      setCurrentPhoto(null);
      stopCamera();
      navigate("/guide");
    }
    setIsVoiceActive(!isVoiceActive);
  };

  const onOpenMemories = () => {
    navigate("/memories");
  };

  return (
    <div className="relative flex h-[100dvh] flex-col bg-black">
      {/* Mode toggle header */}
      <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-safe-top py-4">
        <ModeToggle mode={mode} onToggle={toggleMode} />
      </div>

      {/* Camera viewfinder */}
      <div className="flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
      </div>

      {/* Permission error */}
      {error && (
        <div className="absolute inset-x-0 top-16 z-10 bg-vox-danger/90 px-4 py-3 text-center text-sm text-white">
          {error}
          <button onClick={startCamera} className="ml-2 underline">
            再試行
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 z-20 pb-safe-bottom">
        <div className="flex items-center justify-around px-8 py-6">
          {/* Left: Memories button */}
          <button
            onClick={onOpenMemories}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-95"
          >
            <Image size={24} className="text-white" />
          </button>

          {/* Center: Voice button */}
          <button
            onClick={onToggleVoice}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-vox-primary transition-all active:scale-95"
          >
            {isVoiceActive ? (
              <MicOff size={32} className="text-white" />
            ) : (
              <Mic size={32} className="text-white" />
            )}
          </button>

          {/* Right: Camera button */}
          <button
            onClick={onCapture}
            disabled={!isActive}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-95 disabled:opacity-50"
          >
            <CameraIcon size={24} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
