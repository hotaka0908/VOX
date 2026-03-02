import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OpenAIRealtimeClient } from "@/lib/openai-realtime";
import { analyzePhoto } from "@/lib/vision";
import {
  buildGuideInstruction,
  buildJapaneseAssistInstruction,
  formatVisionContext,
} from "@/lib/instructions";
import { useAppStore } from "@/stores/app-store";
import VoiceOrb from "@/components/VoiceOrb";
import ModeToggle from "@/components/ModeToggle";
import { ArrowLeft } from "lucide-react";

export default function Guide() {
  const navigate = useNavigate();

  const currentPhoto = useAppStore((s) => s.currentPhoto);
  const mode = useAppStore((s) => s.mode);
  const aiSpeechState = useAppStore((s) => s.aiSpeechState);
  const setMode = useAppStore((s) => s.setMode);
  const setAiSpeechState = useAppStore((s) => s.setAiSpeechState);
  const setAiConnected = useAppStore((s) => s.setAiConnected);
  const setCurrentVisionResult = useAppStore((s) => s.setCurrentVisionResult);
  const saveMemory = useAppStore((s) => s.saveMemory);
  const currentVisionResult = useAppStore((s) => s.currentVisionResult);

  const [status, setStatus] = useState<"analyzing" | "connecting" | "ready" | "error">(
    currentPhoto ? "analyzing" : "connecting"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const aiClientRef = useRef<OpenAIRealtimeClient | null>(null);
  const visionResultRef = useRef(currentVisionResult);
  const initialModeRef = useRef(mode);

  useEffect(() => {
    let cancelled = false;

    const startSession = async () => {
      try {
        let visionCtx: string | undefined;

        // Step 1: Analyze photo if present
        if (currentPhoto) {
          setStatus("analyzing");
          try {
            const result = await analyzePhoto(currentPhoto.dataUrl);
            if (!cancelled) {
              setCurrentVisionResult(result);
              visionResultRef.current = result;
              visionCtx = formatVisionContext(result);
            }
          } catch (e) {
            console.warn("Vision analysis failed:", e);
          }
        }

        if (cancelled) return;

        // Step 2: Connect to OpenAI Realtime with current mode
        setStatus("connecting");
        const instruction = initialModeRef.current === "japanese-assist"
          ? buildJapaneseAssistInstruction()
          : buildGuideInstruction(visionCtx);

        const client = new OpenAIRealtimeClient("", instruction);

        client.onSpeechStateChange = (state) => {
          if (!cancelled) setAiSpeechState(state);
        };

        client.onTranscript = (text, role) => {
          if (cancelled) return;
          if (role === "user" && text.includes("日本語アシストモード")) {
            setMode("japanese-assist");
            client.updateSession(buildJapaneseAssistInstruction());
          }
        };

        await client.connect();
        await client.startAudio();

        if (cancelled) {
          client.stop();
          return;
        }

        aiClientRef.current = client;
        setAiConnected(true);
        setStatus("ready");

        // Step 3: If photo and guide mode, prompt AI
        if (visionCtx && initialModeRef.current === "guide") {
          client.sendTextMessage(
            "I just took a photo. Please briefly describe what you see.",
          );
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Session failed:", e);
          setStatus("error");
          setErrorMsg(String(e));
        }
      }
    };

    startSession();

    return () => {
      cancelled = true;
      if (aiClientRef.current) {
        aiClientRef.current.stop();
        aiClientRef.current = null;
      }
      setAiConnected(false);
      setAiSpeechState("idle");
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onToggleMode = () => {
    const client = aiClientRef.current;
    if (!client) return;

    const newMode = mode === "guide" ? "japanese-assist" : "guide";
    setMode(newMode);

    if (newMode === "japanese-assist") {
      client.updateSession(buildJapaneseAssistInstruction());
    } else {
      const ctx = visionResultRef.current;
      client.updateSession(
        buildGuideInstruction(ctx ? formatVisionContext(ctx) : undefined),
      );
    }
  };

  const onEndConversation = () => {
    if (currentPhoto) {
      saveMemory(currentPhoto, visionResultRef.current ?? undefined);
    }

    if (aiClientRef.current) {
      aiClientRef.current.stop();
      aiClientRef.current = null;
    }
    setAiConnected(false);
    setAiSpeechState("idle");
    navigate("/");
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-vox-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-safe-top py-3">
        <button
          onClick={onEndConversation}
          className="flex items-center gap-1 text-sm text-white/70 active:text-white"
        >
          <ArrowLeft size={18} />
          戻る
        </button>
        <ModeToggle mode={mode} onToggle={onToggleMode} />
      </header>

      {/* Photo context card */}
      {currentPhoto && (
        <div className="mx-4 flex items-center gap-3 rounded-xl bg-vox-surface p-3">
          <img
            src={currentPhoto.dataUrl}
            alt="Captured"
            className="h-14 w-14 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            {status === "analyzing" ? (
              <p className="text-xs text-white/50">写真を分析中...</p>
            ) : currentVisionResult ? (
              <>
                <p className="truncate text-sm font-medium text-white/90">
                  {currentVisionResult.landmarks[0] || "Photo"}
                </p>
                <p className="line-clamp-1 text-xs text-white/50">
                  {currentVisionResult.description}
                </p>
              </>
            ) : (
              <p className="text-xs text-white/50">準備完了</p>
            )}
          </div>
        </div>
      )}

      {/* Main area with VoiceOrb */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {status === "analyzing" && (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-vox-primary border-t-transparent" />
            <p className="text-sm text-white/60">写真を分析中...</p>
          </div>
        )}

        {status === "connecting" && (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-vox-primary border-t-transparent" />
            <p className="text-sm text-white/60">接続中...</p>
          </div>
        )}

        {status === "ready" && (
          <VoiceOrb state={aiSpeechState} isAssistMode={mode === "japanese-assist"} />
        )}

        {status === "error" && (
          <div className="mx-6 rounded-xl bg-vox-danger/20 p-4 text-center">
            <p className="text-sm text-vox-danger">接続に失敗しました</p>
            {errorMsg && <p className="mt-1 text-xs text-white/40">{errorMsg}</p>}
          </div>
        )}

        {/* Mode indicator */}
        {status === "ready" && mode === "japanese-assist" && (
          <div className="rounded-full bg-vox-accent/10 px-4 py-2">
            <p className="text-xs text-vox-accent">
              英語で話してください → 日本語に翻訳します
            </p>
          </div>
        )}

        {status === "ready" && mode === "guide" && (
          <div className="rounded-full bg-vox-primary/10 px-4 py-2">
            <p className="text-xs text-vox-primary">
              何でも聞いてください
            </p>
          </div>
        )}
      </div>

      {/* End conversation button */}
      <div className="px-6 pb-8 pb-safe-bottom">
        <button
          onClick={onEndConversation}
          className="w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60 transition-all active:scale-[0.98] active:bg-white/5"
        >
          会話を終了
        </button>
      </div>
    </div>
  );
}
