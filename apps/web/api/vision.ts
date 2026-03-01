import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'image is required (data URL)' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a travel guide vision analyzer. Analyze the photo and return JSON with this exact structure:
{
  "description": "2-3 sentence description of what's in the photo, focusing on location, cultural, or historical context. Write in English.",
  "landmarks": ["identified landmark or notable item names"],
  "suggestedTopics": ["3 interesting things the user might want to know about this place or scene"]
}
Respond ONLY with valid JSON. No markdown fences.`,
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: image, detail: 'low' } },
          ],
        },
      ],
      max_tokens: 500,
    });

    const text = response.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (e) {
    console.error('Vision API error:', e);
    return res.status(500).json({
      error: 'Vision analysis failed',
      description: 'Unable to analyze the photo at this time.',
      landmarks: [],
      suggestedTopics: [],
    });
  }
}
