import { readdirSync } from 'node:fs';
import * as path from 'node:path';

import { parseSuiteConfig } from './parsers/suite-parser';
import { parseScenarioFile } from './parsers/scenario-parser';
import { SuiteConfig } from './objects/suites';
import { ScenarioObject } from './objects/scenarios';

export interface LoadedTestSuite {
  suiteConfig: SuiteConfig;
  scenarios: ScenarioObject[];
}

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

export function loadTestSuiteFromFolder(folderPath: string): LoadedTestSuite {
  const resolvedPath = path.resolve(folderPath);

  const suiteConfigPath = path.join(resolvedPath, 'suite-config.yaml');
  const suiteConfig = parseSuiteConfig(suiteConfigPath);

  const scenariosDir = path.join(resolvedPath, 'scenarios');
  const scenarioFiles = listJsonFilesRecursively(scenariosDir);

  const scenarios = scenarioFiles.map((scenarioPath) => {
    return parseScenarioFile(scenarioPath);
  });

  return {
    suiteConfig: suiteConfig,
    scenarios,
  };
}

export default loadTestSuiteFromFolder;
