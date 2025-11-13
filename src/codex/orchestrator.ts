// Node 18+ / TypeScript 前提
// 事前に: npm install @openai/codex-sdk

import { Codex } from "@openai/codex-sdk";

declare const require: any;
declare const module: any;
declare const process: any;

// Codex インスタンスはプロセス内で 1 個共有してOK
const codex = new Codex();

export interface OrchestratedPlans {
  backendSpec: unknown;
  frontendPlan: unknown;
  tests: unknown;
}

/**
 * 1 つのユーザー要望に対して:
 * - BackendAgent（CI/DB/API 設計・実装プラン）
 * - FrontendAgent（UI/UX・コンポーネント設計）
 * - TestingAgent（Jest / Playwright テスト）
 * を順番に走らせる「オーケストレーション」関数。
 */
export async function implementFeature(userRequest: string): Promise<OrchestratedPlans> {
  // 役割ごとにスレッドを切る（コンテキストが分かれる）
  const backendThread = codex.startThread();
  const frontendThread = codex.startThread();
  const testingThread = codex.startThread();

  // 1. BackendAgent: API / DB / 実装方針
  const backendSpec = await backendThread.run(
    [
      "You are BackendAgent.",
      "You design and implement backend APIs, DB schemas, and authentication.",
      "",
      "User request:",
      userRequest,
      "",
      "Return in Markdown:",
      "- High-level API design (endpoints, methods, request/response shapes)",
      "- DB schema changes (tables / fields / relations)",
      "- Implementation plan (steps) for the backend",
    ].join("\n")
  );

  // 2. FrontendAgent: UI / ページ構成
  const frontendPlan = await frontendThread.run(
    [
      "You are FrontendAgent.",
      "You design and implement Next.js pages and React components.",
      "",
      "User request:",
      userRequest,
      "",
      "Here is the backend specification you must integrate with:",
      String(backendSpec),
      "",
      "Return in Markdown:",
      "- Page/component structure",
      "- Routing plan",
      "- State management strategy",
      "- Notes on UX / validation / loading states",
    ].join("\n")
  );

  // 3. TestingAgent: Jest / Playwright テスト設計
  const tests = await testingThread.run(
    [
      "You are TestingAgent.",
      "You design Jest unit tests and Playwright E2E tests.",
      "",
      "User request:",
      userRequest,
      "",
      "Backend spec:",
      String(backendSpec),
      "",
      "Frontend plan:",
      String(frontendPlan),
      "",
      "Return in Markdown:",
      "- Jest test cases (file names + describe/it ideas)",
      "- Playwright scenarios (user journeys)",
      "- Any edge cases to be careful about",
    ].join("\n")
  );

  // 必要ならここで結果をまとめて返す
  return {
    backendSpec,
    frontendPlan,
    tests,
  };
}

// シンプルな実行例（node/tsx 等で）
if (require.main === module) {
  (async () => {
    const result = await implementFeature(
      "新規ユーザー登録 + メール認証付きログインフローを作りたい"
    );

    console.log("=== BackendSpec ===");
    console.log(result.backendSpec);
    console.log("=== FrontendPlan ===");
    console.log(result.frontendPlan);
    console.log("=== Tests ===");
    console.log(result.tests);
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
