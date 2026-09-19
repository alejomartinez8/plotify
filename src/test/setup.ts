import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement ResizeObserver, but Radix UI primitives (e.g.
// Checkbox) use it internally and throw a ReferenceError without a stub.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// @testing-library/react normally auto-registers this via the test
// framework's global `afterEach`, but this project doesn't enable
// Vitest's `globals` option, so it must be wired up explicitly —
// otherwise each test's DOM tree keeps piling up on top of the last.
afterEach(() => {
  cleanup();
});
