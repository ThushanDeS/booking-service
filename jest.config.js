module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./tests/setup.js'],
    testTimeout: 10000,
    verbose: true,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/app.js',
        '!**/node_modules/**'
    ],
    coverageThreshold: {
        global: {
            statements: 50,
            branches: 40,
            functions: 50,
            lines: 50
        }
    }
};