
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
  resolvePath,
};