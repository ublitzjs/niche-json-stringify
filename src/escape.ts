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

