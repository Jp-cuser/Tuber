# Codex開始用プロンプト — 完全機能版

新しい空のGitリポジトリに、Windowsローカルで動作する `LocalAITuber` を実装してください。

## 正となる文書

1. `SPECIFICATION.md`
2. `FEATURE_MATRIX.md`
3. `AGENTS.md`

## 参照元

- Repository: `tegnike/aituber-kit`
- Branch: `main`
- Baseline commit: `198dbe1d5f8a7f86f9b527c7f0fd1eb3fc9d0988`

参照元は機能調査のためにのみ使用してください。ソースコード、画像、ロゴ、モデル、音声、固有UIをコピーしてはいけません。

## 最終目標

`FEATURE_MATRIX.md` の全Required行を実装すること。

ただし、一度に全機能を実装しないでください。今回はPhase 0だけを実装し、品質ゲートを通したところで停止してください。

## Phase 0の作業

1. Next.js 15.5系、React 18.3系、TypeScriptのプロジェクトを作成
2. Tailwind CSS
3. Zustand
4. Zod
5. i18nextの基盤
6. ESLint
7. Prettier
8. Jest / Testing Library
9. Playwright
10. typed error model
11. logger
12. environment validation
13. access policyの型と基本判定
14. Windows `SETUP.bat`
15. Windows `LAUNCH.bat`
16. Node.js 24確認
17. HTTP疎通後のブラウザ起動
18. 最小のトップページ
19. diagnosticsの最小版
20. `FEATURE_MATRIX.md`の検証
21. 参照リポジトリの再調査と不足行の追加
22. README

## 必須ルール

- 空の新規プロジェクトから開始する。
- 参照コードをコピーしない。
- `.env.local`をコミットしない。
- APIキーを`NEXT_PUBLIC_*`へ置かない。
- 標準バインドは`127.0.0.1`。
- Windowsの日本語パスと空白パスに対応する。
- バッチでは`cd /d "%~dp0"`を使用する。
- バッチからnpmを呼ぶ場合は`call npm ...`を使用する。
- ブラウザ起動は固定待機ではなくHTTP疎通を使う。
- `any`を原則使用しない。
- 外部入力はZodで検証する。
- 依存追加は目的をREADMEまたは作業報告へ記録する。
- Phase 1以降を実装しない。

## 必須npm scripts

```json
{
  "dev": "next dev --hostname 127.0.0.1",
  "build": "next build",
  "start": "next start --hostname 127.0.0.1",
  "lint": "eslint .",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "tsc --noEmit",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:integration": "jest --selectProjects integration",
  "test:e2e": "playwright test"
}
```

実際のテスト構成に合わせて同等コマンドへ調整して構いません。

## 作業手順

1. 参照リポジトリのREADME、`.env.example`、主要ディレクトリ、APIルートを調査する。
2. `FEATURE_MATRIX.md`に不足項目があれば追加する。
3. 作成予定ファイルを列挙する。
4. Phase 0を実装する。
5. Windowsスクリプトを静的検証する。
6. 次のコマンドを実行する。

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

7. 可能であればE2E smoke testを実行する。
8. 失敗を修正し、再実行する。
9. `FEATURE_MATRIX.md`のPhase 0対象行を更新する。
10. Phase 0の完了報告を行い停止する。

## 完了報告に含めるもの

- 作成・変更ファイル
- 採用バージョン
- 追加したmatrix行
- 実行コマンド
- 結果
- Windows起動手順
- セキュリティ上の判断
- 残課題
- 次のPhase候補

Phase 1へは進まないでください。
