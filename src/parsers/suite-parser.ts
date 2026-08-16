import { JsonValue } from '../objects/json-types';
import { parseJsonFile } from '../utils/json-helper';
import { SuiteConfig } from '../objects/suites';

export function parseSuiteConfig(filePath: string): SuiteConfig {

  const data = parseJsonFile<JsonValue>(filePath);

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`Suite config file must contain a JSON object: ${filePath}`);
  }

  return data as SuiteConfig;
}

export default {
  parseSuiteConfig
}
