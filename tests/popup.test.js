import { jest } from "@jest/globals";
import { updatePopupClock } from "../popup/popup.js";

beforeEach(async () => {
  global.chrome = {
    storage: {
      local: {
        data: {},
        get: jest.fn((keys, cb) => cb(global.chrome.storage.local.data)),
        set: jest.fn((items, cb) => {
          Object.assign(global.chrome.storage.local.data, items);
          cb && cb();
        }),
      },
    },
  };

  document.body.innerHTML = `
    <div id="clock"></div>
    <div id="session"></div>
    <div id="timerToggle"></div>
    `;

  jest.clearAllMocks();
});

test("Updates the popup Clock correctly", () => {
  global.chrome.storage.local.data = {
    minutes: 12,
    seconds: 34,
    sessionType: "Work",
  };
  updatePopupClock();
  // Assert that Dom elements were updated correctly
  expect(global.clock.textContent).toBe("12:34");
  expect(global.session.textContent).toBe("Work");

  // Assert that chrome.storage.local.get works correctly
  expect(global.chrome.storage.local.data.minutes).toBe(12);
  expect(global.chrome.storage.local.data.seconds).toBe(34);
  expect(global.chrome.storage.local.data.sessionType).toBe("Work");
});
