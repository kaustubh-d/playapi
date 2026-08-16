import { test, expect } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';
import * as path from 'node:path';
import { logger } from '../src/utils/logger';

import { LoadedTestSuite, loadTestSuiteFromFolder } from '../src/test-loader';
import { executeScenario } from '../src/executors/scenario';

const test_root = process.env.TEST_ROOT ?? __dirname;
const suitesRoot = path.resolve(test_root, './definitions/suites');
logger.info(`Looking for test suites in: ${suitesRoot}`);
const suiteFolders: string[] = [];

if (existsSync(path.join(suitesRoot, 'suite-config.json'))) {
  logger.info(`Found suite-config.json in root folder: ${suitesRoot}`);
  suiteFolders.push(suitesRoot);
} else {
  logger.error(`No suite-config.json found in root folder: \
    ${suitesRoot}. Looking for subfolders...`);
  if (existsSync(suitesRoot)) {
    for (const entry of readdirSync(suitesRoot, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        suiteFolders.push(path.join(suitesRoot, entry.name));
      }
    }
  }
}

for (const suiteFolder of suiteFolders) {
  const loadedSuite: LoadedTestSuite = loadTestSuiteFromFolder(suiteFolder);
  const suiteName = loadedSuite.suiteConfig?.suite?.name ?? path.basename(suiteFolder);
  logger.info(`Loaded suite: ${suiteName} from folder: ${suiteFolder}`);

  test.describe(suiteName, () => {
    for (const scenario of loadedSuite.scenarios) {
      const scenarioName = scenario?.name ?? 'Unnamed scenario';

      test(scenarioName, async ({ request }) => {
        logger.debug(`Executing scenario: ${scenarioName}`);

        const capturedVariables = await executeScenario(request, scenario,
          loadedSuite.suiteConfig.variables);

        logger.debug(`Captured variables after executing scenario: ${scenarioName}:
          ${JSON.stringify(capturedVariables, null, 2)}`);
      });
    }
  });
}

