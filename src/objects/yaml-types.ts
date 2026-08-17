export type YamlPrimitive = string | number | boolean | null;
export interface YamlObject {
  [key: string]: any;
}
export type YamlArray = any[];
export type YamlValue = YamlPrimitive | YamlObject | YamlArray;
