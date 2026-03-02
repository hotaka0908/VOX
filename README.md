# VOX

AI音声ガイド & 日本語翻訳アシスタント

## Features

- **Guide Mode**: 写真を撮ると英語/日本語で説明
- **Japanese Mode**: 英語→日本語翻訳を2回繰り返す
- **Voice Chat**: OpenAI Realtime APIでリアルタイム会話
- **Memories**: 写真の保存・閲覧

## Tech Stack

- React + TypeScript + Vite
- OpenAI Realtime API (GPT-4o)
- Tailwind CSS
- Vercel

## Setup

```bash
cd apps/web
npm install
cp .env.example .env.local
```

`.env.local`:
```
OPENAI_API_KEY=your_key
```

```bash
npm run dev
```

## Deploy

Vercelにデプロイ済み。環境変数 `OPENAI_API_KEY` を設定。
