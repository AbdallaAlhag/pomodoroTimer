import {
  updateClock,
  upDateSessionContentAndMinutes,
  showNotification,
} from "./util.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("timer", { periodInMinutes: 1 / 60 });
});

// TODO:
// - work runs correctly but displays wrong, assuming same for break over
// works starts dispalys  50:59 and breaks starts dispalys 1:00 -> fix
// break display starts at 10:59
// - notification did clear but audio did not play right
// -> continue with puppeteer
//
// slignt error with notification image but it clears / makes sound i believe?

function updateTimer() {
  let clockMinutes = updateClock().minutes;
  let clockSeconds = updateClock().seconds;

  if (clockMinutes === 50 && clockSeconds === 0) {
    showNotification("Work session finished!", "Take a 10-minute break.");
  }

  // Break → Work
  if (clockMinutes === 0 && clockSeconds === 0) {
    showNotification("Break finished!", "Back to work for 50 minutes.");
  }

  let { textContent, remainingMinutes } =
    upDateSessionContentAndMinutes(clockMinutes);

  const minutes = String(remainingMinutes).padStart(2, "0");

  const seconds = String(59 - clockSeconds + 1).padStart(2, "0");

  chrome.storage.local.set({
    minutes: minutes,
    seconds: seconds,
    sessionType: textContent,
  });
}

// Using alarms
chrome.alarms.onAlarm.addListener(() => {
  chrome.storage.local.get(["timerEnabled"], ({ timerEnabled }) => {
    if (timerEnabled) updateTimer(); // Only update if ON
    // updateTimer();
  });
});

let offscreenReady = false;
let offscreenReadyPromise;
let offscreenReadyResolve;

function getOffscreenReadyPromise() {
  if (!offscreenReadyPromise) {
    offscreenReadyPromise = new Promise((resolve) => {
      offscreenReadyResolve = resolve;
    });
  }
  return offscreenReadyPromise;
}

async function ensureOffscreen() {
  const offscreen = await chrome.offscreen.hasDocument();

  if (!offscreen) {
    await chrome.offscreen.createDocument({
      url: "offscreen/offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play timer sound",
    });
  }
  return getOffscreenReadyPromise();
}
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "offscreen-ready") {
    offscreenReady = true;
    offscreenReadyResolve?.();
    return;
  }

  if (msg.type === "playSound") {
    ensureOffscreen().then(() => {
      chrome.runtime
        .sendMessage({ type: "playSound-offscreen" })
        .catch(console.error);
    });
  }
});

(async () => {
  try {
    await ensureOffscreen();
    console.log("Offscreen ensured successfully!");
  } catch (error) {
    console.error("Error ensuring offscreen:", error);
  }
})();

export { updateClock };
