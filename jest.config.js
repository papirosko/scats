module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['test'],
  collectCoverageFrom: ["src/**/*.ts"]
};
