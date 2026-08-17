// tools/verify.js — the equivalent of SaveBuddy's typecheck/lint/test/build/e2e
// gate, sized correctly for a single dependency-free static HTML file.
//
// One-time setup (only needed once per machine, not per run):
//   cd tools
//   npm install playwright
//   npx playwright install chromium
//
// Run from the repo root:
//   node tools/verify.js
//
// This is NOT turning The Yield into an npm project — the app itself stays a
// single dependency-free HTML file. This tooling dependency lives only here,
// in tools/, for verification purposes.

const fs = require("fs");
const path = require("path");

function findCurrentAppFile(repoRoot) {
  const target = path.join(repoRoot, "index.html");
  if (!fs.existsSync(target)) {
    throw new Error(
      `Expected index.html at the repo root, not found. The live app must be named exactly ` +
      `"index.html" — GitHub Pages falls back to rendering the README instead of the app if it's missing or renamed.`
    );
  }
  return target;
}

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const appFile = findCurrentAppFile(repoRoot);
  console.log(`Verifying: ${appFile}`);

  // --- 1. Syntax check the embedded script ---
  const html = fs.readFileSync(appFile, "utf-8");
  const match = html.match(/<script>([\s\S]*)<\/script>/);
  if (!match) throw new Error("Could not find a <script> block to check.");
  const tmpJs = path.join(require("os").tmpdir(), "yield_verify_extracted.js");
  fs.writeFileSync(tmpJs, match[1]);
  require("child_process").execSync(`node --check "${tmpJs}"`, { stdio: "inherit" });
  console.log("✓ Syntax check passed\n");

  // --- 2. Real browser smoke test ---
  let chromium;
  try {
    ({ chromium } = require("playwright"));
  } catch (e) {
    console.log("BLOCKED: playwright is not installed. Run `npm install playwright && npx playwright install chromium` inside tools/ first.");
    console.log("Blocked is not passed — do not report this step as green.");
    process.exit(2);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });

  await page.goto("file://" + appFile);
  await page.waitForSelector('button:has-text("Load Demo Data")', { timeout: 10000 });
  await page.click('button:has-text("Load Demo Data")');
  await page.waitForTimeout(400);

  const checks = {
    compareScreenShowsGroups: await page.locator(".group-card").count() > 0,
    productsScreenLoads: await (async () => {
      await page.click("text=Products");
      await page.waitForTimeout(200);
      return (await page.locator("table tbody tr").count()) > 0;
    })(),
    reviewScreenLoads: await (async () => {
      await page.click("text=Review");
      await page.waitForTimeout(200);
      return (await page.locator(".panel").count()) > 0;
    })(),
  };
  await browser.close();

  console.log("Smoke test results:", JSON.stringify(checks, null, 2));
  console.log("Console/page errors:", errors.length ? errors : "none");

  const failed = Object.entries(checks).filter(([, v]) => !v);
  if (failed.length || errors.length) {
    console.log(`\n✗ FAILED: ${failed.map(([k]) => k).join(", ")}${errors.length ? " (+ console errors)" : ""}`);
    process.exit(1);
  }
  console.log("\n✓ Smoke test passed");
}

main().catch(e => { console.error(e); process.exit(1); });
