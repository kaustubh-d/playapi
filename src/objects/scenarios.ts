import { JsonValue, JsonObject, JsonArray, JsonPrimitive } from '../objects/json-types';

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
