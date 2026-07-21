const { execFileSync } = require("node:child_process");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");

const outputDir = mkdtempSync(join(tmpdir(), "app-scanner-front-tests-"));
const tscScript = join(process.cwd(), "node_modules", "typescript", "bin", "tsc");

try {
  execFileSync(
    process.execPath,
    [
      tscScript,
      "src/utils/cameraPreference.ts",
      "src/utils/cameraPreference.test.ts",
      "--outDir",
      outputDir,
      "--module",
      "commonjs",
      "--moduleResolution",
      "node",
      "--target",
      "es2022",
      "--types",
      "node",
      "--skipLibCheck"
    ],
    { stdio: "inherit" }
  );

  execFileSync(process.execPath, ["--test", join(outputDir, "cameraPreference.test.js")], { stdio: "inherit" });
} finally {
  rmSync(outputDir, { recursive: true, force: true });
}
