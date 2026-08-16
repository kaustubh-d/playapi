
export type JsonPrimitive = string | number | boolean | null;
export interface JsonObject {
  [key: string]: any;
}
export type JsonArray = any[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
