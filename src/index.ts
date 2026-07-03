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
      let contents: string = 
        value.additionalProperties 
          ? `JSON.stringify(${innerVariableName})`
          : getObjectStringifyInternals(innerVariableName, innerArrI, features, value)
      body +=
        value.default
          ? STRING_TERNARY(innerVariableName, contents, JSON.stringify(value.default))
          : contents
    } else if (value.type == "array") {
      let contents = getArrayStringifyInternals(innerVariableName, innerArrI, features, value.items);
      body +=
        value.default
          ? STRING_TERNARY(innerVariableName, contents, JSON.stringify(value.default))
          : `'+${contents}+'`
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
          ? STRING_TERNARY(innerVariableName, `"${innerVariableName}"`, `${JSON.stringify(value.default)}`)
          : `'+(${innerVariableName})+'`
    } else {
      throw new TypeError("Currently we do not support anything different from 'object', 'array', 'string', 'boolean', 'integer', 'number'")
    }
  }
  body += '}'
  return body;
}
function getArrayStringifyInternals<TSchema extends {type: SupportedValues}>(
  currentElementVariableName: string,
  innerArrI: number,
  features: closureFeaturesT,
  itemSchema: TSchema
): string {
  var body: string
  var type = itemSchema.type
  if(type==="object"){
    var innerArr = 'arr' + innerArrI
    body = 
      `(()=>{` 
      + `var res='[';var f=true;var ${innerArr}=${currentElementVariableName};`
      + `for(let i=0;i<${innerArr}.length;i++){`
        + `res+=(f?"":",")+` 
          + '\'' + getObjectStringifyInternals(innerArr+`[i]`, innerArrI+1, features, itemSchema as any) + '\';'
        + "f&&(f=false)"
      + `};return res+']'`
    + `})()`
  } else if (type === "string") {
    if((itemSchema as any).format === "unsafe") {
      features.str_arr = true
      body = `str_arr(${currentElementVariableName})`
    } else {
      features.str_arr_esc = true
      body = `str_arr_esc(${currentElementVariableName})`
    }
  } else if (["integer", "number"].includes(type)) {
    features.int_arr = true;
    body = `int_arr(${currentElementVariableName})`
  } else if (type === "boolean") {
    features.bool_arr = true;
    body = `bool_arr(${currentElementVariableName})`
  } else {
    //throw new Error("NO SUPPORT FOR THIS", {cause: itemSchema.type})
    body = `JSON.stringify(${currentElementVariableName})`
  }
  return body
}
type TObject = { type: "object", properties: any }
type TArray = { type: "array", items: any }
type SupportedValues = 'object' | 'array' | 'string' | 'boolean' | 'integer' | 'number'

function int_arr(DATA: number[]): string {
  var l = DATA.length;
  if(!l) return '[]'
  var result = '['+ DATA[0]
  for(var i = 1; i < l; i++){
    result+=","+DATA[i]
  }
  return result + ']'
}
function bool_arr(DATA: boolean[]): string {
  var l = DATA.length;
  if(!l) return '[]'
  var result = '['+(DATA[0]?'true':'false')
  for(var i = 1; i < l; i++){
    result+=","+(DATA[i]?'true':'false')
  }
  return result + ']'
}
function str_arr_node(DATA: string[]): string {
  let r=DATA.join('","');return r?'["'+r+'"]':'[]'
}
function str_arr_esc_gen(esc: (str:string)=>string): (DATA:string[])=>string {
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
function str_arr_bun(DATA: string[]): string {
  var l = DATA.length;
  if(!l) return '[]'
  var result = '["'+DATA[0]!+'"'
  for(var i = 1; i < l; i++){
    result+=',"'+DATA[i]+'"'
  }
  return result + ']'
}
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
      body = "return function fn(param){return " + getArrayStringifyInternals(paramName, 0, closureFeatures, schema.items) + "}";
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
 * This function was taken from fast-json-stringify. 
 * License allows redistribution of their code, until their initial effort is recognised
 * @description escapes all characters, incompatible with JSON specification.
 * Is a default function for "createStringify"
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

//const CJS_ESC_REGEX = /[\0-\x1f"\\]/
const CJS_ESC_REGEX = /[\u0000-\u001f"\\]/;
/**
 * This functionality was taken from compile-json-stringify. 
 * License allows redistribution of their code, until their initial effort is recognised
 * @description escapes most characters (without UTF-16 surrogates), incompatible with JSON specification.
 * Using with "createStringify" adds a certain speedup, but do not use it whe serialising client-side data.
 **/
export function CJSescape(str: string): string {
  return CJS_ESC_REGEX.test(str) ? JSON.stringify(str) : '"' + str + '"'
}
