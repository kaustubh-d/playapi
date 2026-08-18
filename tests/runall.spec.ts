import { test } from '@playwright/test';
import { logger } from '../src/utils/logger';

import { loadAllTests, TestSuites } from '../src/test-loader';
import { executeScenario } from '../src/executors/scenario';

const testRoot = process.env.TEST_ROOT ?? __dirname;
const suites: TestSuites = loadAllTests(testRoot)

// Start dynamic test generation as per loaded test files.
for (const suite of suites) {
  const suiteName = suite.suiteConfig?.suite?.name;
  if (suiteName) {
    logger.info(`Running suite: ${suiteName}`);
  } else {
    logger.warn("Skipping suite due to partial information")
    continue
  }
  // Define suite
  test.describe(suiteName, () => {
    for (const scenario of suite.scenarios) {
      const scenarioName = scenario?.name;
      if (scenarioName) {
      logger.info(`Running suite: ${scenarioName}`);
    } else {
      logger.warn("Skipping Scenario due to partial information")
      continue
    }

      // Define scenario based tests
      test(scenarioName, async ({ request }, testInfo) => {
        logger.debug(`Executing scenario: ${scenarioName}`);

        const capturedVariables = await executeScenario(request, testInfo,
          scenario, suite.suiteConfig.variables);

        logger.debug(`Captured variables after executing scenario: ${scenarioName}:
          ${JSON.stringify(capturedVariables, null, 2)}`);
      });
    }
  });
}

