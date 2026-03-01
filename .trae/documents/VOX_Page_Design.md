# 画面設計（Desktop-first）

## 共通（全ページ）
### Layout
- 基本：中央寄せの最大幅レイアウト（例：max-width 1200px）。主要操作は上部/右側に集約。
- レイアウト方式：Flexbox主体（ヘッダー/2カラム/カード）。一覧はCSS Grid。
- ブレイクポイント：
  - Desktop（>=1024px）：2カラム（左＝メイン、右＝サイド/状態）
  - Tablet/Phone：1カラムにスタック、下部に主要CTAを固定

### Meta Information（例）
- title：VOX
- description：写真から始まる音声ガイドと1日の体験記録
- OG：og:title / og:description / og:type=website

### Global Styles（Design Tokens）
- Background：#0B0F17（ダーク） / Surface：#121A2A / Border：rgba(255,255,255,0.08)
- Primary：#4F8CFF（CTA） / Accent：#7AE7C7（状態/成功） / Danger：#FF5A6A
- Typography：
  - H1 28/36, H2 20/28, Body 14/22, Caption 12/18
- Button：Primary（塗り）/ Secondary（アウトライン）
  - Hover：明度+5%、Active：縮小(0.98)、Disabled：不透明度0.5
- Link：Primary色、hoverで下線
- Transition：150–200ms（opacity/transform）

---

## 1) ログイン/新規登録（/login）
### Page Structure
- 1カラムのセンターパネル（カード）。左に説明、右にフォーム（Desktopは2カラム可）。

### Sections & Components
- ヘッダー：ロゴ（クリックで/へ。未ログイン時は/loginへ戻す）
- 認証カード
  - タブ：ログイン / 新規登録
  - フォーム：メール、パスワード、送信ボタン
  - エラー表示：入力検証/認証失敗をフォーム直下に表示
- フッター：プライバシー/利用規約（リンクのみ）

---

## 2) ホーム（撮影開始）（/）
### Page Structure
- 上：ナビ（左ロゴ/右ユーザー）
- 中：カメラビュー＋撮影操作（Desktopは左=プレビュー、右=操作パネル）
- 下：最近の体験（当日）への導線

### Sections & Components
- Top Nav
  - 右：ユーザーメニュー（/daily、ログアウト）
- Permission Gate（初回/未許可）
  - 状態カード：カメラ/マイク権限の状態
  - CTA：許可を求める（ブラウザの権限UIを案内）
- Camera Capture
  - ライブプレビュー枠（16:9）
  - 撮影ボタン（Primary、中央固定）
  - 撮影後プレビュー：撮り直し/ガイド開始
- Quick Links
  - 本日の体験記録へ（/daily の当日フィルタ）

---

## 3) ガイド/音声会話（/guide）
### Page Structure
- Desktop：2カラム
  - 左：会話タイムライン（テキスト）
  - 右：セッション状態・翻訳モード・音声操作

### Sections & Components
- Session Header
  - セッション状態（開始時刻、紐づく写真サムネ）
  - ボタン：保存（本日の体験記録に追加）
- Conversation Timeline
  - 吹き出し：User / Assistant（色分け）
  - 各ターン：テキスト、（任意）再生ボタン、時刻
- Voice Controls
  - 押して話す（hold-to-talk）/ 録音開始・停止（toggle）いずれかに統一
  - 入力状態：録音中インジケータ、レベルメーター（簡易）
  - 再生：最新応答の再生
- Translation Assist
  - トグル：翻訳アシスト（英→日）
  - 表示：翻訳結果（日本語）を応答枠内に併記（元英語は折りたたみ）
- Error/Recovery
  - 通信失敗：リトライ、ローカル録音保持、未保存警告

---

## 4) 1日の体験記録（/daily）
### Page Structure
- Desktop：左=日付一覧、右=詳細
- Phone：日付一覧→詳細へ遷移

### Sections & Components
- Date List（左）
  - 日付（YYYY-MM-DD）とサムネ/短いタイトル
  - 新規作成（当日エントリが無い場合）
- Entry Detail（右）
  - ヘッダー：日付、タイトル（任意）、保存状態
  - カバー写真（任意）
  - セクション：
    - 会話ログ（セッション単位で折りたたみ）
    - 写真ギャラリー（グリッド）
    - メモ（テキストエリア）＋保存
- Append Actions
  - ガイドセッションを追加（直近セッション候補から選択）
  - 写真を追加（アップロード/撮影済みから選択）

