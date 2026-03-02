import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  convertInt16ToFloat32,
  resampleBuffer,
  floatTo16BitPCM,
} from "./audio-utils";
import type { AiSpeechState } from "@/types";

async function getEphemeralToken(): Promise<string> {
  const res = await fetch("/api/realtime-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to get ephemeral token: ${res.status}`);
  }
  const data = await res.json();
  return data.client_secret;
}

export class OpenAIRealtimeClient {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private scheduledTime = 0;
  private currentInstructions: string;
  private activeSources: AudioBufferSourceNode[] = [];
  private isAiSpeaking = false;

  /** Called when user or assistant speech is transcribed */
  public onTranscript?: (text: string, role: "user" | "assistant") => void;
  /** Called when AI speech state changes */
  public onSpeechStateChange?: (state: AiSpeechState) => void;

  constructor(
    private _url: string,
    instructions = "You are a helpful assistant. Speak Japanese.",
  ) {
    this.currentInstructions = instructions;
  }

  async connect() {
    const token = await getEphemeralToken();

    const url = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`;
    this.ws = new WebSocket(url, [
      "realtime",
      `openai-insecure-api-key.${token}`,
      "openai-beta.realtime-v1",
    ]);

    return new Promise<void>((resolve, reject) => {
      if (!this.ws) return reject("WebSocket not initialized");

      this.ws.onopen = () => {
        console.log("Connected to OpenAI Realtime API");
        this.sendSessionConfig(this.currentInstructions);
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log("Disconnected from OpenAI Realtime API");
      };
    });
  }

  public updateSession(instructions: string) {
    this.currentInstructions = instructions;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        type: "session.update",
        session: { instructions },
      }),
    );
  }

  public sendTextMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text }],
        },
      }),
    );
    this.ws.send(JSON.stringify({ type: "response.create" }));
  }

  /** Interrupt AI speech and cancel ongoing response */
  public interrupt() {
    // Stop all playing audio
    this.stopAllAudio();

    // Cancel ongoing response
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "response.cancel" }));
    }

    this.isAiSpeaking = false;
  }

  private stopAllAudio() {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Already stopped
      }
    }
    this.activeSources = [];
    this.scheduledTime = 0;
  }

  private sendSessionConfig(instructions: string) {
    if (!this.ws) return;
    const event = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        instructions,
        voice: "alloy",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: {
          model: "whisper-1",
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
      },
    };
    this.ws.send(JSON.stringify(event));
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case "response.audio.delta":
        if (data.delta) {
          const arrayBuffer = base64ToArrayBuffer(data.delta);
          const float32 = convertInt16ToFloat32(arrayBuffer);
          this.queueAudio(float32);
          this.isAiSpeaking = true;
          this.onSpeechStateChange?.("speaking");
        }
        break;
      case "response.audio.done":
        break;
      case "response.done":
        this.isAiSpeaking = false;
        this.onSpeechStateChange?.("idle");
        break;
      case "input_audio_buffer.speech_started":
        // User started speaking - interrupt AI
        if (this.isAiSpeaking) {
          this.interrupt();
        }
        this.onSpeechStateChange?.("listening");
        break;
      case "input_audio_buffer.speech_stopped":
        this.onSpeechStateChange?.("thinking");
        break;
      case "conversation.item.input_audio_transcription.completed":
        this.onTranscript?.(data.transcript, "user");
        break;
      case "response.audio_transcript.done":
        this.onTranscript?.(data.transcript, "assistant");
        break;
      case "error":
        console.error("OpenAI Error:", data.error);
        break;
      default:
        break;
    }
  }

  async startAudio() {
    try {
      this.audioContext = new AudioContext({ sampleRate: 24000 });
    } catch {
      this.audioContext = new AudioContext();
    }

    const actualSampleRate = this.audioContext.sampleRate;
    console.log(`AudioContext sample rate: ${actualSampleRate}`);

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch (err) {
      console.error("Error accessing microphone:", err);
      return;
    }

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);

      const resampled = resampleBuffer(inputData, actualSampleRate, 24000);
      const pcm16 = floatTo16BitPCM(resampled);
      const base64 = arrayBufferToBase64(pcm16);

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: "input_audio_buffer.append",
            audio: base64,
          }),
        );
      }
    };
  }

  private queueAudio(float32: Float32Array) {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    // Track this source for interruption
    this.activeSources.push(source);
    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) {
        this.activeSources.splice(idx, 1);
      }
    };

    const currentTime = this.audioContext.currentTime;
    if (this.scheduledTime < currentTime) {
      this.scheduledTime = currentTime;
    }

    source.start(this.scheduledTime);
    this.scheduledTime += buffer.duration;
  }

  stop() {
    this.stopAllAudio();
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.processor?.disconnect();
    this.audioContext?.close();
    this.ws?.close();
    this.ws = null;
    this.audioContext = null;
    this.mediaStream = null;
    this.processor = null;
  }
}
