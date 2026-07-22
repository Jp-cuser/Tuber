# LocalAITuber 完全機能仕様書

- 文書バージョン: 1.0
- 作成日: 2026-07-22
- 想定実装者: Codex
- 対象OS: Windows 10 / Windows 11（x64）
- 仮プロジェクト名: `LocalAITuber`
- 参照リポジトリ: `tegnike/aituber-kit`
- 機能比較基準: 参照リポジトリ `main`
- 基準コミット: `198dbe1d5f8a7f86f9b527c7f0fd1eb3fc9d0988`
- 実装方式: 空の新規リポジトリから独立実装
- 完成条件: `FEATURE_MATRIX.md` の必須項目がすべて完了していること

---

## 1. 文書の目的

Windowsローカルで起動できるAIキャラクターアプリケーションを新規開発する。

本プロジェクトは、参照リポジトリに存在するユーザー向け機能、設定、外部連携、API、運用機能、デプロイ方式を最終的にすべて実装対象とする。

初期版だけを小規模MVPとして終了する方針は採用しない。実装はフェーズ分割するが、最終スコープは全機能で固定する。

---

## 2. 最重要原則

### 2.1 完全機能パリティ

次の情報源に存在する機能は、原則すべて実装する。

1. 参照リポジトリのREADME
2. `.env.example`
3. `src/components`
4. `src/features`
5. `src/hooks`
6. `src/pages`
7. `src/pages/api`
8. `public/embed.js`
9. Electron、Docker、Cloudflare、Vercel関連ファイル
10. ユーザー向け設定画面
11. 自動テストで保証されている挙動
12. Codexが調査中に発見した追加のユーザー向け機能

参照リポジトリで追加機能を発見した場合、実装前に `FEATURE_MATRIX.md` へ行を追加する。

### 2.2 独立実装

- フォークとして作成しない。
- 参照リポジトリのソースコードをコピーしない。
- 参照リポジトリの画像、ロゴ、VRM、Live2Dモデル、音声、スライド素材をコピーしない。
- 固有のUIをピクセル単位で複製しない。
- 公開されている機能、設定、API挙動、一般的なアーキテクチャのみを参考にする。
- 新規プロジェクト独自の名前、UI、構造、素材を使用する。

### 2.3 Windowsローカル優先

完成版は複数の起動方式を持つが、最優先の受入環境はWindowsローカルとする。

標準起動:

```text
SETUP.bat
LAUNCH.bat
http://127.0.0.1:3000
```

### 2.4 実装フェーズと完成範囲を分離する

Codexは一度に全機能を実装しない。

- 各フェーズは独立したコミットまたはPRとする。
- 前フェーズの品質ゲートが通るまで次へ進まない。
- 最終的には全フェーズを実装する。
- 「後回し」は許可するが、「対象外」への変更は禁止する。
- ライセンス制約で同梱できないSDKや素材は、利用者が正規に用意したファイルを読み込める方式で実装する。

---

## 3. プロダクト定義

### 3.1 一文での定義

複数形式のAIキャラクターを表示し、クラウドまたはローカルAI、音声認識、音声合成、ライブ配信コメント、長期記憶、外部API、WebSocket、スライド、キオスク、ゲーム実況などを統合したWindowsローカル実行型AITuber基盤。

### 3.2 主な用途

- AIキャラクターとのテキスト会話
- AIキャラクターとの音声会話
- YouTube Liveでの自動コメント応答
- OBS配信向けキャラクター表示
- 店頭デモ、受付、デジタルサイネージ
- ゲーム実況
- スライド自動発表
- 外部アプリケーションからのキャラクター制御
- 埋め込み型AIキャラクター
- ローカルLLMとローカルTTSを使った閉域運用
- キャラクター設定、モデル、背景、音声、AIサービスの検証基盤

---

## 4. 最終スコープ一覧

### 4.1 キャラクターモデル

- VRM
- Live2D Cubism 3以降
- MotionPNGTuber互換の動画ベースPNGTuber
- モデル一覧取得
- モデル選択
- モデルアップロード
- モデル読み込み状態表示
- モデル位置、回転、拡大率
- 固定位置
- 照明強度
- 自動まばたき
- アイドル動作
- リップシンク
- 感情表現
- ポーズ
- ジェスチャー
- モーションタグ
- 思考中ポーズ
- Live2D感情マッピング
- Live2Dモーショングループ
- PNGTuber感度
- PNGTuberクロマキー
- PNGTuber位置とサイズ

### 4.2 AI会話

- テキスト入力
- ストリーミング回答
- 非ストリーミング生成
- 会話履歴
- システムプロンプト
- キャラクタープリセット5件以上
- プリセット切替ショートカット
- プリセット質問
- 最大履歴件数
- temperature
- 最大出力トークン
- Reasoningモード
- 推論レベル
- 推論トークン予算
- 思考テキスト表示
- 検索グラウンディング
- 動的取得しきい値
- カスタムモデル
- カスタムAPI
- 画像入力
- カメラ入力
- 画面キャプチャ入力
- マルチモーダル利用可否判定
- ユーザー発言へのタイムスタンプ付与
- 回答停止
- 発話停止
- 割り込み
- メッセージ優先度

### 4.3 対応AIプロバイダー

- OpenAI
- Anthropic
- Google Gemini
- Azure OpenAI
- xAI
- Groq
- Cohere
- Mistral AI
- Perplexity
- Fireworks
- DeepSeek
- OpenRouter
- LM Studio
- Ollama
- Dify
- OpenAI互換カスタムAPI
- 任意のカスタムHTTP API

プロバイダーごとの差異はadapterで吸収する。

### 4.4 高度なAIモード

- OpenAI Realtime APIモード
- Azure Realtime API互換モード
- Realtimeのテキスト入力
- Realtimeの音声入力
- Realtime音声選択
- Realtime function calling
- ツール定義JSON読み込み
- OpenAI Audioモード
- Audioモードのテキスト入力
- Audioモードの音声入力
- Audioモードの音声選択
- Reasoningモード
- 思考過程表示
- プロバイダー固有reasoning metadataの制御

### 4.5 音声入力

- ブラウザSpeechRecognition
- OpenAI Whisper API
- `whisper-1`
- `gpt-4o-transcribe`
- `gpt-4o-mini-transcribe`
- マイク権限処理
- 初回発話タイムアウト
- 無音検出
- 無音タイムアウト
- 無音プログレスバー
- 常時マイク待受
- 自動再開
- 音声認識中の状態表示
- Realtime音声入力との排他制御
- Audioモード音声入力との排他制御

### 4.6 音声合成

- VOICEVOX
- Koeiromap
- Google Text-to-Speech
- Style-Bert-VITS2
- AivisSpeech
- Aivis Cloud API
- GSVI TTS
- ElevenLabs
- OpenAI TTS
- Azure OpenAI TTS
- Cartesia

各音声エンジンについて、認証、URL、話者、モデル、速度、ピッチ、抑揚、スタイル等の対応パラメータを設定可能にする。

### 4.7 長期記憶

- 直近会話履歴
- RAG長期記憶
- 埋め込み生成
- 類似度検索
- 類似度しきい値
- 検索件数
- コンテキスト最大トークン
- 記憶ファイル一覧
- 記憶ファイル追加
- 記憶ファイル削除
- 記憶復元
- ローカルストア同期
- セッション復元
- 記憶コンテキスト構築
- 記憶機能ON/OFF

### 4.8 YouTube・配信

- YouTube Liveコメント取得
- YouTube Data API
- ライブ配信ID
- APIキー
- コメント取得間隔
- OneComme連携
- OneCommeポート設定
- コメントソース切替
- コメント選択
- コメントへの自動応答
- コメントがない場合の会話継続
- 新規トピック自動生成
- スリープ移行
- 会話継続しきい値
- 継続判定プロンプト
- 継続ガイドライン
- コメント選択プロンプト
- 新規トピックプロンプト
- スリープガイドライン
- ユーザー表示名
- 回答キュー
- 発話中のコメント蓄積
- 配信向けUI

### 4.9 デモ端末・キオスク

- キオスクモード
- フルスクリーン
- 操作UI制限
- パスコード
- 入力文字数制限
- NGワードフィルタ
- NGワード一覧
- ガイダンスメッセージ
- ガイダンス表示時間
- Esc長押し等の解除操作
- マルチタップ解除操作
- 管理者設定への復帰
- 店頭利用向け安全設定

### 4.10 人感検知

- カメラ顔検出
- 有人／無人状態
- 顔検出感度
- 検出確定時間
- 離脱判定時間
- クールダウン
- 使用カメラ選択
- 挨拶メッセージ
- 離脱メッセージ
- 離脱時の会話履歴クリア
- デバッグプレビュー
- 検出状態インジケーター
- 顔認識モデルの読み込み状態
- カメラ権限エラー処理

顔の個人識別は行わず、存在検出のみを標準とする。

### 4.11 アイドルモード

- アイドルモードON/OFF
- 定型フレーズ
- 順次再生
- ランダム再生
- 発話間隔
- 既定感情
- 時間帯別挨拶
- 朝
- 昼
- 夕方
- AI自動生成発話
- AIプロンプトテンプレート
- ユーザー会話中の抑止
- 発話キューとの排他
- 人感検知との連携

### 4.12 ゲーム実況

- 画面キャプチャ
- 定期キャプチャ
- JPEG品質
- リサイズ幅
- 実況プロンプト
- 過去実況コンテキスト件数
- 実況のAI生成
- 実況音声再生
- 実況を会話履歴へ保存
- 発話中の補助画像解析
- 補助解析間隔
- 補助解析プロンプト
- キャプチャ停止
- 画面共有権限エラー処理

### 4.13 スライド

- スライドモード
- Markdownからスライド変換
- スライドフォルダ一覧
- スライドデータ読み込み
- スライド表示
- スライド本文
- 発表用テキスト
- 前へ
- 次へ
- 自動進行
- AIキャラクターによる読み上げ
- スライドエディター
- スライドデータ更新
- スライドフォルダ管理
- Marpit互換レンダリング

### 4.14 外部連携

- WebSocket外部連携モード
- 接続URL設定
- 再接続
- 接続状態
- テキスト受信
- 画像受信
- 外部指示受信
- 外部イベント送信
- 接続エラー処理
- メッセージ受信機能
- 専用送信画面
- クライアントID
- 複数クライアントキュー

### 4.15 外部HTTP API

最低限、次の互換ルートを提供する。

- `POST /api/v1/speak`
- `POST /api/v1/chat`
- `POST /api/v1/messages`
- `POST /api/v1/stop`
- `GET /api/v1/status`
- `GET /api/v1/events`
- `GET /api/v1/client/commands`
- `POST /api/v1/client/status`

APIは以下を扱う。

- clientId
- text
- messages
- image
- emotion
- priority
- interrupt
- direct_send
- ai_generate
- user_input
- systemPrompt
- useCurrentSystemPrompt
- stop mode: speech / queue / all
- キュー状態
- クライアント状態
- イベント
- SSEまたは長期ポーリング
- Bearer認証

### 4.16 埋め込み

- `public/embed.js`相当の埋め込みローダー
- `/embed`
- `/embed/[embedId]`
- 埋め込みIDごとの設定
- デフォルト埋め込みID
- allowedOrigins
- キャラクター名
- モデルタイプ
- モデルパス
- 字幕表示
- キャラクター名表示
- 複数サイトへの埋め込み
- iframeまたはShadow DOMによる分離
- 親ページとのpostMessage
- オリジン検証
- レスポンシブ表示

### 4.17 ファイル・素材管理

- 背景一覧取得
- 背景アップロード
- 画像一覧取得
- 画像アップロード
- 画像削除
- VRM一覧取得
- VRMアップロード
- Live2D一覧取得
- PNGTuber一覧取得
- ポーズ一覧取得
- ポーズ回転更新
- スライドフォルダ一覧
- スライドデータ更新
- 補助情報取得
- 制限モードでのファイルシステムAPI無効化
- 静的アセットマニフェスト
- 大容量ファイルの扱い
- 非ASCIIファイル名への対応
- パストラバーサル防止

### 4.18 表示・UI

- 紹介画面
- クイックメニュー
- 操作パネル表示切替
- 回答欄表示切替
- 回答欄スタイル
  - bubble
  - borderless
- キャラクター名表示
- ユーザー表示名
- チャットログ
- チャットログ幅
- 左右位置
- glass / classicデザイン
- 画面端オフセット
- ドラッグ
- リサイズ
- フルスクリーン
- 背景画像
- 背景映像
- Webカメラ背景
- 画面キャプチャ背景
- 映像非表示
- グリーンバック
- 画像オーバーレイ
- 配置画像
- 画像モーダル
- 画像表示位置
  - input
  - side
  - icon
- モデル読み込みオーバーレイ
- Toast
- 接続状態表示
- テーマ
  - default
  - cool
  - mono
  - ocean
  - forest
  - sunset
- 多言語UI
- レスポンシブ表示
- キーボードショートカット

### 4.19 設定・プリセット

- UIからの全主要設定変更
- 環境変数による初期設定
- 環境変数優先モード
- localStorageまたはIndexedDBによる保存
- 設定バージョン
- 設定マイグレーション
- 設定エクスポート
- 設定インポート
- 設定リセット
- 5件以上のキャラクタープリセット
- プリセット名
- システムプロンプト
- プリセット質問
- 各プロバイダーの接続テスト
- TTS話者一覧更新
- VOICEVOX話者更新
- AivisSpeech話者更新

### 4.20 ログ保存

- 会話ログをローカルJSONへ保存
- 新規ファイル作成
- 既存ファイル追記
- 指定ファイル上書き
- 最新ログファイル選択
- 安全なファイル名検証
- optional Supabase保存
- セッションテーブル
- メッセージテーブル
- サービスロールキーをサーバー側で保持
- ログ保存ON/OFF
- ログ保存失敗時も会話継続

### 4.21 国際化

最低限、参照リポジトリに存在する以下の言語を実装する。

- 日本語
- 英語
- 韓国語
- 中国語簡体字
- 中国語繁体字
- ベトナム語
- フランス語
- スペイン語
- ポルトガル語
- ドイツ語
- ロシア語
- イタリア語
- アラビア語
- ヒンディー語
- ポーランド語
- タイ語

要件:

- i18next
- 言語自動選択
- 環境変数による既定言語
- UIからの言語変更
- RTL言語への配慮
- 翻訳キー欠落検査
- 英単語を日本語読みへ変換する任意設定

### 4.22 起動・配布・デプロイ

- Windows `SETUP.bat`
- Windows `LAUNCH.bat`
- macOS `LAUNCH.command`
- npm開発起動
- npm本番起動
- HTTPS開発起動
- Electronデスクトップ起動
- 透明Electronウィンドウ
- Dockerfile
- docker-compose
- Vercel
- Cloudflare Workers
- OpenNext
- Wrangler
- Cloudflareローカルプレビュー
- Cloudflareデプロイ
- 制限モード
- 埋め込み配布

Windowsローカル版を完成の基準とし、その他の配布方式も最終パリティ範囲に含める。

---

## 5. 技術スタック

### 5.1 基本

| 分類           | 採用技術                                             |
| -------------- | ---------------------------------------------------- |
| ランタイム     | Node.js 24.x                                         |
| パッケージ管理 | npm 11.x                                             |
| フレームワーク | Next.js 15.5系                                       |
| ルーティング   | Pages Routerを基本とし、必要に応じてApp Router併用可 |
| UI             | React 18.3系                                         |
| 言語           | TypeScript                                           |
| CSS            | Tailwind CSS                                         |
| 状態管理       | Zustand                                              |
| 入力検証       | Zod                                                  |
| HTTP           | Fetch API / Axios                                    |
| 国際化         | i18next / react-i18next                              |
| ID             | UUID                                                 |
| 永続化         | localStorage、IndexedDB、ローカルJSON                |
| 任意DB         | Supabase                                             |
| テスト         | Jest、Testing Library、Playwright                    |

### 5.2 AI

- Vercel AI SDK
- 各AI SDK provider
- OpenAI SDK
- Anthropic SDK
- Google Generative AI SDK
- OpenAI互換adapter
- provider registry
- ストリーミング
- reasoning metadata normalization

### 5.3 キャラクター

- Three.js
- `@pixiv/three-vrm`
- PixiJS
- Live2D表示ライブラリ
- MotionPNGTuber互換再生層
- Web Audio API
- requestAnimationFrame

### 5.4 メディア

- MediaDevices
- getUserMedia
- getDisplayMedia
- Web Audio API
- SpeechRecognition
- MediaRecorder
- Canvas
- face-api.js
- ffmpegは必要な変換処理に限定して利用

### 5.5 デスクトップ・デプロイ

- Electron
- wait-on
- Docker
- OpenNext
- Cloudflare Wrangler

---

## 6. システムアーキテクチャ

```text
Windows User
  │
  ├─ LAUNCH.bat
  │    ├─ Node/npm check
  │    ├─ dependency install
  │    ├─ Next.js local server
  │    └─ browser open
  │
  ├─ Browser UI
  │    ├─ Character Renderer
  │    │    ├─ VRM
  │    │    ├─ Live2D
  │    │    └─ PNGTuber
  │    ├─ Chat UI
  │    ├─ Settings UI
  │    ├─ Audio Input
  │    ├─ Audio Output
  │    ├─ YouTube / OneComme
  │    ├─ Kiosk / Presence / Idle
  │    ├─ Game Commentary
  │    ├─ Slide Mode
  │    ├─ External WebSocket
  │    ├─ API Message Receiver
  │    └─ Local Persistence
  │
  └─ Next.js Server
       ├─ AI Gateway
       ├─ TTS Gateway
       ├─ Whisper
       ├─ Memory / Embedding
       ├─ External API v1
       ├─ Resource File APIs
       ├─ YouTube proxy
       ├─ Slide conversion
       ├─ Chat log persistence
       ├─ Access Policy
       └─ Diagnostics
```

### 6.1 レイヤー

1. Presentation
2. Application services
3. Domain models
4. Provider adapters
5. Infrastructure
6. Security/access policy
7. Persistence
8. External control gateway

### 6.2 依存方向

```text
UI
 → Use Cases
 → Interfaces
 → Provider Adapters
 → External Services
```

UIコンポーネントから外部APIを直接呼ばない。

---

## 7. 推奨ディレクトリ構成

```text
local-ai-tuber/
├─ src/
│  ├─ pages/
│  │  ├─ api/
│  │  │  ├─ ai/
│  │  │  ├─ youtube/
│  │  │  ├─ v1/
│  │  │  │  └─ client/
│  │  │  ├─ tts/
│  │  │  ├─ resources/
│  │  │  ├─ memory/
│  │  │  └─ diagnostics/
│  │  ├─ embed/
│  │  │  ├─ index.tsx
│  │  │  └─ [embedId].tsx
│  │  ├─ slide-editor/
│  │  ├─ _app.tsx
│  │  ├─ _document.tsx
│  │  ├─ index.tsx
│  │  └─ send-message.tsx
│  ├─ components/
│  │  ├─ avatar/
│  │  ├─ chat/
│  │  ├─ settings/
│  │  ├─ youtube/
│  │  ├─ slide/
│  │  ├─ kiosk/
│  │  ├─ presence/
│  │  ├─ idle/
│  │  ├─ game-commentary/
│  │  ├─ embed/
│  │  ├─ external-linkage/
│  │  └─ common/
│  ├─ features/
│  │  ├─ ai/
│  │  ├─ audio/
│  │  ├─ api/
│  │  ├─ avatar/
│  │  ├─ memory/
│  │  ├─ youtube/
│  │  ├─ slide/
│  │  ├─ kiosk/
│  │  ├─ presence/
│  │  ├─ idle/
│  │  ├─ game-commentary/
│  │  ├─ embed/
│  │  ├─ external-linkage/
│  │  ├─ persistence/
│  │  └─ stores/
│  ├─ lib/
│  │  ├─ access-policy/
│  │  ├─ env/
│  │  ├─ logger/
│  │  ├─ security/
│  │  └─ errors/
│  ├─ hooks/
│  ├─ schemas/
│  ├─ types/
│  └─ utils/
├─ public/
│  ├─ backgrounds/
│  ├─ images/
│  ├─ vrm/
│  ├─ live2d/
│  ├─ pngtuber/
│  ├─ poses/
│  ├─ slides/
│  └─ embed.js
├─ locales/
├─ logs/
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
├─ scripts/
│  ├─ check-node-version.mjs
│  ├─ open-browser.ps1
│  ├─ build-cloudflare.mjs
│  └─ waf/
├─ .env.example
├─ AGENTS.md
├─ CODEX_PROMPT.md
├─ FEATURE_MATRIX.md
├─ MODEL_LICENSES.md
├─ THIRD_PARTY_NOTICES.md
├─ SETUP.bat
├─ LAUNCH.bat
├─ LAUNCH.command
├─ Dockerfile
├─ docker-compose.yml
├─ electron.mjs
├─ package.json
└─ README.md
```

---

## 8. コアデータモデル

### 8.1 Message

```ts
type MessageRole = 'system' | 'user' | 'assistant';

type MessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image'; data: string; mimeType?: string }
    >;

type Message = {
  id: string;
  role: MessageRole;
  content: MessageContent;
  timestamp: string;
  name?: string;
  emotion?: string;
  reasoning?: string;
  status?: 'queued' | 'streaming' | 'complete' | 'error' | 'cancelled';
  source?:
    | 'local-user'
    | 'youtube'
    | 'onecomme'
    | 'external-api'
    | 'websocket'
    | 'idle'
    | 'presence'
    | 'game-commentary'
    | 'slide';
};
```

### 8.2 QueuedMessage

```ts
type MessageType = 'direct_send' | 'ai_generate' | 'user_input';

type QueuedMessage = {
  id: string;
  timestamp: number;
  message: string;
  type: MessageType;
  systemPrompt?: string;
  useCurrentSystemPrompt?: boolean;
  image?: string;
  emotion?: string;
  priority?: 'normal' | 'high';
  interrupt?: boolean;
  source?: string;
};
```

### 8.3 ClientStatus

```ts
type ClientStatus = {
  clientId: string;
  connected: boolean;
  isSpeaking: boolean;
  chatProcessing: boolean;
  messageReceiverEnabled?: boolean;
  modelType?: string;
  aiService?: string;
  voiceEngine?: string;
  externalLinkageMode?: boolean;
  lastSeenAt: number;
};
```

### 8.4 ProviderConfig

```ts
type AiProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'azure'
  | 'xai'
  | 'groq'
  | 'cohere'
  | 'mistralai'
  | 'perplexity'
  | 'fireworks'
  | 'deepseek'
  | 'openrouter'
  | 'lmstudio'
  | 'ollama'
  | 'dify'
  | 'custom-api';
```

### 8.5 VoiceEngine

```ts
type VoiceEngine =
  | 'voicevox'
  | 'koeiromap'
  | 'google'
  | 'stylebertvits2'
  | 'aivis_speech'
  | 'aivis_cloud_api'
  | 'gsvitts'
  | 'elevenlabs'
  | 'openai'
  | 'azure'
  | 'cartesia';
```

---

## 9. AIゲートウェイ仕様

### 9.1 共通インターフェース

```ts
interface AiProviderAdapter {
  validateConfig(config: AiProviderConfig): Promise<ValidationResult>;
  stream(request: AiRequest, signal: AbortSignal): Promise<Response>;
  generate(request: AiRequest, signal: AbortSignal): Promise<AiResult>;
  supportsMultimodal(model: string): boolean;
  supportsReasoning(model: string): boolean;
  supportsSearchGrounding(model: string): boolean;
}
```

### 9.2 AIリクエスト

```ts
type AiRequest = {
  provider: AiProvider;
  model: string;
  messages: Message[];
  systemPrompt?: string;
  temperature?: number;
  maxOutputTokens?: number;
  reasoning?: {
    enabled: boolean;
    effort?: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
    tokenBudget?: number;
  };
  searchGrounding?: {
    enabled: boolean;
    dynamicThreshold?: boolean;
  };
  providerOptions?: Record<string, unknown>;
};
```

### 9.3 カスタムAPI

設定可能項目:

- URL
- headers
- body template
- system messageを含めるか
- image MIME typeを含めるか
- server-side secret override
- reasoning metadata転送
- provider metadata転送
- response text path
- stream形式
- OpenAI互換形式
- timeout
- retry

秘密ヘッダーはクライアントへ返さない。

### 9.4 Dify

- APIキー
- API URL
- conversation ID
- user ID
- streaming
- blocking
- エラー変換
- 会話継続

### 9.5 ローカルLLM

- LM Studio
- Ollama
- URL設定
- モデル設定
- OpenAI互換API
- ループバック既定
- allowlist
- SSRF防止
- 接続診断
- モデル一覧取得は可能なら実装

---

## 10. 音声合成gateway

### 10.1 共通インターフェース

```ts
interface TtsAdapter {
  validateConfig(config: TtsConfig): Promise<ValidationResult>;
  synthesize(
    text: string,
    options: TtsOptions,
    signal: AbortSignal,
  ): Promise<AudioPayload>;
  listVoices?(): Promise<VoiceDefinition[]>;
}
```

### 10.2 VOICEVOX

- server URL
- speaker ID
- speed
- pitch
- intonation
- `/audio_query`
- `/synthesis`
- speaker一覧更新
- 外部サーバーallowlist

### 10.3 AivisSpeech

- server URL
- speaker ID
- speed
- pitch
- intonation scale
- tempo dynamics
- pre phoneme
- post phoneme
- speaker一覧更新

### 10.4 Aivis Cloud API

- API key
- model UUID
- style ID
- style name
- style name利用切替
- speed
- pitch
- emotional intensity
- tempo dynamics
- pre/post phoneme

### 10.5 Style-Bert-VITS2

- server URL
- API key
- model ID
- style
- SDP ratio
- speaking rate

### 10.6 GSVI TTS

- server URL
- model ID
- batch size
- speech rate

### 10.7 その他

Koeiromap、Google TTS、ElevenLabs、OpenAI、Azure、Cartesiaについても各公式API仕様に従いadapterを実装する。

### 10.8 再生キュー

- 一件ずつ再生
- 優先度
- 割り込み
- 全停止
- 発話のみ停止
- キューのみ削除
- 音声キャッシュ
- 文分割
- 長文分割
- テキスト正規化
- 英単語日本語読み変換
- リップシンク連携

---

## 11. キャラクター描画

### 11.1 共通AvatarAdapter

```ts
interface AvatarAdapter {
  load(source: AvatarSource): Promise<void>;
  unload(): void;
  setEmotion(emotion: Emotion): void;
  setLipSync(value: number): void;
  playMotion(name: string): Promise<void>;
  playPose?(name: string): Promise<void>;
  setTransform(transform: AvatarTransform): void;
  resize(width: number, height: number): void;
}
```

### 11.2 VRM

- VRM 0.xと1.0の実用的互換性
- humanoid bone
- expression manager
- `aa`を基本とするリップシンク
- emotion expression
- spring bone
- look-at
- pose JSON
- motion tag解析
- camera framing
- lighting
- model disposal

### 11.3 Live2D

- Cubism 3以降
- model3.json
- textures
- motions
- expressions
- emotion mapping
- motion group mapping
- idle motion
- lip sync
- model switch
- WebGL context loss recovery

Live2D SDKおよびCoreファイルは、ライセンス上再配布できない場合は利用者が正規に配置する。

### 11.4 PNGTuber

- モデルフォルダ
- 待機動画
- 発話動画
- MotionPNGTuber互換
- 音量しきい値
- sensitivity
- scale
- offset X/Y
- chroma key
- color
- tolerance

---

## 12. 長期記憶

### 12.1 保存対象

- ユーザー発言
- アシスタント発言
- 要約
- タグ
- timestamp
- embedding
- source
- session ID

### 12.2 検索

1. 現在の入力からembeddingを生成する。
2. 類似度検索を行う。
3. しきい値未満を除外する。
4. 上限件数を適用する。
5. トークン予算内に整形する。
6. システムプロンプトまたは追加コンテキストへ挿入する。

### 12.3 ストレージ

Windowsローカル版の標準はローカルファイルまたはIndexedDBとする。

任意でSupabase等のremote backendをadapterとして追加できる。

---

## 13. 外部API v1

### 13.1 認証

```http
Authorization: Bearer <AITUBERKIT_API_KEY>
```

APIキー未設定時の挙動はアクセスモードに従う。

### 13.2 `POST /api/v1/speak`

AI生成を行わず、指定テキストを直接発話キューへ入れる。

Request例:

```json
{
  "clientId": "main",
  "text": "こんにちは",
  "emotion": "happy",
  "priority": "high",
  "interrupt": true,
  "image": null
}
```

Response:

```json
{
  "ok": true,
  "clientId": "main",
  "queued": ["msg_xxx"],
  "count": 1
}
```

### 13.3 `POST /api/v1/chat`

```json
{
  "clientId": "main",
  "text": "今日の予定を教えて",
  "mode": "ai_generate",
  "useCurrentSystemPrompt": true,
  "systemPrompt": "",
  "priority": "normal",
  "interrupt": false,
  "image": null
}
```

`mode`:

- `user_input`
- `ai_generate`

### 13.4 `POST /api/v1/messages`

汎用キュー投入API。

`type`:

- `direct_send`
- `ai_generate`
- `user_input`

### 13.5 `POST /api/v1/stop`

`mode`:

- `speech`
- `queue`
- `all`

### 13.6 `GET /api/v1/status`

- client status
- message count
- command count
- last accessed

### 13.7 `GET /api/v1/events`

- recent events
- SSE
- clientId filter
- keepalive
- reconnect

### 13.8 Client API

ブラウザクライアントは、コマンド取得と状態更新を行う。

- `GET /api/v1/client/commands`
- `POST /api/v1/client/status`

### 13.9 キュー

- clientId単位
- 通常優先度
- 高優先度
- 割り込み
- 5分以上非アクティブなキューの清掃
- recent event上限
- 状態heartbeat

---

## 14. アクセスポリシー

### 14.1 モード

- `disabled`
- `protected`
- `demo`
- `unprotected`

### 14.2 protected

- Bearer token必須
- server secret利用可
- write API利用可
- protected resource利用可

### 14.3 demo

- same-originまたはallowedOrigins
- optional demo token
- IP・機能単位レート制限
- trusted proxy設定
- WAF併用
- serverless複数インスタンスでの制限をREADMEへ明記

### 14.4 disabled

- request-provided API keyのみ
- server secretを匿名利用不可
- 保護対象書き込みAPI拒否
- 同一マシンのloopback local serviceは限定許可

### 14.5 restricted mode

Cloudflare等、ファイルシステム非対応環境では以下を無効化する。

- ローカルファイル書き込み
- サーバー資源一覧
- ローカルアップロード
- ローカルログ
- 記憶ファイル直接操作

代替として静的マニフェストを使用する。

---

## 15. Windowsローカル起動

### 15.1 必須環境

- Windows 10 22H2以降
- Windows 11
- Node.js 24.x
- npm 11.x
- EdgeまたはChrome
- WebGL 2
- 8GB RAM以上
- 16GB推奨

### 15.2 `SETUP.bat`

1. 自身のディレクトリへ移動
2. UTF-8コードページ
3. Node.js確認
4. npm確認
5. Node.jsバージョン確認
6. `.env.local`作成
7. `npm ci`
8. Playwright Chromium導入は任意確認
9. 完了表示

### 15.3 `LAUNCH.bat`

1. 自身のディレクトリへ移動
2. npm確認
3. node_modules確認
4. 必要なら`npm ci`
5. ポート確認
6. Next.js起動
7. HTTP疎通待機
8. ブラウザ起動
9. Ctrl+C終了
10. エラー時pause

### 15.4 Windowsパス

- 空白を含むパス
- 日本語を含むパス
- OneDrive配下
- ドライブ変更
- `cd /d "%~dp0"`
- `call npm ...`

### 15.5 標準ポート

| サービス        | ポート |
| --------------- | -----: |
| LocalAITuber    |   3000 |
| VOICEVOX        |  50021 |
| AivisSpeech     |  10101 |
| Ollama          |  11434 |
| LM Studio       |   1234 |
| OneComme        |  11180 |
| 外部WebSocket例 |   8000 |

---

## 16. Electron

### 16.1 必須挙動

- ローカルサーバーの起動待機
- フル画面相当のウィンドウ
- 透明ウィンドウ
- 背景透過
- セキュアなcontextIsolation
- nodeIntegration無効
- production build読み込み
- 開発モードURL読み込み
- 単一インスタンス
- graceful shutdown

### 16.2 セキュリティ改善

参照元の危険な設定をそのまま再現しない。

- `webSecurity`は原則true
- preloadは最小APIのみ
- devToolsは開発時のみ
- CSPを設定
- navigationを制限
- 外部URLをshellへ分離

機能パリティは維持しつつ、安全性は改善する。

---

## 17. デプロイ

### 17.1 Docker

- Dockerfile
- docker-compose
- `.env`
- 3000番ポート
- healthcheck
- volume
- restricted modeとの違い

### 17.2 Vercel

- GitHub連携
- server-side secrets
- protected access mode
- ファイル書き込み制限
- serverless timeout
- Realtime制約の文書化

### 17.3 Cloudflare Workers

- OpenNext
- Wrangler
- preview
- deploy
- secrets
- `NEXT_PUBLIC_RESTRICTED_MODE=true`
- asset manifest
- 25MB超ファイル除外
- 非ASCIIファイル名の扱い
- Node互換性
- route policy

---

## 18. 非機能要件

### 18.1 性能

- 通常画面初期表示: 5秒以内目標
- キャラクター描画: 30FPS以上
- 推奨: 60FPS
- UI応答: 100ms以内目標
- 外部API呼出し中もUIをブロックしない
- モデル切替時に古いGPUリソースを破棄
- 画像キャプチャ時のメモリリーク防止
- 発話キュー上限
- APIキュー上限

### 18.2 可用性

各プロバイダー障害は局所化する。

- AI停止時もモデル表示可
- TTS停止時もテキスト会話可
- YouTube停止時も通常会話可
- 記憶停止時も短期履歴会話可
- カメラ拒否時も他モード利用可

### 18.3 アクセシビリティ

- aria-label
- キーボード操作
- フォーカス表示
- 字幕
- 文字サイズ
- 色以外の状態表現
- RTL対応
- モーション低減設定を検討

### 18.4 保守性

- provider adapter
- avatar adapter
- TTS adapter
- speech recognition adapter
- storage adapter
- deployment adapter
- Zod validation
- typed errors
- no implicit any
- 依存関係固定
- migration
- feature flag

---

## 19. セキュリティ

### 19.1 秘密情報

- server-side API keyを`NEXT_PUBLIC_`にしない
- Realtimeでブラウザキーが必要な場合は明確な警告を表示
- 可能ならephemeral tokenを利用
- Authorizationをログへ出さない
- diagnosticsで秘密値を返さない
- `.env.local`をGit対象外

### 19.2 SSRF

ローカルTTS、LM Studio、Ollama、Custom API URLについて:

- scheme検証
- loopback既定
- allowed origins
- DNS rebinding対策
- redirect再検証
- private network policy
- timeout
- response size limit

### 19.3 ファイル

- basename検証
- 拡張子検証
- MIME検証
- サイズ上限
- path traversal拒否
- zip展開時のZip Slip防止
- executable拒否
- 上書き確認
- ファイル名正規化

### 19.4 API

- method制限
- Zod
- body size
- rate limit
- origin
- CSRF相当対策
- Bearer token
- trace ID
- safe error
- queue flood防止
- SSE接続上限

### 19.5 キオスク

- 設定画面保護
- パスコード平文表示禁止
- NGワード
- 文字数上限
- 外部リンク無効化
- ファイルアップロード無効化設定
- 管理者解除手順

---

## 20. テスト

### 20.1 単体テスト

- AI provider registry
- 各provider config validation
- custom API mapping
- reasoning option mapping
- TTS request builder
- speech timeout
- silence detection
- lip sync normalization
- emotion mapping
- message queue
- priority
- interrupt
- stop mode
- client cleanup
- access policy
- origin validation
- rate limiting
- file path validation
- memory similarity
- context token budget
- YouTube continuity state machine
- idle scheduler
- presence state machine
- game commentary scheduler
- slide parser
- embed config
- settings migration

### 20.2 統合テスト

- AI route
- TTS routes
- Whisper
- embedding
- memory files
- chat log
- resource upload/delete
- YouTube
- v1 API
- SSE events
- WebSocket reconnect
- Supabase optional
- restricted mode

### 20.3 E2E

最低限、以下のシナリオを自動化する。

1. Windows相当のローカル起動
2. VRM表示
3. Live2D表示
4. PNGTuber表示
5. テキストチャット
6. 画像付きチャット
7. Browser speech recognitionのUI
8. Whisper mock
9. TTS全adapterのmock
10. リップシンク
11. YouTube mock
12. OneComme mock
13. 長期記憶
14. Realtime mock
15. Audio mode mock
16. WebSocket
17. 外部API v1
18. キオスク
19. 人感検知mock
20. アイドル
21. ゲーム実況mock
22. スライド
23. 埋め込み
24. 設定保存
25. 言語切替
26. restricted mode
27. Electron smoke test

### 20.4 品質ゲート

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build
npm run test:e2e
```

機能追加PRでは、対象adapterのcontract testを必須とする。

---

## 21. 実装フェーズ

全フェーズが最終スコープである。途中フェーズを最終リリースとしない。

### Phase 0: 調査・基盤・パリティ管理

- 新規Next.jsプロジェクト
- TypeScript
- Tailwind
- lint
- format
- unit test
- Playwright
- env validation
- error model
- logger
- Windows setup
- Windows launch
- `FEATURE_MATRIX.md`
- 基準コミット記録
- 参照リポジトリの機能再棚卸し

完了条件:

- 基本コマンド成功
- Windows起動
- matrixに全既知機能が存在
- 未調査項目が明示されている

### Phase 1: UI・設定・国際化

- メイン画面
- 紹介画面
- メニュー
- 設定シェル
- chat log
- assistant text
- themes
- i18n全言語
- 設定永続化
- migration
- env override

### Phase 2: AI gateway

- provider interfaces
- OpenAI
- Anthropic
- Google
- Azure
- xAI
- Groq
- Cohere
- Mistral
- Perplexity
- Fireworks
- DeepSeek
- OpenRouter
- LM Studio
- Ollama
- Dify
- Custom API
- streaming
- reasoning
- grounding
- multimodal

### Phase 3: VRM

- model list
- upload
- renderer
- pose
- motion
- emotion
- lip sync
- thinking pose
- transforms
- lighting

### Phase 4: Live2D・PNGTuber

- Live2D integration
- emotion mapping
- motion groups
- PNGTuber
- video switching
- chroma key
- transforms

### Phase 5: 音声入力

- browser recognition
- Whisper
- silence detection
- continuous microphone
- permissions
- timeouts

### Phase 6: 音声合成

- VOICEVOX
- Koeiromap
- Google
- Style-Bert-VITS2
- AivisSpeech
- Aivis Cloud
- GSVI
- ElevenLabs
- OpenAI
- Azure
- Cartesia
- queue
- interruption
- lip sync

### Phase 7: Realtime・Audio

- Realtime API
- function tools
- text/audio input
- Audio mode
- state machine
- cancellation
- ephemeral auth検討

### Phase 8: 長期記憶・ログ

- embedding
- RAG
- memory files
- restore
- local sync
- chat log JSON
- optional Supabase

### Phase 9: YouTube・OneComme

- YouTube API
- polling
- OneComme
- comment queue
- continuity
- new topic
- sleep

### Phase 10: デモ運用

- kiosk
- presence
- idle
- fullscreen
- unlock gestures
- camera settings
- greeting/departure

### Phase 11: ゲーム実況・スライド

- capture
- commentary
- background analysis
- slide mode
- slide conversion
- editor
- auto presentation

### Phase 12: 外部連携

- WebSocket
- message receiver
- send-message page
- v1 API
- queue
- status
- commands
- events
- SSE

### Phase 13: 埋め込み・素材管理

- embed.js
- embed routes
- allowed origins
- postMessage
- asset list
- upload
- delete
- manifest
- restricted mode

### Phase 14: Electron・Docker・クラウド

- Electron
- Docker
- Vercel
- Cloudflare
- OpenNext
- Wrangler
- WAF config
- production security

### Phase 15: 完全パリティ監査

- README再比較
- `.env.example`再比較
- source tree再比較
- API route再比較
- settings再比較
- test再比較
- matrixの未実装行をゼロにする
- ライセンス監査
- Windows実機テスト
- ドキュメント完成

---

## 22. 受入基準

### AC-001 完全パリティ

`FEATURE_MATRIX.md` の必須行がすべて `Done` である。

### AC-002 Windows

クリーンなWindows環境で `SETUP.bat` と `LAUNCH.bat` により起動できる。

### AC-003 キャラクター

VRM、Live2D、PNGTuberの各形式を、利用者が正規に用意したモデルで表示できる。

### AC-004 AI

すべての定義済みAI provider adapterが、実接続または公式互換mock contract testを通る。

### AC-005 音声

すべての定義済みTTS adapterが、実接続またはcontract testを通る。

### AC-006 配信

YouTube APIとOneCommeの双方でコメントを取得し、自動応答できる。

### AC-007 高度モード

Realtime、Audio、Reasoning、Memory、Kiosk、Presence、Idle、Game Commentary、Slideが動作する。

### AC-008 外部制御

WebSocket、message receiver、`/api/v1`が動作する。

### AC-009 埋め込み

複数embed IDを設定し、許可オリジンを制御できる。

### AC-010 セキュリティ

秘密値がクライアントbundle、ログ、診断レスポンスへ露出しない。

### AC-011 テスト

format、lint、typecheck、unit、integration、build、E2Eが成功する。

### AC-012 ライセンス

第三者SDK、モデル、画像、音声、フォント、ロゴのライセンス一覧が存在する。

---

## 23. ライセンス

参照リポジトリはカスタムライセンスであるため、本プロジェクトはソースコードや素材を複製しない。

特に以下を個別管理する。

- Live2D Cubism SDK
- Live2D Core
- Live2Dモデル
- VRMモデル
- PNGTuber素材
- VOICEVOXおよび各音声ライブラリ
- キャラクターボイス
- 背景画像
- スライド素材
- 効果音
- ロゴ
- フォント

必要ファイル:

- `MODEL_LICENSES.md`
- `THIRD_PARTY_NOTICES.md`
- `ASSET_LICENSES.md`

---

## 24. Codex運用ルール

1. `SPECIFICATION.md`を正とする。
2. `FEATURE_MATRIX.md`を進捗の正とする。
3. 参照元の追加機能を発見したらmatrixへ追加する。
4. 未実装行を削除して帳尻を合わせない。
5. 各Phase開始前に対象機能IDを宣言する。
6. 各Phase終了時にmatrixを更新する。
7. 品質ゲートが失敗した状態で完了報告しない。
8. 実サービスを必要とするテストにはcontract mockを用意する。
9. 実接続手順もREADMEへ記載する。
10. 秘密情報をコミットしない。
11. 参照コードをコピーしない。
12. 素材をコピーしない。
13. ライセンスが必要なSDKは利用者配置方式を許可する。
14. Windowsを常に主要検証環境とする。
15. セキュリティ上危険な実装は機能を保ったまま改善する。
16. Phaseを飛ばす場合は依存関係と理由を記録する。
17. 完全パリティ監査を最後に必ず実施する。

---

## 25. 完成成果物

- 動作するソースコード
- README
- 完全仕様書
- 機能マトリクス
- AGENTS.md
- 環境変数サンプル
- Windowsセットアップ
- Windows起動
- macOS起動
- Electron
- Docker
- Vercel手順
- Cloudflare手順
- API仕様
- 埋め込み仕様
- 外部連携サンプル
- テスト
- ライセンス一覧
- 既知制限
- セキュリティ文書
- Windows実機検証記録
