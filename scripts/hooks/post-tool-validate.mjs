import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const EDIT_TOOLS = new Set(["apply_patch", "create_file", "vscode_renameSymbol"]);
const LINTABLE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);

function emit(output) {
  process.stdout.write(JSON.stringify(output));
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function toWorkspacePath(filePath, workspaceRoot) {
  if (!filePath || typeof filePath !== "string") {
    return null;
  }

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  return path.resolve(workspaceRoot, filePath);
}

function parsePatchFiles(patchInput) {
  if (typeof patchInput !== "string") {
    return [];
  }

  const matches = patchInput.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+?)(?: -> .+)?$/gm);
  return [...matches].map((match) => match[1].trim());
}

function collectTouchedFiles(payload, workspaceRoot) {
  const toolInput = payload.tool_input ?? {};

  if (payload.tool_name === "apply_patch") {
    return parsePatchFiles(toolInput.input).map((filePath) => toWorkspacePath(filePath, workspaceRoot));
  }

  if (payload.tool_name === "create_file") {
    return [toWorkspacePath(toolInput.filePath, workspaceRoot)];
  }

  if (payload.tool_name === "vscode_renameSymbol") {
    return [toWorkspacePath(toolInput.filePath, workspaceRoot)];
  }

  return [];
}

function runCommand(command, args, workspaceRoot) {
  return spawnSync(command, args, {
    cwd: workspaceRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8,
  });
}

function summarize(result) {
  return [result.stdout, result.stderr].filter(Boolean).join("\n").trim().slice(0, 4000);
}

function main() {
  const rawInput = fs.readFileSync(0, "utf8");
  const payload = rawInput ? JSON.parse(rawInput) : {};
  const workspaceRoot = payload.cwd || process.cwd();

  if (payload.hookEventName !== "PostToolUse" || !EDIT_TOOLS.has(payload.tool_name)) {
    emit({ continue: true });
    return;
  }

  const touchedFiles = collectTouchedFiles(payload, workspaceRoot)
    .filter(Boolean)
    .filter((filePath, index, allFiles) => allFiles.indexOf(filePath) === index);

  const lintableFiles = touchedFiles.filter((filePath) => {
    const extension = path.extname(filePath).toLowerCase();
    return LINTABLE_EXTENSIONS.has(extension) && fs.existsSync(filePath);
  });

  if (lintableFiles.length > 0) {
    const formatResult = runCommand("npx", ["eslint", "--fix", ...lintableFiles], workspaceRoot);
    if (formatResult.status !== 0) {
      const message = summarize(formatResult) || "ESLint auto-fix failed.";
      emit({
        decision: "block",
        reason: "Hook formatting failed.",
        systemMessage: message,
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: message,
        },
      });
      process.exit(2);
    }
  }

  const lintResult = runCommand(npmCommand(), ["run", "lint"], workspaceRoot);
  if (lintResult.status !== 0) {
    const message = summarize(lintResult) || "npm run lint failed.";
    emit({
      decision: "block",
      reason: "Hook lint validation failed.",
      systemMessage: message,
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: message,
      },
    });
    process.exit(2);
  }

  const typecheckResult = runCommand(npmCommand(), ["run", "typecheck"], workspaceRoot);
  if (typecheckResult.status !== 0) {
    const message = summarize(typecheckResult) || "npm run typecheck failed.";
    emit({
      decision: "block",
      reason: "Hook typecheck validation failed.",
      systemMessage: message,
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: message,
      },
    });
    process.exit(2);
  }

  emit({
    continue: true,
    systemMessage: `Hook checks passed for ${touchedFiles.length} edited file(s).`,
  });
}

main();