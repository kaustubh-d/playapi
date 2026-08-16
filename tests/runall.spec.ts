import { test, expect } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';
import * as path from 'node:path';

import { LoadedTestSuite, loadTestSuiteFromFolder } from '../src/test-loader';
import { executeScenario } from '../src/executors/scenario';
import request from '../src/executors/request';

const test_root = process.env.TEST_ROOT ?? __dirname;
const suitesRoot = path.resolve(test_root, './definitions/suites');
console.log(`Looking for test suites in: ${suitesRoot}`);
const suiteFolders: string[] = [];

if (existsSync(path.join(suitesRoot, 'suite-config.json'))) {
  console.log(`Found suite-config.json in root folder: ${suitesRoot}`);
  suiteFolders.push(suitesRoot);
} else {
  console.log(`No suite-config.json found in root folder: \
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
  console.log(`Loaded suite: ${suiteName} from folder: ${suiteFolder}`);

  test.describe(suiteName, () => {
    for (const scenario of loadedSuite.scenarios) {
      const scenarioName = scenario?.name ?? 'Unnamed scenario';

      test(scenarioName, async ({ request }) => {
        console.log(`Executing scenario: ${scenarioName}`);

        const capturedVariables = await executeScenario(request, scenario,
          loadedSuite.suiteConfig.variables);
        console.log(`Captured variables after executing scenario: ${scenarioName}: 
          ${JSON.stringify(capturedVariables, null, 2)}`);

        // const steps = Array.isArray((scenario as any).steps) ? (scenario as any).steps : [];

        // for (const [index, step] of steps.entries()) {
        //   const stepName = typeof step === 'string' ? step : ((step as any)?.name ?? `Step ${index + 1}`);

        //   await test.step(stepName, async () => {
        //     console.log(`Executing step: ${stepName}`);
        //     if (step && typeof step === 'object') {
        //       expect(step).toBeTruthy();
        //     } else {
        //       expect(step).toBeDefined();
        //     }
        //   });
        // }

        // if (steps.length === 0) {
        //   expect(scenario).toBeTruthy();
        // }
      });
    }
  });
}

