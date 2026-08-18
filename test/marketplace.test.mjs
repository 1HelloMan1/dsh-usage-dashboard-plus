import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("package exposes an installable DSH bundle", async () => {
  const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const patch = await readFile(new URL("../cordis.patch.yml", import.meta.url), "utf8");

  assert.equal(manifest.dsh?.bundle?.patch, "./cordis.patch.yml");
  assert.equal(manifest.dsh?.client?.platform, "web");
  assert.equal(manifest.exports?.["."], "./lib/index.js");
  assert.equal(manifest.exports?.["./client"], "./lib/client.js");
  assert.ok(manifest.files.includes("cordis.patch.yml"));
  assert.ok(manifest.keywords.includes("dsh-plugin"));
  assert.match(patch, /id:\s*usage-dashboard/);
  assert.match(patch, /name:\s*['"]dsh-usage-dashboard-plus['"]/);
});
