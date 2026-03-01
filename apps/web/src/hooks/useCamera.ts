import { useCallback, useRef, useState } from "react";
import type { CapturedPhoto } from "@/types";

const MAX_SIZE = 1024;

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
    } catch (e) {
      const msg = e instanceof DOMException && e.name === "NotAllowedError"
        ? "カメラへのアクセスを許可してください"
        : "カメラを起動できませんでした";
      setError(msg);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const capture = useCallback((): CapturedPhoto | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const canvas = document.createElement("canvas");
    let w = video.videoWidth;
    let h = video.videoHeight;

    // Resize if too large to keep localStorage usage reasonable
    if (w > MAX_SIZE || h > MAX_SIZE) {
      const ratio = Math.min(MAX_SIZE / w, MAX_SIZE / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    return {
      id: crypto.randomUUID(),
      dataUrl,
      timestamp: Date.now(),
    };
  }, []);

  return { videoRef, isActive, error, startCamera, stopCamera, capture };
}
