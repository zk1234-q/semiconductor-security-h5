import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const output = resolve(".tmp/offline-entry");
await mkdir(output, { recursive: true });
const html = await readFile("dist/index.html", "utf8");
assert(!/<script\b[^>]*\bsrc=/.test(html), "Built HTML must not request an external script");
assert(!/<link\b[^>]*rel="stylesheet"/.test(html), "Built HTML must inline styles");
assert(!html.includes("data-file-launcher"), "Built HTML must not redirect again");
assert(html.indexOf('<div id="app">') < html.lastIndexOf("<script>"), "Run app after its DOM root");

const chrome = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
assert(existsSync(chrome), "Set CHROME_PATH to a local Chrome installation");
const profile = await mkdtemp(resolve(output, "chrome-"));
const browser = spawn(chrome, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  "--disable-background-networking", "--remote-debugging-pipe", "--user-data-dir=" + profile,
], { stdio: ["ignore", "ignore", "pipe", "pipe", "pipe"], windowsHide: true });
let nextId = 0;
let buffer = "";
let stderr = "";
const errors = [];
const pending = new Map();
browser.stderr.on("data", data => { stderr = (stderr + data.toString()).slice(-2000); });
browser.stdio[4].on("data", data => {
  buffer += data.toString();
  let end;
  while ((end = buffer.indexOf("\0")) !== -1) {
    const message = JSON.parse(buffer.slice(0, end));
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
    buffer = buffer.slice(end + 1);
    const waiter = pending.get(message.id);
    if (!waiter) continue;
    pending.delete(message.id);
    clearTimeout(waiter.timer);
    if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
    else waiter.resolve(message.result);
  }
});
function send(method, params = {}, sessionId) {
  return new Promise((resolveRequest, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error("CDP timeout: " + method + "\n" + stderr));
    }, 10000);
    pending.set(id, { resolve: resolveRequest, reject, timer });
    browser.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + "\0");
  });
}
try {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const call = (method, params) => send(method, params, sessionId);
  await call("Page.enable");
  await call("Runtime.enable");
  // Evaluate synchronously after each click so handler failures cannot be hidden.
  async function evaluate(expression) {
    const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async function ready() {
    for (let i = 0; i < 40; i++) {
      if (await evaluate("Boolean(document.querySelector('[data-action=\"start\"]'))")) return;
      await new Promise(resolveWait => setTimeout(resolveWait, 100));
    }
    assert.fail("Offline cover did not render");
  }
  async function click(action, attribute = "") {
    const selector = '[data-action="' + action + '"]' + attribute;
    const found = await evaluate("(() => { const b = document.querySelector(" +
      JSON.stringify(selector) + "); if (!b || b.disabled) return false; b.click(); return true; })()");
    assert(found, "Missing or disabled button: " + selector);
  }
  async function capture(name) {
    await evaluate("new Promise(r => setTimeout(r, 250))");
    const shot = await call("Page.captureScreenshot", { format: "png" });
    await writeFile(resolve(output, name), Buffer.from(shot.data, "base64"));
  }
  const key = "last-authorization-h5:v2";
  const state = () => evaluate("JSON.parse(localStorage.getItem(" + JSON.stringify(key) + "))");
  await call("Page.navigate", { url: pathToFileURL(resolve("index.html")).href });
  await ready();
  assert.equal(await evaluate("location.pathname.endsWith('/dist/index.html')"), true, "Root file redirect");
  console.log("PASS root file redirect and offline cover");
  async function advance(count) {
    for (let i = 0; i < count; i++) await click("advance-dialogue");
  }
  for (const safe of [true, false]) {
    if (!safe) await click("restart");
    await click("start");
    await advance(3);
    await click("rewind-day");
    await advance(3);
    for (const clue of ["map", "batch", "notes", "schedule"]) {
      await click("inspect-anomaly", '[data-clue="' + clue + '"]');
    }
    if (safe) await capture("scene-anomaly.png");
    await click("continue-classify");
    await advance(2);
    await click("set-classification", '[data-item="phenomenon"][data-bucket="fact"]');
    await click("set-classification", '[data-item="cause"][data-bucket="hypothesis"]');
    await click("set-classification", '[data-item="next"][data-bucket="action"]');
    await click("confirm-classify");
    await advance(2);
    if (!safe) {
      await click("set-tool", '[data-tool="external"]');
      await click("toggle-field", '[data-field="notes"]');
    }
    await click("confirm-report");
    await advance(2);
    await click("review-source", '[data-source="fact"]');
    await click("review-source", '[data-source="cause"]');
    await click("continue-photo-shoot");
    await advance(2);
    await click("choose-shot", '[data-shot="emotion"]');
    await click("confirm-shot");
    await advance(2);
    if (safe) await capture("scene-photo-inspect.png");
    if (safe) for (const hotspot of ["screen", "document", "reflection"]) {
      await click("toggle-mask", '[data-hotspot="' + hotspot + '"]');
    }
    await click("confirm-photo");
    await advance(2);
    await click("choose-copy", safe ? '[data-copy="progress"]' : '[data-copy="passed"]');
    await click("confirm-copy");
    await advance(2);
    if (safe) await capture("scene-partner-call.png");
    await click("choose-partner", safe ? '[data-choice="schedule"]' : '[data-choice="full"]');
    await advance(1);
    await click("choose-free-action", '[data-free="message-gu"]');
    await click("choose-free-action", '[data-free="ask-cheng"]');
    await click("continue-agent-plan");
    await advance(2);
    if (safe) await capture("scene-agent-plan.png");
    await click("confirm-plan");
    await advance(2);
    for (const clue of ["morning", "photo", "attachment"]) {
      await click("link-clue", '[data-clue="' + clue + '"]');
    }
    await click("continue-final-mail");
    await advance(2);
    if (safe) await click("toggle-wording");
    await click("confirm-final-mail");
    const completed = await state();
    assert.equal(completed.scene, "evidence");
    assert.equal(completed.records.authorization.readRaw, !safe);
    assert.equal(completed.records.authorization.backupRecipient, !safe);
    assert.equal(completed.records.report.tool, safe ? "internal" : "external");
    await click("show-debrief");
    assert.equal((await state()).scene, "debrief");
    console.log("PASS " + (safe ? "safe" : "risk") + " 16-scene path and debrief");
  }
  await click("restart");
  await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await evaluate("new Promise(r => setTimeout(r, 600))");
  assert(await evaluate("document.documentElement.scrollWidth <= innerWidth"), "Mobile horizontal overflow");
  const screenshot = await call("Page.captureScreenshot", { format: "png" });
  await writeFile(resolve(output, "mobile.png"), Buffer.from(screenshot.data, "base64"));
  await call("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await evaluate("new Promise(r => setTimeout(r, 600))");
  const desktop = await call("Page.captureScreenshot", { format: "png" });
  await writeFile(resolve(output, "desktop.png"), Buffer.from(desktop.data, "base64"));
  console.log("PASS mobile overflow check; screenshots saved");
  await call("Page.addScriptToEvaluateOnNewDocument", {
    source: "Object.defineProperty(window, 'localStorage', {get() {throw new DOMException('Blocked', 'SecurityError');}})",
  });
  const standalone = resolve(output, "standalone.html");
  await copyFile("dist/index.html", standalone);
  await call("Page.navigate", { url: pathToFileURL(standalone).href });
  await ready();
  await click("start-demo");
  await click("confirm-final-mail");
  await click("show-debrief");
  await click("restart");
  assert(await evaluate("Boolean(document.querySelector('[data-action=\"start\"]'))"));
  assert.deepEqual(errors, [], "Uncaught browser errors");
  console.log("PASS standalone copy, blocked storage, buttons and reset");
} finally {
  for (const waiter of pending.values()) clearTimeout(waiter.timer);
  browser.kill();
}
