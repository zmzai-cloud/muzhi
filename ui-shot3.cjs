/* 线上截图验证：memory 应用本轮功能（上传面板 / 图谱增强）。用后即删。 */
const path = require("path");
const { chromium } = require(path.join(
  "/Users/ulanxx/ulanxx_workspace/zmzai/muzhi",
  "node_modules/.pnpm/playwright@1.61.1/node_modules/playwright",
));

const TOKEN = process.argv[2];
const OUT = "/Users/ulanxx/ulanxx_workspace/zmzai/.research";
const BASE = "https://k.zmzai.cloud";

if (!TOKEN) {
  console.error("usage: node ui-shot3.cjs <token>");
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 2560, height: 1300 },
    deviceScaleFactor: 1,
  });
  await ctx.addCookies([
    { name: "muzhi_session", value: TOKEN, domain: "k.zmzai.cloud", path: "/" },
  ]);
  const page = await ctx.newPage();

  async function shot(pathname, name, extra) {
    await page.goto(BASE + pathname, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500);
    try { await page.evaluate(() => document.fonts.ready); } catch (_) {}
    if (extra) { try { await extra(); } catch (e) { console.error(name + " extra:", e.message); } }
    await page.screenshot({ path: `${OUT}/${name}.png`, timeout: 90000 });
    console.log("saved", name);
  }

  await shot("/banks/Test/documents", "memory-docs-list");
  await shot("/banks/Test/documents", "memory-docs-upload", async () => {
    await page.getByText("上传文档", { exact: true }).first().click();
    await page.waitForTimeout(600);
  });
  await shot("/banks/Test/graph", "memory-graph");

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
