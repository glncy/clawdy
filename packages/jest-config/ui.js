/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: [require.resolve("./jest.setup.js")],
    transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest"]
    },
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    },
    testMatch: ["**/__tests__/**/*.test.(ts|tsx|js|jsx)"]
};
