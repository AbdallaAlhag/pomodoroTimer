export function updateClock() {
  const now = new Date(); // current date & time
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  return { minutes, seconds };
}

export function upDateSessionContentAndMinutes(clockMinutes) {
  // let textContent;
  // if (clockMinutes < 50) {
  //   textContent = "Work";
  // } else {
  //   textContent = "Break";
  // }
  // let remainingMinutes =
  //   textContent === "Work" ? 50 - clockMinutes : 60 - clockMinutes;
  let textContent;
  let remainingMinutes;

  if (clockMinutes < 50) {
    textContent = "Work";
    remainingMinutes = 50 - clockMinutes;
  } else {
    textContent = "Break";
    remainingMinutes = 10 - (clockMinutes - 50);
    // this gives exactly 10 minutes of break
  }
  return { textContent, remainingMinutes };
}

export function showNotification(title, message) {
  const notificationId = "session-notification";
  chrome.notifications.create(notificationId, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("images/icon-128.png"),
    title: title,
    message: message,
    priority: 2,
  });

  chrome.runtime.sendMessage({ type: "playSound" });
  // setTimeout(() => {
  //   chrome.notifications.clear(notificationId);
  // }, 5000);
  chrome.alarms.create("clear-notification", { delayInMinutes: 0.0833 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "clear-notification") {
      chrome.notifications.clear(notificationId);
      console.log("notification cleared");
    }
  });
}
