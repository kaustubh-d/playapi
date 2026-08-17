import { parseJsonFile, getJsonValueByPath} from '../utils/json-helper';
import { JsonValue } from '../objects/json-types';
import { YamlValue } from '../objects/yaml-types'
import { parseYamlFile } from '../utils/yaml-helper';
import { ScenarioObject, ScenarioStep } from '../objects/scenarios';
import { logger } from '../utils/logger';

export function parseScenarioFile(filePath: string): ScenarioObject {
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
    throw new Error(`Scenario file must contain a JSON object: ${filePath}`);
  }

  logger.info(`Parsed scenario file: ${filePath}`);

  return data as ScenarioObject;
}


export function getScenarioStepById(scenario: ScenarioObject, stepId: string): ScenarioStep | undefined {
  return scenario.steps?.find((step) => step.id === stepId);
}

export function getScenarioVariable(scenario: ScenarioObject, variableName: string): JsonValue | undefined {
  return scenario.variables?.[variableName];
}

export function resolveTemplateValue(value: JsonValue | undefined, variables: Record<string, JsonValue> = {}): JsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key: string) => {
      const resolved = variables[key];
      if (resolved === undefined || resolved === null) {
        return '';
      }
      if (typeof resolved === 'object') {
        return JSON.stringify(resolved);
      }
      return String(resolved);
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveTemplateValue(item, variables));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).reduce<Record<string, JsonValue>>((acc, [key, item]) => {
      acc[key] = resolveTemplateValue(item, variables) as JsonValue;
      return acc;
    }, {});
  }

  return value;
}

export default {
  parseJsonFile,
  parseScenarioFile,
  getJsonValueByPath,
  getScenarioStepById,
  getScenarioVariable,
  resolveTemplateValue,
};
