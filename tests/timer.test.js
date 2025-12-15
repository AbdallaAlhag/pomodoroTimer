// Unit test for pure js logic using Jest
import { updateClock, upDateSessionContentAndMinutes } from "../util.js";

test("Grabs current time correctly", () => {
  let time = new Date();
  expect(updateClock().minutes).toBe(time.getMinutes());
  expect(updateClock().seconds).toBe(time.getSeconds());
});

test("Grabs current session and remaining minutes for sesison", () => {
  for (let i = 0; i < 60; i++) {
    if (i < 50) {
      expect(upDateSessionContentAndMinutes(i).textContent).toBe("Work");
      expect(upDateSessionContentAndMinutes(i).remainingMinutes).toBe(50 - i);
    } else {
      expect(upDateSessionContentAndMinutes(i).textContent).toBe("Break");
      expect(upDateSessionContentAndMinutes(i).remainingMinutes).toBe(60 - i);
    }
  }
});
