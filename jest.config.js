module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['test'],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"]
};
