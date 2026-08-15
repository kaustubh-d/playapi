import * as fs from 'node:fs';
import * as path from 'node:path';

export type JsonPrimitive = string | number | boolean | null;
export interface JsonObject {
  [key: string]: any;
}
export type JsonArray = any[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export function parseJsonFile<T = JsonValue>(filePath: string): T {
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`JSON file not found: ${resolvedPath}`);
  }

  const raw = fs.readFileSync(resolvedPath, 'utf8');

  try {
    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    throw new Error(`Failed to parse JSON file "${resolvedPath}": ${message}`);
  }
}

export function getJsonValueByPath(source: JsonObject | JsonArray | JsonValue, pathExpression: string): JsonValue | undefined {
  if (source === null || source === undefined) {
    return undefined;
  }

  const segments = pathExpression
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

  let current: JsonValue | undefined = source as JsonValue;

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

    current = (current as JsonObject)[segment];
  }

  return current;
}

export default {
  parseJsonFile,
  getJsonValueByPath,
};