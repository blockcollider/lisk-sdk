module.exports = {
	testMatch: ['<rootDir>/test/**/**.ts'],
	setupFilesAfterEnv: ['<rootDir>/test/_setup.js'],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
	verbose: true,
	collectCoverage: true,
	coverageReporters: ['json', 'lcov', 'cobertura'],
	coverageDirectory: '.coverage',
	/**
	 * restoreMocks [boolean]
	 *
	 * Default: false
	 *
	 * Automatically restore mock state between every test.
	 * Equivalent to calling jest.restoreAllMocks() between each test.
	 * This will lead to any mocks having their fake implementations removed
	 * and restores their initial implementation.
	 */
	restoreMocks: true,

	/**
	 * resetModules [boolean]
	 *
	 * Default: false
	 *
	 * By default, each test file gets its own independent module registry.
	 * Enabling resetModules goes a step further and resets the module registry before running each individual test.
	 * This is useful to isolate modules for every test so that local module state doesn't conflict between tests.
	 * This can be done programmatically using jest.resetModules().
	 */
	resetModules: true,
};
