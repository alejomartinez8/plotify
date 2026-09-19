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

// jsdom doesn't implement matchMedia either; components that pick a
// responsive default (e.g. LotCards' mobile-cards/desktop-table view) call
// it on mount. Default to "no match" so tests keep exercising the mobile
// branch unless a test explicitly overrides window.matchMedia.
global.matchMedia =
  global.matchMedia ||
  ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));

// @testing-library/react normally auto-registers this via the test
// framework's global `afterEach`, but this project doesn't enable
// Vitest's `globals` option, so it must be wired up explicitly —
// otherwise each test's DOM tree keeps piling up on top of the last.
afterEach(() => {
  cleanup();
});
