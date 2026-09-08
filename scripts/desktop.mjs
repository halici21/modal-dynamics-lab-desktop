import { cp, mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (process.platform !== "win32")
  throw new Error("This build helper targets Windows.");
const mode = process.argv[2] ?? "build";
if (!["build", "dev"].includes(mode)) throw new Error("Use build or dev.");
const stage = path.join(
  process.env.LOCALAPPDATA,
  "ModalDynamicsLab",
  "build-v0",
);
const env = {
  ...process.env,
  Path:
    path.join(process.env.USERPROFILE, ".cargo", "bin") +
    path.delimiter +
    process.env.Path,
};
function run(args, cwd = root) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd, env, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error("Command exited " + code)),
    );
  });
}
const cli = path.join(root, "node_modules", "@tauri-apps", "cli", "tauri.js");
if (mode === "build") {
  await run([
    path.join(root, "node_modules", "typescript", "bin", "tsc"),
    "--noEmit",
  ]);
  await run([
    path.join(root, "node_modules", "vite", "bin", "vite.js"),
    "build",
  ]);
}
await mkdir(path.join(stage, "src-tauri"), { recursive: true });
for (const item of [
  "Cargo.toml",
  "Cargo.lock",
  "build.rs",
  "tauri.conf.json",
  "src",
  "capabilities",
  "icons",
])
  await cp(
    path.join(root, "src-tauri", item),
    path.join(stage, "src-tauri", item),
    { recursive: true, force: true },
  );
await cp(path.join(root, "package.json"), path.join(stage, "package.json"), {
  force: true,
});
if (mode === "build")
  await cp(path.join(root, "dist"), path.join(stage, "dist"), {
    recursive: true,
    force: true,
  });
const override = {
  build:
    mode === "build"
      ? { beforeBuildCommand: "" }
      : { beforeDevCommand: { script: "npm run dev", cwd: root } },
};
await writeFile(
  path.join(stage, "workflow-override.json"),
  JSON.stringify(override),
);
console.log("Native compilation workspace: " + stage);
await run([cli, mode, "--config", "workflow-override.json"], stage);
if (mode === "build") {
  await cp(
    path.join(stage, "src-tauri", "Cargo.lock"),
    path.join(root, "src-tauri", "Cargo.lock"),
  );
  const output = path.join(root, "artifacts");
  await mkdir(output, { recursive: true });
  await cp(
    path.join(
      stage,
      "src-tauri",
      "target",
      "release",
      "modal-dynamics-lab.exe",
    ),
    path.join(output, "modal-dynamics-lab.exe"),
  );
  const bundle = path.join(
    stage,
    "src-tauri",
    "target",
    "release",
    "bundle",
    "nsis",
  );
  for (const file of await readdir(bundle))
    if (file.endsWith("-setup.exe"))
      await cp(path.join(bundle, file), path.join(output, file));
  console.log("Windows executable and installer copied to " + output);
}
