# VOX

写真撮影を起点に音声ガイドが始まる体験を目指すプロトタイプです。現時点の実装は、Agora（RTC）を使った低遅延の音声通話（複数端末参加）と、トークン発行用のローカルAPIです。

## Apps

- `apps/web`: Vite + React（UI）
- `apps/api`: Express（Agora RTC token server）

## Setup

### 1) Token server（Agora）

```bash
cd apps/api
cp .env.example .env
```

`.env` に以下を設定します。

- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`

起動:

```bash
npm install
npm run dev
```

### 2) Web app

```bash
cd apps/web
cp .env.example .env.local
```

`.env.local` に以下を設定します。

- `VITE_AGORA_APP_ID`（`apps/api` の `AGORA_APP_ID` と一致させる）
- `VITE_AGORA_TOKEN_SERVER_URL`（既定: `http://localhost:4000`）

起動:

```bash
npm install
npm run dev
```

同じ `Channel` 名で複数端末から `Join (Voice)` すると相互に音声が聞こえます。

