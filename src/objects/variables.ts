
export type VariablePair = { variable_name: string; variable_value: string };
export type VariableMap = Record<string, string> | VariablePair[];

const PLACEHOLDER_PATTERN = /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g;
