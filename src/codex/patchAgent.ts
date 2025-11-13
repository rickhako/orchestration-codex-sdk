import { Codex } from "@openai/codex-sdk";

declare const require: any;
declare const module: any;
declare const process: any;

const codex = new Codex();

export interface PatchParams {
  filePath: string;
  currentContent: string;
  goal: string;
}

/**
 * 1ファイルに対する安全なパッチを Codex に考えさせるヘルパー関数。
 *
 * - filePath: 対象ファイルのパス（ログや説明用）
 * - currentContent: ファイルの現在の中身
 * - goal: 「何をしたいか」の説明（例: "null のときにデフォルト値を返すようにバグ修正")
 */
export async function createPatch(params: PatchParams) {
  const thread = codex.startThread();

  const prompt = [
    "You are PatchAgent.",
    "You edit existing TypeScript/JavaScript code in a safe and minimal way.",
    "",
    `Target file path: ${params.filePath}`,
    "",
    "Current file content:",
    "```ts",
    params.currentContent,
    "```",
    "",
    "Goal:",
    params.goal,
    "",
    "Constraints:",
    "- Keep changes as small as possible.",
    "- Avoid breaking public APIs (exported functions/types) unless absolutely necessary.",
    "- Do not introduce syntax errors.",
    "",
    "Output format:",
    "- Return a unified diff that is compatible with apply_patch style:",
    "",
    "Example:",
    "*** Begin Patch",
    "*** Update File: path/to/file.ts",
    "@@",
    "- old line",
    "+ new line",
    "*** End Patch",
    "",
    "Now return ONLY the patch (and if needed, add 1–2 lines of short explanation after the patch).",
  ].join("\n");

  const result = await thread.run(prompt);

  return result;
}

// 単体テスト的に試すとき用の簡単な main
if (require.main === module) {
  (async () => {
    const patch = await createPatch({
      filePath: "src/example.ts",
      currentContent: `
export function greet(name?: string) {
  return "Hello, " + name.toUpperCase();
}
      `.trim(),
      goal: "name が undefined のときに 'world' を使い、エラーにならないように修正してください。",
    });

    console.log(patch);
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
