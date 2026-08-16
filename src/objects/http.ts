import { JsonValue, JsonObject, JsonArray, JsonPrimitive } from './json-types';

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';


export interface HttpRequest {
  method?: HttpMethod;
  url?: string;
  headers?: Record<string, string>;
  body?: JsonObject | JsonArray | JsonPrimitive;
  [key: string]: JsonValue | undefined;
}

export interface HttpResponse {
  headers: Record<string, string>;
  body: JsonValue | string | null;
  status: number;
  statusText: string;
}