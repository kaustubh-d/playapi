import { parseJsonFile, getJsonValueByPath, JsonValue, JsonObject, JsonArray, JsonPrimitive } from './json-helper';


export interface ScenarioObject {
  name?: string;
  description?: string;
  variables?: Record<string, JsonValue>;
  steps?: ScenarioStep[];
  [key: string]: JsonValue | undefined;
}

export interface ScenarioStep {
  id?: string;
  run_if?: ConditionExpression;
  request?: HttpRequest;
  capture?: CaptureDefinition[];
  assertions?: AssertionsMap;
  on_failure?: 'continue' | 'abort' | (string & {});
  [key: string]: JsonValue | undefined;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequest {
  method?: HttpMethod;
  url?: string;
  headers?: Record<string, string>;
  body?: JsonObject | JsonArray | JsonPrimitive;
  [key: string]: JsonValue | undefined;
}

export interface CaptureDefinition {
  variable_name: string;
  from: 'body' | 'headers' | 'response' | (string & {});
  path: string;
  [key: string]: JsonValue | undefined;
}

export interface ConditionExpression {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | (string & {});
  value?: JsonValue;
  [key: string]: JsonValue | undefined;
}

export interface AssertionsMap {
  status?: { equals?: number; contains?: string; [key: string]: JsonValue | undefined };
  headers?: Record<string, Record<string, JsonValue>>;
  body?: BodyAssertion[];
  [key: string]: JsonValue | undefined;
}

export interface BodyAssertion {
  path: string;
  exists?: boolean;
  equals?: JsonValue;
  in?: JsonValue[];
  contains?: string | number;
  greater_than?: number;
  less_than?: number;
  [key: string]: JsonValue | undefined;
}



export function parseScenarioFile(filePath: string): ScenarioObject {
  const data = parseJsonFile<JsonValue>(filePath);

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`Scenario file must contain a JSON object: ${filePath}`);
  }

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
