import {
  bool_arr_bun, bool_arr_node, num_arr_bun, num_arr_node, str_arr_bun, str_arr_esc_gen, str_arr_node
} from "./array.js"
import { FJSescape } from "./escape.js"
import type { Static } from "typebox"
type closureFeaturesT = {
  esc: boolean;
  num_arr: boolean;
  bool_arr: boolean;
  str_arr: boolean
  str_arr_esc: boolean
}
function getObjectStringifyInternals_bun(
  variableName: string,
  innerArrI: number,
  features: closureFeaturesT,
  schema: TObject
): string {

  var body: string = "{"
  var STRING_TERNARY = (val: string, IF: string, ELSE: string) => `'+(${val}?${IF}:${ELSE})+'`
  var isFirstKey = true;

  for (const key in schema.properties) {
    if (typeof key != "string") throw new TypeError("key is not string, cannot make JSON")
    if (isFirstKey) { isFirstKey = false; } else { body += ','; }
    body += `"${key}":`
    var value = schema.properties[key] as any;
    var innerVariableName = `${variableName}.${key}`;
    if (value.type == "object") {
      body +=
        value.additionalProperties
          ? `'+JSON.stringify(${innerVariableName})+'`
          : getObjectStringifyInternals_bun(innerVariableName, innerArrI, features, value)
    } else if (value.type == "array") {
      body += `'+${getArrayStringifyInternals_bun(innerVariableName, innerArrI, features, value)}+'`;
    } else if (value.type == "string") {
      if (value.format == "unsafe") {
        body +=
          value.default
            ? STRING_TERNARY(innerVariableName, `"\"${innerVariableName}\""`, JSON.stringify(value.default))
            : `\"'+(${innerVariableName})+'\"`
      } else {
        features.esc = true
        body +=
          value.default
            ? STRING_TERNARY(innerVariableName, `esc(${innerVariableName})`, `'"'+${JSON.stringify(value.default)}+'"'`)
            : `'+esc(${innerVariableName})+'`
      }
    } else if (value.type == "number" || value.type == "integer" || value.type == "boolean") {
      body +=
        value.default
          ? STRING_TERNARY(innerVariableName, innerVariableName, String(value.default))
          : `'+(${innerVariableName})+'`
    } else {
      throw new TypeError("Currently we do not support anything different from 'object', 'array', 'string', 'boolean', 'integer', 'number'")
    }
  }
  body += '}'
  return schema.default ? STRING_TERNARY(variableName, "'" + body + "'", "'" + JSON.stringify(schema.default) + "'") : body
}
function getArrayStringifyInternals_bun<TSchema extends TArray>(
  variableName: string,
  innerArrI: number,
  features: closureFeaturesT,
  schema: TSchema
): string {
  var STRING_TERNARY = (val: string, IF: string, ELSE: string)=>`(${val}?${IF}:${ELSE})`
  var body: string
  var type = schema.items.type
  if(type==="object"){
    var innerArr = 'arr' + innerArrI
    body = 
      `(()=>{` 
      + `var res='[';var f=true;var ${innerArr}=${variableName};`
      + `for(let i=0;i<${innerArr}.length;i++){`
        + `res+=(f?"":",")+` 
          + '\'' + getObjectStringifyInternals_bun(innerArr+`[i]`, innerArrI+1, features, schema.items as any) + '\';'
        + "f&&(f=false)"
      + `};return res+']'`
    + `})()`
  } else if (type === "string") {
    if((schema.items as any).format === "unsafe") {
      features.str_arr = true
      body = `str_arr(${variableName})`
    } else {
      features.str_arr_esc = true
      body = `str_arr_esc(${variableName})`
    }
  } else if (["integer", "number"].includes(type)) {
    features.num_arr = true;
    body = `num_arr(${variableName})`
  } else if (type === "boolean") {
    features.bool_arr = true;
    body = `bool_arr(${variableName})`
  } else {
    //throw new Error("NO SUPPORT FOR THIS", {cause: itemSchema.type})
    body = `JSON.stringify(${variableName})`
  }
  return schema.default ? STRING_TERNARY(variableName, body, "'" + JSON.stringify(schema.default) + "'") : body
}
type TObject = { type: "object", properties: any; default?: object }
type TArray = { type: "array", items: any; default?: any[] }

/**
* Generate a serialiser for your payload, based on a JSON schema.
* Resuling serialiser does not validate your input.
* All "string" input properties are escaped by default. To disable use format: "unsafe".
* @param schema either Object schema or Array schema. Contents may vary, but supported property types are: object, array, string, number, integer, boolean. Out of special features it supports "default" (with ternary operator) for every schema and "additionalProperties" (just JSON.stringify) for object schemas.
* @param [esc=FJSescape] escaping function for strings. Defaults to "fast-json-stringify" implementation (exported as FJSescape), but can also use "compile-json-stringify" version (see use cases) or something like JSON.escape, if it appears.
* */
export function createStringify<TSchema extends TObject | TArray>(schema: TSchema, esc = FJSescape): (obj: Static<TSchema>)=>string {
  var paramName = "param"
  var isBun = "Bun" in globalThis;
  var closureFeatures: closureFeaturesT = {
    esc: false, num_arr: false, bool_arr: false, str_arr: false, str_arr_esc: false
  }
  var closureFeaturesMap: Record<keyof closureFeaturesT, any> = {
    esc, num_arr: isBun ? num_arr_bun : num_arr_node, bool_arr: isBun ? bool_arr_bun : bool_arr_node, str_arr: isBun ? str_arr_bun : str_arr_node, str_arr_esc: str_arr_esc_gen(esc)
  }
  var body: string
  if (schema.type == "object") {
    body = `return function fn(param){return'${getObjectStringifyInternals_bun(paramName, 0, closureFeatures, schema)}'}`;
  } else {
    if (["number", "integer"].includes(schema.items.type)) {
      return (isBun ? num_arr_bun : num_arr_node) as any;
    } else if (schema.items.type == "boolean") {
      return (isBun ? bool_arr_bun : bool_arr_node) as any;
    } else if (schema.items.type == "string") {
      if (schema.items.format == "unsafe") {
        return (isBun ? str_arr_bun : str_arr_node) as any;
      } else return closureFeaturesMap.str_arr_esc as any;
    } else {
      body = `return function fn(param){var res='';return ${getArrayStringifyInternals_bun(paramName, 0, closureFeatures, schema)}}`;
    }
  }
  var closureStringArgs: string[] = []
  var closureArgs: any[] = []
  var key: keyof closureFeaturesT
  for (key in closureFeatures) {
    if(closureFeatures[key]) {
      closureStringArgs.push(key)
      closureArgs.push(closureFeaturesMap[key])
    }
  }
  return new Function(...closureStringArgs, "'use strict';" +body)(...closureArgs) as any;
}
export * from "./array.js"
export * from "./escape.js"
