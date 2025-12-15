export function handleSound(msg) {
  if (msg.type === "playSound-offscreen") {
    console.log("trying to play sound?");
    try {
      const audio = new Audio(chrome.runtime.getURL("ding.mp3"));
      audio.play();
    } catch (error) {
      console.log("Error playing audio");
      console.error(error);
    }
  }
}
// chrome.runtime.onMessage.addListener(handleSound);

export function setupOffscreenListeners() {
  chrome.runtime.onMessage.addListener(handleSound);
}
// Only run in real Chrome extension, NOT in Jest
if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  console.log("setup offscreen listeners");
  setupOffscreenListeners();
}
console.log("welcome to offscreen");
chrome.runtime.sendMessage({ type: "offscreen-ready" });
