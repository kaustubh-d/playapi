/// <reference types="node" />
import * as fs from 'node:fs';
import * as path from 'node:path';
import { JsonValue, JsonObject, JsonArray } from '../objects/json-types';

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

// This function resolves a dot-separated path expression to retrieve a value from a nested object or array.
// param: source: The json source object or array from which to retrieve the value.
// param: path: A dot-separated string representing the path to the desired value.
// return: The value at the specified path, or undefined if the path does not exist.
export function resolvePath(source: unknown, path: string): unknown {
  if (!path) {
    return source;
  }

  const segments = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let current: unknown = source;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

export default {
  parseJsonFile,
  getJsonValueByPath,
  resolvePath,
};