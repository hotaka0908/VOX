import type { VisionResult } from "@/types";

export async function analyzePhoto(
  dataUrl: string,
): Promise<VisionResult> {
  const res = await fetch("/api/vision", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ image: dataUrl }),
  });

  if (!res.ok) {
    throw new Error(`Vision API error: ${res.status}`);
  }

  return res.json();
}
