// Real browser/server checks; no route interception or geolocation emulation.
const fs = require("node:fs");
const path = require("node:path");
const { randomBytes } = require("node:crypto");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const output = path.resolve("../docs/location-audit");
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const checks = [];
  page.on("pageerror", error => errors.push(error.message));
  const origin = process.env.BIXOO_WEB_URL || "http://localhost:5173";
  try {
    for (const width of [320, 360, 375, 390, 412, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`${origin}/shared-location`);
      await page.getByRole("alert").waitFor();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      checks.push({ check: `Invalid-link recipient layout ${width}px`, status: overflow ? "FAIL" : "PASS" });
      await page.screenshot({ path: path.join(output, `recipient-invalid-${width}.png`), fullPage: true });
    }
    // Random invalid capability is a negative input, never a fake server response.
    const invalid = randomBytes(32).toString("base64url");
    const responsePromise = page.waitForResponse(response => response.url().endsWith("/location-shares/current"));
    await page.goto(`${origin}/shared-location#${invalid}`);
    const response = await responsePromise;
    await page.getByRole("alert").waitFor();
    checks.push({ check: "Real API rejects invalid recipient link", status: response.status() === 404 ? "PASS" : "FAIL", http_status: response.status() });
    const requestHeaders = await response.request().allHeaders();
    checks.push({ check: "Recipient request omits account authorization", status: !requestHeaders.authorization ? "PASS" : "FAIL" });
    checks.push({ check: "Capability absent from API URL", status: !response.url().includes(invalid) ? "PASS" : "FAIL" });
    await page.goto(`${origin}/trips`);
    await page.waitForURL("**/login");
    checks.push({ check: "Signed-out private route redirects to login", status: "PASS" });
    const readGps = async () => page.evaluate(async () => {
      const permission = await navigator.permissions.query({ name: "geolocation" });
      const result = await new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(
          position => resolve({ available: true, accuracy: position.coords.accuracy, captured_at: new Date(position.timestamp).toISOString() }),
          error => resolve({ available: false, code: error.code, message: error.message }),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
        );
      });
      return { secure_context: window.isSecureContext, permission: permission.state, ...result };
    });
    const gps = await readGps();
    checks.push({ check: "Actual browser GPS without permission (no emulation)", status: gps.available ? "AVAILABLE" : "BLOCKED", detail: gps });
    // Grant browser permission only; never set/emulate a location or replace the GPS API.
    await context.grantPermissions(["geolocation"], { origin });
    const allowedGps = await readGps();
    checks.push({ check: "Actual browser GPS with permission allowed (no emulation)", status: allowedGps.available ? "AVAILABLE" : "BLOCKED", detail: allowedGps });

    await page.goto(`${origin}/shared-location`);
    await context.setOffline(true);
    await page.evaluate(capability => { window.location.hash = capability; }, invalid);
    await page.getByRole("alert").filter({ hasText: "Cannot reach" }).waitFor();
    checks.push({ check: "Real offline network displays connection error", status: "PASS" });
    await context.setOffline(false);
    await page.getByRole("alert").filter({ hasText: "invalid or has been revoked" }).waitFor({ timeout: 20000 });
    checks.push({ check: "Recipient polling recovers after real network restoration", status: "PASS" });
    checks.push({ check: "No browser runtime exceptions", status: errors.length ? "FAIL" : "PASS", detail: errors });
    const result = { checks, limitation: "No account credentials supplied; private location UI, real GPS writes and valid recipient map are not certified." };
    fs.writeFileSync(path.join(output, "browser-results.json"), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    if (checks.some(check => check.status === "FAIL")) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
