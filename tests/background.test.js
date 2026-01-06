import { jest } from "@jest/globals";
import {
  showNotification,
  upDateSessionContentAndMinutes,
  updateClock,
} from "../util.js";

beforeEach(async () => {
  const event = () => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  });
  global.chrome = {
    notifications: {
      create: jest.fn(), // create is now a Jest mock function
      clear: jest.fn(),
    },
    alarms: {
      create: jest.fn(),
      clear: jest.fn(),
      get: jest.fn(),
      onAlarm: event(),
    },
    runtime: {
      getURL: jest.fn((path) => `chrome-extension://fakeid/${path}`),
      sendMessage: jest.fn(),
      // getURL: jest.fn((path) => path), // or return a fake full URL
    },
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
  global.Audio = jest.fn().mockImplementation(() => ({
    play: jest.fn(),
  }));
  jest.clearAllMocks();
});
describe("upDateSessionContentAndMinutes", () => {
  test("work session starts (clockMinutes = 0)", () => {
    const clockMinutes = 0;
    const result = upDateSessionContentAndMinutes(clockMinutes);

    expect(result.textContent).toBe("Work");
    expect(result.remainingMinutes).toBe(50); // 50 - 49
  });

  test("break starts at 10:50:00 (clockMinutes)", () => {
    const clockMinutes = 51;
    const result = upDateSessionContentAndMinutes(clockMinutes);

    expect(result.textContent).toBe("Break");
    expect(result.remainingMinutes).toBe(9); // 60 - 59
  });
});
test("updateClock returns correct minutes and seconds", () => {
  const mockDate = new Date(2025, 11, 11, 14, 49, 30); // 14:49:30
  jest.spyOn(global, "Date").mockImplementation(() => mockDate);

  const result = updateClock();
  expect(result.minutes).toBe(49);
  expect(result.seconds).toBe(30);

  jest.restoreAllMocks();
});
describe("Show notification creates, and clears", () => {
  test("shows break notification with the correct message", () => {
    const title = "Break Finished!";
    const message = "Back to work for 50 minutes.";
    // Call our function
    showNotification(title, message);

    // Assert that chrome.notifications.create was called
    expect(chrome.notifications.create).toHaveBeenCalled();

    // Assert it was called with specific arguments
    expect(chrome.notifications.create).toHaveBeenCalledWith(
      "session-notification",
      {
        type: "basic",
        iconUrl: chrome.runtime.getURL("images/icon-128.png"),
        title: title,
        message: message,
        priority: 2,
      },
    );
  });

  test("shows work notification with the correct message", () => {
    const title = "Work session finished!";
    const message = "Take a 10-minute break.";
    // Call our function
    showNotification(title, message);

    // Assert that chrome.notifications.create was called
    expect(chrome.notifications.create).toHaveBeenCalled();

    // Assert it was called with specific arguments
    expect(chrome.notifications.create).toHaveBeenCalledWith(
      "session-notification",
      {
        type: "basic",
        iconUrl: chrome.runtime.getURL("images/icon-128.png"),
        title: title,
        message: message,
        priority: 2,
      },
    );
  });
});
