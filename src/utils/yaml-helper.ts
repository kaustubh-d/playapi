/// <reference types="node" />
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse as parseYaml } from 'yaml';

export type YamlValue =
  | string
  | number
  | boolean
  | null
  | YamlObject
  | YamlArray;

export type YamlObject = { [key: string]: YamlValue };
export type YamlArray = YamlValue[];

export function parseYamlFile<T = YamlValue>(filePath: string): T {
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`YAML file not found: ${resolvedPath}`);
  }

  const raw = fs.readFileSync(resolvedPath, 'utf8');

  try {
    const parsed = parseYaml(raw) as T;
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    throw new Error(`Failed to parse YAML file "${resolvedPath}": ${message}`);
  }
}

export function getYamlValueByPath(
  source: YamlObject | YamlArray | YamlValue,
  pathExpression: string,
): YamlValue | undefined {
  if (source === null || source === undefined) {
    return undefined;
  }

  const segments = pathExpression
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

  let current: YamlValue | undefined = source as YamlValue;

  for (const segment of segments) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }

    if (Array.isArray(current)) {
      const index = Number(segment);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return undefined;
      }
      current = current[index];
      continue;
    }

    if (!(segment in current)) {
      return undefined;
    }

    current = (current as YamlObject)[segment];
  }

  return current;
}

export default {
  parseYamlFile,
  getYamlValueByPath,
};
