import { jest } from "@jest/globals";
import {
  showNotification,
  upDateSessionContentAndMinutes,
  updateClock,
} from "../util.js";
import { handleSound } from "../offscreen/offscreen.js";

beforeEach(async () => {
  global.chrome = {
    notifications: {
      create: jest.fn(), // create is now a Jest mock function
      clear: jest.fn(),
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

  test("break starts at 10:50 (clockMinutes = 50)", () => {
    const clockMinutes = 50;
    const result = upDateSessionContentAndMinutes(clockMinutes);

    expect(result.textContent).toBe("Break");
    expect(result.remainingMinutes).toBe(10); // 60 - 59
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
describe("Show notification creates, clears, and plays audio correctly", () => {
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

  test("sends playSound message", () => {
    showNotification("test", "test");

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: "playSound",
    });
  });

  test("clears notification after timeout", () => {
    jest.useFakeTimers();

    showNotification("A", "B");

    jest.runAllTimers();

    // clear called with correct title and id
    expect(chrome.notifications.clear).toHaveBeenCalledWith(
      "session-notification",
    );
  });
});

test("plays sound when msg.type === 'playSound'", () => {
  handleSound({ type: "playSound" });

  // URL produced by your existing mock
  expect(Audio).toHaveBeenCalledWith("chrome-extension://fakeid/ding.mp3");

  // get the mock Audio instance
  const audioInstance = Audio.mock.results[0].value;

  // and verify play() was called
  expect(audioInstance.play).toHaveBeenCalled();
});
