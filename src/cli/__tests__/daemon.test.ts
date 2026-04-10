import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { daemonCommand } from "../daemon.js";
import { runOmxDaemonOnce } from "../../daemon/index.js";

async function withTempCwd(fn: (cwd: string) => Promise<void>): Promise<void> {
  const cwd = await mkdtemp(join(tmpdir(), "omx-daemon-cli-"));
  const previous = process.cwd();
  process.chdir(cwd);
  try {
    await fn(cwd);
  } finally {
    process.chdir(previous);
    await rm(cwd, { recursive: true, force: true });
  }
}

async function writeDaemonConfig(cwd: string, config: Record<string, unknown>): Promise<void> {
  await writeFile(
    join(cwd, ".omx", "daemon", "daemon.config.json"),
    JSON.stringify(config, null, 2),
  );
}

describe("omx daemon CLI", () => {
  it("prints command-local help", async () => {
    const lines: string[] = [];
    await daemonCommand(["--help"], {
      stdout: (line) => lines.push(line),
      stderr: (line) => lines.push(line),
    });
    assert.match(lines.join("\n"), /omx daemon scaffold/);
    assert.match(lines.join("\n"), /omx daemon start/);
    assert.match(lines.join("\n"), /omx daemon approve <item-id>/);
    assert.match(lines.join("\n"), /\$setup-omx-daemon is the guided onboarding wrapper/i);
  });

  it("scaffolds daemon governance files from the CLI", async () => {
    const lines: string[] = [];
    await withTempCwd(async () => {
      await daemonCommand(["scaffold"], {
        stdout: (line) => lines.push(line),
        stderr: (line) => lines.push(line),
      });
      assert.match(lines.join("\n"), /Scaffolded daemon governance files/);
    });
  });

  it("defaults to status and explains setup before daemon initialization", async () => {
    const lines: string[] = [];
    await withTempCwd(async () => {
      await daemonCommand([], {
        stdout: (line) => lines.push(line),
        stderr: (line) => lines.push(line),
      });
      assert.match(lines.join("\n"), /not initialized/i);
      assert.match(lines.join("\n"), /\$setup-omx-daemon|scaffold \.omx\/daemon/i);
    });
  });

  it("surfaces missing-credential guidance after daemon scaffolding", async () => {
    const previousGhToken = process.env.GH_TOKEN;
    const previousGithubToken = process.env.GITHUB_TOKEN;
    const previousPath = process.env.PATH;
    const lines: string[] = [];
    delete process.env.GH_TOKEN;
    delete process.env.GITHUB_TOKEN;
    process.env.PATH = "";
    try {
      await withTempCwd(async () => {
        await daemonCommand(["scaffold"], {
          stdout: () => undefined,
          stderr: () => undefined,
        });
        await daemonCommand(["status"], {
          stdout: (line) => lines.push(line),
          stderr: (line) => lines.push(line),
        });
      });
      assert.match(lines.join("\n"), /credentials are missing/i);
      assert.match(lines.join("\n"), /GH_TOKEN|GITHUB_TOKEN|gh auth token/i);
    } finally {
      if (typeof previousGhToken === "string") process.env.GH_TOKEN = previousGhToken;
      else delete process.env.GH_TOKEN;
      if (typeof previousGithubToken === "string") process.env.GITHUB_TOKEN = previousGithubToken;
      else delete process.env.GITHUB_TOKEN;
      if (typeof previousPath === "string") process.env.PATH = previousPath;
      else delete process.env.PATH;
    }
  });

  it("reports the stopped state when credentials are configured but the daemon is not running", async () => {
    const previousGhToken = process.env.GH_TOKEN;
    const lines: string[] = [];
    process.env.GH_TOKEN = "test-token";
    try {
      await withTempCwd(async (cwd) => {
        await daemonCommand(["scaffold"], {
          stdout: () => undefined,
          stderr: () => undefined,
        });
        await writeDaemonConfig(cwd, {
          repository: "octo/example",
          githubCredentialSource: "env",
          githubTokenEnvVar: "GH_TOKEN",
        });
        await daemonCommand(["status"], {
          stdout: (line) => lines.push(line),
          stderr: (line) => lines.push(line),
        });
      });
      assert.match(lines.join("\n"), /Daemon is stopped/i);
      assert.match(lines.join("\n"), /queued=0, approved=0, rejected=0, published=0, total=0/);
    } finally {
      if (typeof previousGhToken === "string") process.env.GH_TOKEN = previousGhToken;
      else delete process.env.GH_TOKEN;
    }
  });

  it("surfaces insufficient-permission guidance after a failed poll", async () => {
    const previousGhToken = process.env.GH_TOKEN;
    const lines: string[] = [];
    const originalFetch = globalThis.fetch;
    process.env.GH_TOKEN = "test-token";
    globalThis.fetch = (async () => new Response("Resource not accessible by integration", { status: 403 })) as typeof fetch;
    try {
      await withTempCwd(async (cwd) => {
        await daemonCommand(["scaffold"], {
          stdout: () => undefined,
          stderr: () => undefined,
        });
        await writeDaemonConfig(cwd, {
          repository: "octo/example",
          githubCredentialSource: "env",
          githubTokenEnvVar: "GH_TOKEN",
        });
        const runOnce = await runOmxDaemonOnce(cwd);
        if (runOnce.message) lines.push(runOnce.message);
        if (runOnce.error) lines.push(runOnce.error);
        await daemonCommand(["status"], {
          stdout: (line) => lines.push(line),
          stderr: (line) => lines.push(line),
        });
      });
      assert.match(lines.join("\n"), /permissions are insufficient/i);
      assert.match(lines.join("\n"), /issue-read permission/i);
    } finally {
      globalThis.fetch = originalFetch;
      if (typeof previousGhToken === "string") process.env.GH_TOKEN = previousGhToken;
      else delete process.env.GH_TOKEN;
    }
  });
});
