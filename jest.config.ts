import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['test'],
  collectCoverageFrom: ["src/**/*.ts"]
};
export default config;
