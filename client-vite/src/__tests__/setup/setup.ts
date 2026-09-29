import "@testing-library/jest-dom/vitest";

// react-textarea-autosize (used throughout the board/dashboard components)
// relies on ResizeObserver, which jsdom doesn't implement.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver ?? ResizeObserverStub;
