export function initPopup() {
  const toggle = document.getElementById("timerToggle");

  // Load saved state
  chrome.storage.local.get(["timerEnabled"], (data) => {
    const enabled = data.timerEnabled ?? true;
    toggle.checked = enabled;

    if (data.timerEnabled === undefined) {
      chrome.storage.local.set({ timerEnabled: enabled });
    }
  });

  chrome.storage.local.get("testMode", ({ testMode }) => {
    if (testMode) {
      chrome.storage.local.set({ lastNotificationMessage: "expected message" });
    }
  });

  // Save state when toggled
  toggle.addEventListener("change", () => {
    chrome.storage.local.set({ timerEnabled: toggle.checked });
  });
  setInterval(updatePopupClock, 1000);
  updatePopupClock();
}

export function updatePopupClock() {
  const clock = document.body.querySelector("#clock");
  const session = document.body.querySelector("#session");

  chrome.storage.local.get(["minutes", "seconds", "sessionType"], (data) => {
    const { minutes, seconds } = data;
    console.log(minutes, seconds);

    clock.textContent = `${minutes}:${seconds}`;
    session.textContent = data.sessionType;
  });
}

document.addEventListener("DOMContentLoaded", initPopup);
