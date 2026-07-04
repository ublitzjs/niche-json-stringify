import type { Static } from "typebox"
type closureFeaturesT = {
  esc: boolean;
  int_arr: boolean;
  bool_arr: boolean;
  str_arr: boolean
  str_arr_esc: boolean
}
function getObjectStringifyInternals(
  variableName: string,
  innerArrI: number,
  features: closureFeaturesT,
  schema: TObject
): string {
  
  var body: string = "{"
  var STRING_TERNARY = (val: string, IF: string, ELSE: string)=>`'+(${val}?${IF}:${ELSE})+'`
  var isFirstKey = true;
  
  for (const key in schema.properties) {
    if (typeof key != "string") throw new TypeError("key is not string, cannot make JSON")
    if (isFirstKey) { isFirstKey = false; } else { body += ','; }
    body += `"${key}":`
    var value = schema.properties[key] as any;
    var innerVariableName = `${variableName}.${key}`;
    if (value.type == "object") { 
      body+=
        value.additionalProperties 
          ? `'+JSON.stringify(${innerVariableName})+'`
          : getObjectStringifyInternals(innerVariableName, innerArrI, features, value)
    } else if (value.type == "array") {
      body += `'+${getArrayStringifyInternals(innerVariableName, innerArrI, features, value)}+'`;
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
    } else if(value.type == "number" || value.type == "integer" || value.type == "boolean"){
      body +=
        value.default
          ? STRING_TERNARY(innerVariableName, innerVariableName, String(value.default))
          : `'+(${innerVariableName})+'`
    } else {
      throw new TypeError("Currently we do not support anything different from 'object', 'array', 'string', 'boolean', 'integer', 'number'")
    }
  }
  body += '}'
  return schema.default ? STRING_TERNARY(variableName, "'" + body + "'", "'" + JSON.stringify(schema.default)+ "'") : body
}
function getArrayStringifyInternals<TSchema extends TArray>(
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
          + '\'' + getObjectStringifyInternals(innerArr+`[i]`, innerArrI+1, features, schema.items as any) + '\';'
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
    features.int_arr = true;
    body = `int_arr(${variableName})`
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
* Serialise an array of integers. 
* */
export function int_arr(DATA: number[]): string {
  var l = DATA.length;
  if(!l) return '[]'
  var result = '['+ DATA[0]
  for(var i = 1; i < l; i++){
    result+=","+DATA[i]
  }
  return result + ']'
}
/**
* Serialise an array of boolean values.
* The fastest in Bun for all lengths of arrays and in NodeJS for arrays with length < 20
* */
export function bool_arr(DATA: boolean[]): string {
  var l = DATA.length;
  if(!l) return '[]'
  var result = '['+(DATA[0]?'true':'false')
  for(var i = 1; i < l; i++){
    result+=","+(DATA[i]?'true':'false')
  }
  return result + ']'
}
/**
* Serialise an array of strings in NodeJS without escaping characters
* */
export function str_arr_node(DATA: string[]): string {
  let r=DATA.join('","');return r?'["'+r+'"]':'[]'
}
/**
* Generate a serialiser for a string[], which escapes characters.
* Usually slower than JSON.stringify
* @param esc escaping function, like CJSescape or FJSescape
* */
export function str_arr_esc_gen(esc: (str:string)=>string): (DATA:string[])=>string {
  return (DATA) => {
    var l = DATA.length;
    if (!l) return '[]'
    var result = '[' + esc(DATA[0]!)
    for (var i = 1; i < l; i++) {
      result += ',' + esc(DATA[i]!)
    }
    return result + ']'
  }
}
/**
* Serialise an array of strings in Bun without escaping characters
* */
export function str_arr_bun(DATA: string[]): string {
  var l = DATA.length;
  if(!l) return '[]'
  var result = '["'+DATA[0]!+'"'
  for(var i = 1; i < l; i++){
    result+=',"'+DATA[i]+'"'
  }
  return result + ']'
}
/**
* Generate a serialiser for your payload, based on a JSON schema.
* Resuling serialiser does not validate your input.
* All "string" input properties are escaped by default. To disable use format: "unsafe".
* @param schema either Object schema or Array schema. Contents may vary, but supported property types are: object, array, string, number, integer, boolean. Out of special features it supports "default" (with ternary operator) for every schema and "additionalProperties" (just JSON.stringify) for object schemas.
* @param [esc=FJSescape] escaping function for strings. Defaults to "fast-json-stringify" implementation (exported as FJSescape), but can also use "compile-json-stringify" version (see use cases) or something like JSON.escape, if it appears.
* */
export function createStringify<TSchema extends TObject | TArray>(schema: TSchema, esc = FJSescape): (obj: Static<TSchema>)=>string {
  var paramName = "param"
  var closureFeatures: closureFeaturesT = {
    esc: false, int_arr: false, bool_arr: false, str_arr: false, str_arr_esc: false
  }
  var closureFeaturesMap: Record<keyof closureFeaturesT, any> = {
    esc, int_arr, bool_arr, str_arr: "Bun" in globalThis ? str_arr_bun : str_arr_node, str_arr_esc: str_arr_esc_gen(esc)
  }
  var body: string
  if(schema.type == "object"){
    body = `return function fn(param){return'` + getObjectStringifyInternals(paramName, 0, closureFeatures, schema) + "'}";   
  } else {
    if (["number", "integer"].includes(schema.items.type) && "Bun" in globalThis) {
      return int_arr as any
    } else if(schema.items.type == "boolean") {
      return bool_arr as any;
    } else if(schema.items.type == "string") {
      if (schema.items.format == "unsafe") {
        if("Bun" in globalThis) return str_arr_bun as any
        else return str_arr_node as any
      } else return closureFeaturesMap.str_arr_esc as any;
    } else {
      body = "return function fn(param){return " + getArrayStringifyInternals(paramName, 0, closureFeatures, schema) + "}";
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
const FJS_ESC_REGEX = /[\0-\x1f"\\\ud800-\udfff]/

/**
 * @description
 * escapes all characters, incompatible with JSON specification.
 * Is a default escaping function for "createStringify"
 * @license
 * Copyright (c) Fastify contributors
 * Licensed under the MIT License.
 *
 * Original source:
 * https://github.com/fastify/fast-json-stringify
 **/
export function FJSescape(str: string): string {
    const len = str.length
    if (len === 0) {
      return '""'
    } else if (len < 42) {
      // magically escape strings for json
      // relying on their charCodeAt
      // everything below 32 needs JSON.stringify()
      // every string that contain surrogate needs JSON.stringify()
      // 34 and 92 happens all the time, so we
      // have a fast case for them
      let result = ''
      let last = -1
      let point = 255
      for (let i = 0; i < len; i++) {
        point = str.charCodeAt(i)
        if (
          point === 0x22 || // '"'
          point === 0x5c // '\'
        ) {
          last === -1 && (last = 0)
          result += str.slice(last, i) + '\\'
          last = i
        } else if (point < 32 || (point >= 0xD800 && point <= 0xDFFF)) {
          // The current character is non-printable characters or a surrogate.
          return JSON.stringify(str)
        }
      }
      return (last === -1 && ('"' + str + '"')) || ('"' + result + str.slice(last) + '"')
    } else if (len < 5000 && FJS_ESC_REGEX.test(str) === false) {
      // Only use the regular expression for shorter input. The overhead is otherwise too much.
      return '"' + str + '"'
    } else {
      return JSON.stringify(str)
    }
}

const CJS_ESC_REGEX = /[\u0000-\u001f"\\]/;
/**
 * @description 
 * escapes most characters (except UTF-16 surrogates), incompatible with JSON specification.
 * Using with "createStringify" adds a certain speedup, but might not work for all client-side data.
 * @license
 * Copyright (c) Nathan Woltman 2018
 * Licensed under the MIT License.
 *
 * Original source:
 * https://github.com/nwoltman/compile-json-stringify
 **/
export function CJSescape(str: string): string {
  return CJS_ESC_REGEX.test(str) ? JSON.stringify(str) : '"' + str + '"'
}
