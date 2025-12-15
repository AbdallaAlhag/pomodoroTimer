import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import readline from "readline";

// 1) Resolve the extension path (absolute) so Chrome can load it
const extensionPath = path.resolve("./"); // change if your extension is in subfolder

// 2) Optional: create a fresh user data dir for isolation (temporary profile)
const userDataDir = path.join(process.cwd(), ".puppeteer_temp_profile");

// Helper to remove folder (quick and dirty)
function rimraf(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

(async () => {
  // Clean any old profile so extension ID is consistent for this run
  rimraf(userDataDir);

  // 3) Launch Chrome with extension loaded
  const browser = await puppeteer.launch({
    headless: false, // must be false to load extensions
    args: [
      `--disable-extensions-except=${extensionPath}`, // disable all others
      `--load-extension=${extensionPath}`, // load only our extension
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
    userDataDir, // use a fresh profile so extension loads cleanly
    defaultViewport: null, // optional: mimic full window size
  });

  try {
    // 4) Wait for targets (pages, background, service worker) to appear
    await new Promise((resolve) => setTimeout(resolve, 1000)); // small wait for extension to initialize

    // 5) Discover the extension id:
    //    inspect all known targets and pick the one with a chrome-extension:// url
    const targets = await browser.targets(); // all targets (tabs, workers, pages)
    const extensionTarget = targets.find((t) => {
      const url = t.url() || "";
      return url.startsWith("chrome-extension://");
    });

    if (!extensionTarget) {
      throw new Error(
        "Extension target not found. Did it fail to load? Check chrome://extensions for errors.",
      );
    }

    // Extract extension id from the URL: chrome-extension://<EXT_ID>/...
    const url = extensionTarget.url();
    const match = url.match(/^chrome-extension:\/\/([a-p0-9]+)\//);
    const extensionId = match ? match[1] : null;

    if (!extensionId) {
      throw new Error("Failed to parse extension id from target URL: " + url);
    }

    console.log("Extension ID discovered:", extensionId);

    // 6) Open the popup (or any extension page)
    //    If you have popup.html, you can load it directly by URL:
    const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
    const page = await browser.newPage();
    await page.goto(popupUrl); // open the popup page like a normal page

    // // 7) Interact with the popup UI (example: click a button #notifyButton)
    // //    Wait for the DOM element to appear, then click it
    // await page.waitForSelector("#notifyButton", { timeout: 5000 });
    // await page.click("#notifyButton");
    //

    // 8) Wait for the extension to write the test-hook into storage
    //    Evaluate inside the extension page context to read chrome.storage.local
    const lastNotification = await page.evaluate(async () => {
      // chrome.storage.local.get returns via callback; wrap in Promise for await

      await chrome.storage.local.set({ testMode: true });
      console.log("set up test mode");
      return new Promise((resolve) => {
        chrome.storage.local.get("lastNotificationMessage", (items) => {
          resolve(items.lastNotificationMessage);
        });
      });
    });

    console.log(
      "Last notification message from extension storage:",
      lastNotification,
    );

    // 9) Assert expected value (in your test framework you would use expect)
    // if (lastNotification !== "expected message") {
    //   throw new Error("Notification message did not match expected value");
    // }

    console.log("Extension interaction test passed");
  } finally {
    // 10) Cleanup: close browser and delete temporary user profile

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    await new Promise((resolve) => {
      rl.question("Press ENTER to close Chrome...", () => {
        rl.close();
        resolve();
      });
    });

    // await chrome.storage.local.set({ testMode: false });
    await browser.close();
    // await browser.close();
    rimraf(userDataDir);
  }
})();
