import {
  updateClock,
  upDateSessionContentAndMinutes,
  showNotification,
} from "./util.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("timer", { periodInMinutes: 1 / 60 });
});

// TODO:

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

export { updateClock };
