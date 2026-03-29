/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"]
  },
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js|jsx)"]
};
