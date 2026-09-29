export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["./src/__tests__"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/setup/"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
};
