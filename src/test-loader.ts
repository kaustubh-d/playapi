import { readdirSync } from 'node:fs';
import * as path from 'node:path';

import { parseSuiteConfig } from './parsers/suite-parser';
import { parseScenarioFile } from './parsers/scenario-parser';
import { SuiteConfig } from './objects/suites';
import { ScenarioObject } from './objects/scenarios';
import { logger } from './utils/logger';

export interface TestSuite {
  suiteConfig: SuiteConfig;
  scenarios: ScenarioObject[];
}

export type TestSuites = TestSuite[]

function listJsonFilesRecursively(dirPath: string): string[] {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const jsonFiles: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      jsonFiles.push(...listJsonFilesRecursively(fullPath));
      continue;
    }

    if (entry.isFile() && (
      entry.name.toLowerCase().endsWith('.json') ||
      entry.name.toLowerCase().endsWith('.yaml') ||
      entry.name.toLowerCase().endsWith('.yml'))) {
        jsonFiles.push(path.resolve(fullPath));
    }
  }

  return jsonFiles.sort((a, b) => a.localeCompare(b));
}

// Test root is expected to contain a folder for each Suite.
// Each Suite folder contains suite-config.json/yaml and 'scenarios'
// folder. 'scenarios' subfolder should contain *.json/yaml files
// one for each test scenario defined to be executed.
export function loadAllTests(testRoot: string): TestSuites {

  let testSuites: TestSuites = []

  const resolvedTestRoot = path.resolve(testRoot);
  logger.debug(`Loading test suites from ${resolvedTestRoot}`)
  const entries = readdirSync(resolvedTestRoot, { withFileTypes: true });

  const suiteDirs = entries.filter(entry => entry.isDirectory())
    .map(entry => entry.name);
  logger.debug(`Suite Dirs: ${suiteDirs}`)

  // Find all suite dirs and load scenarios
  for (const suiteDir of suiteDirs) {
    const resolvedSuiteDir = path.resolve(path.join(testRoot, suiteDir))
    logger.debug(`Processing suite directory: ${resolvedSuiteDir}`)

    // search suite-config.json/yaml
    const filesInSuiteDir = readdirSync(resolvedSuiteDir);
    logger.debug(`filesInSuiteDir: ${filesInSuiteDir}`)
    const foundSuiteFile = filesInSuiteDir.find(file => /^suite-config\.(yaml|yml|json)$/.test(file));

    if (foundSuiteFile) {
      logger.info(`Found ${foundSuiteFile} in: ${resolvedSuiteDir}`);
    } else {
      logger.warn('No suite-config file found. Skipping suite.');
      continue
    }

    // Load the suite file
    const suiteConfig = parseSuiteConfig(path.join(resolvedSuiteDir, foundSuiteFile));

    // Look up scenario test files
    const scenariosDir = path.resolve(path.join(resolvedSuiteDir, "scenarios"));
    const scenarioFiles = listJsonFilesRecursively(scenariosDir);

    const scenarios = scenarioFiles.map((scenarioPath) => {
      return parseScenarioFile(scenarioPath);
    });

    testSuites.push({
      suiteConfig: suiteConfig,
      scenarios,
    })
  }

  return testSuites;
}
