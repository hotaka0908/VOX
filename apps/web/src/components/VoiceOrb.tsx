import type { AiSpeechState } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  state: AiSpeechState;
  isAssistMode: boolean;
}

const stateLabels: Record<AiSpeechState, string> = {
  idle: "Tap to speak",
  listening: "Listening...",
  thinking: "Thinking...",
  speaking: "Speaking...",
};

export default function VoiceOrb({ state, isAssistMode }: Props) {
  const color = isAssistMode ? "bg-vox-accent" : "bg-vox-primary";
  const glowColor = isAssistMode
    ? "shadow-[0_0_60px_rgba(122,231,199,0.3)]"
    : "shadow-[0_0_60px_rgba(79,140,255,0.3)]";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        {/* Pulse rings */}
        {(state === "speaking" || state === "listening") && (
          <>
            <div
              className={cn(
                "absolute h-32 w-32 rounded-full opacity-20 animate-ping",
                color,
              )}
              style={{ animationDuration: state === "speaking" ? "1s" : "2s" }}
            />
            <div
              className={cn(
                "absolute h-40 w-40 rounded-full opacity-10 animate-ping",
                color,
              )}
              style={{ animationDuration: state === "speaking" ? "1.5s" : "3s" }}
            />
          </>
        )}

        {/* Thinking spinner */}
        {state === "thinking" && (
          <div
            className={cn(
              "absolute h-36 w-36 rounded-full border-2 border-transparent animate-spin",
              isAssistMode ? "border-t-vox-accent" : "border-t-vox-primary",
            )}
            style={{ animationDuration: "1s" }}
          />
        )}

        {/* Core orb */}
        <div
          className={cn(
            "relative z-10 h-28 w-28 rounded-full transition-all duration-300",
            color,
            glowColor,
            state === "idle" && "opacity-60",
            state === "listening" && "scale-105",
            state === "speaking" && "scale-110",
          )}
        />
      </div>

      <span className="text-sm text-white/60">{stateLabels[state]}</span>
    </div>
  );
}
