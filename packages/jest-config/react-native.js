/** @type {import('jest').Config} */
module.exports = {
    preset: "jest-expo",
    automock: false,
    setupFilesAfterEnv: [
        "@testing-library/jest-native/extend-expect",
        "./jest.setup.js"
    ],
    transformIgnorePatterns: [
        "node_modules/(?!.*(?:react-native|@react-native|expo|@expo|@react-navigation|react-navigation|native-base|heroui-native|uniwind))"
    ],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    testMatch: ["**/__tests__/**/*.test.(ts|tsx|js|jsx)"]
};
