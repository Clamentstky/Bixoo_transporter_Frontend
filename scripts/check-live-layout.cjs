// Visual check of production presentation components using a read-only DB export.
// Does not log in, intercept APIs, change GPS, or exercise tracking mutations.
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const output = path.resolve("../docs/location-audit");
  const data = JSON.parse(fs.readFileSync(path.join(output, "layout-data.local.json"), "utf8"));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
    await page.evaluate(async ({ trip, state }) => {
      const { default: React } = await import("/node_modules/.vite/deps/react.js");
      const { default: ReactDOM } = await import("/node_modules/.vite/deps/react-dom_client.js");
      const { default: LiveTripView } = await import("/src/pages/trips/LiveTripView.jsx");
      const { default: LocationPanelView } = await import("/src/components/location/LocationPanelView.jsx");
      document.getElementById("root").style.display = "none";
      const root = document.createElement("div");
      root.className = "layout-main";
      document.body.append(root);
      ReactDOM.createRoot(root).render(React.createElement(LiveTripView, { trip }, React.createElement(LocationPanelView, {
        state, activeTrip: ["ACCEPTED", "GOING_TO_PICKUP", "PICKED_UP", "IN_TRANSIT", "AT_DELIVERY"].includes(trip.status),
      })));
    }, data);
    await page.locator(".location-map").waitFor();
    let mapLoaded = true;
    try { await page.locator(".location-map-loading").waitFor({ state: "hidden", timeout: 15000 }); }
    catch { mapLoaded = false; }
    const results = [];
    for (const width of [1366, 1100, 1024, 768, 430, 412, 390, 375, 360, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const metrics = await page.locator(".bixoo-live-page").evaluate(root => {
        const panel = root.querySelector(".location-panel");
        const map = root.querySelector(".location-map");
        const r = root.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        const mapRect = map.getBoundingClientRect();
        const overflow = [...root.querySelectorAll("*")].filter(element => {
          const box = element.getBoundingClientRect();
          return box.width && (box.right > r.right + 1 || box.left < r.left - 1);
        }).map(element => element.className || element.tagName);
        const clippedValues = [...root.querySelectorAll(".location-details dd")].filter(element => element.scrollWidth > element.clientWidth + 1).length;
        return { panelDisplay: getComputedStyle(panel).display, mapWidth: Math.round(mapRect.width), panelWidth: Math.round(panelRect.width), overflow, clippedValues };
      });
      const passed = metrics.panelDisplay === "block" && metrics.mapWidth > metrics.panelWidth * .85 && !metrics.overflow.length && !metrics.clippedValues;
      results.push({ width, passed, ...metrics });
      if ([1366, 390, 320].includes(width)) await page.locator(".bixoo-live-page").screenshot({ path: path.join(output, `live-redesign-${width}.png`) });
    }
    const report = { source: "Real saved trip/location snapshot rendered with production view components. Layout-only validation; not an authenticated end-to-end test.", mapFrameLoaded: mapLoaded, results, errors };
    fs.writeFileSync(path.join(output, "live-redesign-results.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (errors.length || results.some(result => !result.passed)) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
