// Vitest setup file
// Add any global test setup here

// Setup test environment for React Testing Library
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// You can add custom matchers here if needed
// import { expect } from "vitest";
// expect.extend({
//   customMatcher() { ... }
// });
