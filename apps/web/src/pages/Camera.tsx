import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCamera } from "@/hooks/useCamera";
import { useAppStore } from "@/stores/app-store";
import ShutterButton from "@/components/ShutterButton";
import PhotoPreview from "@/components/PhotoPreview";
import type { CapturedPhoto } from "@/types";

export default function Camera() {
  const navigate = useNavigate();
  const { videoRef, isActive, error, startCamera, stopCamera, capture } = useCamera();
  const setCurrentPhoto = useAppStore((s) => s.setCurrentPhoto);
  const saveMemory = useAppStore((s) => s.saveMemory);

  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const onShutter = () => {
    const photo = capture();
    if (photo) {
      setCapturedPhoto(photo);
    }
  };

  const onRetake = () => {
    setCapturedPhoto(null);
  };

  const onAskGuide = () => {
    if (!capturedPhoto) return;
    setCurrentPhoto(capturedPhoto);
    stopCamera();
    navigate("/guide");
  };

  const onSave = () => {
    if (!capturedPhoto) return;
    saveMemory(capturedPhoto);
    setCapturedPhoto(null);
  };

  return (
    <div className="relative flex h-[100dvh] flex-col bg-black">
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
        <div className="absolute inset-x-0 top-0 z-10 bg-vox-danger/90 px-4 py-3 text-center text-sm text-white">
          {error}
          <button onClick={startCamera} className="ml-2 underline">
            再試行
          </button>
        </div>
      )}

      {/* Shutter area */}
      {!capturedPhoto && (
        <div className="absolute inset-x-0 bottom-24 z-10 flex justify-center">
          <ShutterButton onClick={onShutter} disabled={!isActive} />
        </div>
      )}

      {/* Photo preview overlay */}
      {capturedPhoto && (
        <PhotoPreview
          photo={capturedPhoto}
          onRetake={onRetake}
          onAskGuide={onAskGuide}
          onSave={onSave}
        />
      )}
    </div>
  );
}
