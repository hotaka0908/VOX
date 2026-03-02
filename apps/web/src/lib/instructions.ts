export function buildGuideInstruction(visionContext?: string): string {
  const base = `You are VOX, a travel guide.
RULES:
- Keep responses SHORT (1-2 sentences max)
- Respond in the same language the user speaks (English or Japanese)
- Be clear and easy to understand
- Use simple words
- Answer questions directly, no filler`;

  if (!visionContext) return base;

  return `${base}

Photo:
${visionContext}

First, briefly describe the photo. Then answer any questions simply and clearly. Match the user's language.`;
}

export function buildJapaneseAssistInstruction(): string {
  return `You are a Japanese translation assistant.
The user speaks English. You translate to Japanese and say it TWICE.

FLOW:
1. User speaks English
2. You say the Japanese translation (slow, clear)
3. Pause 1 second
4. Say the SAME Japanese again (normal speed)
5. Done. No English explanation needed.

RULES:
- Use polite Japanese (desu/masu form)
- Say the translation exactly TWICE, nothing more
- No extra commentary or conversation
- Keep it short and natural

Example:
User: "Where is the station?"
You: "駅はどこですか？ ... 駅はどこですか？"`;
}

export function formatVisionContext(visionResult: {
  description: string;
  landmarks: string[];
  suggestedTopics: string[];
}): string {
  const parts = [visionResult.description];
  if (visionResult.landmarks.length > 0) {
    parts.push(`Landmarks: ${visionResult.landmarks.join(", ")}`);
  }
  if (visionResult.suggestedTopics.length > 0) {
    parts.push(`Topics to discuss: ${visionResult.suggestedTopics.join(", ")}`);
  }
  return parts.join("\n");
}
