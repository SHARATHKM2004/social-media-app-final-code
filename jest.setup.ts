import "@testing-library/jest-dom";

// ✅ Fix: jsdom doesn't have IntersectionObserver
class MockIntersectionObserver {
  constructor(_callback: IntersectionObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});