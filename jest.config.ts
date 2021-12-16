import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    roots: ['test'],
    collectCoverageFrom: ["src/**/*.ts"],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            branches: 10,
            functions: 50,
            lines: 50,
            statements: 50
        }
    },
};
export default config;
