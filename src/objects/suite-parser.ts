/// <reference types="node" />
import { JsonValue, parseJsonFile } from './json-helper';

export type RetryConfig = {
  attempts: number;
  delay_seconds: number;
};

export type Config = {
  environment: string;
  default_headers: Record<string, string>;
  timeout_seconds: number;
  retry: RetryConfig;
};

export type Suite = {
  name: string;
  description: string;
};

export type SuiteConfig = {
  suite: Suite;
  config: Config;
  variables: Record<string, string>;
};

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
