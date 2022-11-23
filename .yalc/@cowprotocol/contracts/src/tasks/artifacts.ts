import { promises as fs } from "fs";
import path from "path";

import globby from "globby";
import { TASK_COMPILE_SOLIDITY_EMIT_ARTIFACTS } from "hardhat/builtin-tasks/task-names";
import { subtask } from "hardhat/config";

const projectRoot = path.join(__dirname, "../..");
const artifactsRoot = path.join(projectRoot, "build/artifacts/src/contracts");
const exportedArtifactsRoot = path.join(projectRoot, "lib/contracts");

async function copyArtifacts(): Promise<void> {
  const artifacts = await globby(["**/*.json", "!**/*.dbg.json", "!test/"], {
    cwd: artifactsRoot,
  });

  await fs.mkdir(exportedArtifactsRoot, { recursive: true });
  for (const artifact of artifacts) {
    const { base } = path.parse(artifact);

    const artifactPath = path.join(artifactsRoot, artifact);
    const exportedArtifactPath = path.join(exportedArtifactsRoot, base);
    await fs.copyFile(artifactPath, exportedArtifactPath);
  }
}

export function setupCopyArtifactsTask(): void {
  subtask(TASK_COMPILE_SOLIDITY_EMIT_ARTIFACTS).setAction(
    async (_args, _hre, runSuper) => {
      const result = await runSuper();
      await copyArtifacts();
      return result;
    },
  );
}
