import { JsonValue } from '../objects/json-types';
import { parseJsonFile } from '../utils/json-helper';
import { YamlValue } from '../objects/yaml-types'
import { parseYamlFile } from '../utils/yaml-helper';
import { SuiteConfig } from '../objects/suites';

export function parseSuiteConfig(filePath: string): SuiteConfig {
  const lowerFilePath = filePath.toLowerCase();
  let data: JsonValue | YamlValue | null;

  if (lowerFilePath.endsWith('.json')) {
    data = parseJsonFile<JsonValue>(filePath);
  } else if (lowerFilePath.endsWith('.yaml') || lowerFilePath.endsWith('.yml')) {
    data = parseYamlFile<YamlValue>(filePath);
  } else {
    throw new Error(`Suite config file must have a .json, .yaml, or .yml extension: ${filePath}`);
  }

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`Suite config file must contain a JSON/YAML object: ${filePath}`);
  }

  return data as SuiteConfig;
}

export default {
  parseSuiteConfig
}
