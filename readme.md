# Orchestration Codex SDK Samples

Codex SDK (@openai/codex-sdk) を前提に、ローカルでマルチエージェント風オーケストレーションと安全な差分生成を行うための最小セットです。

- `AGENTS.md`: Codex オーケストレーターの人格・行動規範テンプレート。
- `src/codex/orchestrator.ts`: Backend / Frontend / Testing それぞれの役割を順に走らせるサンプル実装。
- `src/codex/patchAgent.ts`: 既存ファイルの内容＋ゴールから apply_patch 互換 diff を生成するヘルパー。

## なぜ OPENAI_API_KEY が必要か
Codex SDK は OpenAI API を直接呼び出します。ChatGPT Plus の購読だけでは CLI／SDK が認証されないため、**OpenAI ダッシュボードで取得した API キー**を環境変数 `OPENAI_API_KEY` に設定する必要があります。

```bash
export OPENAI_API_KEY=sk-xxxx
```

## セットアップ
```bash
npm install
```

## 具体的な動かし方
以下は Node 18+ 環境を前提としています。`npm install` 後にお好みの TypeScript ランナーで実行してください。

### 1. オーケストレーターを動かす
```bash
# TypeScript をビルドして実行する場合
npx tsc
node dist/codex/orchestrator.js

# tsx を使ってトランスパイルなしで実行する場合
npx tsx src/codex/orchestrator.ts
```
実行すると `implementFeature()` の結果が標準出力に流れ、Backend/Frontend/Testing の Markdown プランを確認できます。`implementFeature()` に渡す要望文字列を変更すれば別案件にも使えます。

### 2. PatchAgent で差分を生成する
```bash
npx tsx src/codex/patchAgent.ts
```
`createPatch()` に `filePath` / `currentContent` / `goal` を渡すだけで apply_patch 互換の diff を返します。実運用では対象ファイルを読み込んで `currentContent` に入れ、返ってきた diff を `git apply` 等で適用してください。

## 動作確認について
現在の環境ではネットワーク制限があり、`npm install` や Codex API 呼び出しを実際に行えていません。**上記コマンドの実機検証は未実施**です。API キーを設定したうえで、ご自身の環境で動作確認をお願いします。

## カスタマイズのヒント
- `AGENTS.md` をプロジェクト固有のルールに合わせて調整すれば、Codex CLI/SDK から一貫した振る舞いを引き出せます。
- オーケストレーターの各スレッドに追加のコンテキスト（既存仕様、コード抜粋など）をコピーすることでより正確なプランを得られます。
- PatchAgent の prompt にリポジトリ構造や命名規則を追記すると、より的確な diff を返してくれます。

## 参考文献
- [OpenAI Codex SDK 公式ドキュメント](https://platform.openai.com/docs/guides/codex)
