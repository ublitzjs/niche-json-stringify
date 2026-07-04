import { expect, it, describe } from "vitest"
import { Type } from "typebox"
import { BenchmarkSchema, benchmarkValue } from "./hugeJSONSchema"
// here if we write "typeof import" we test package.json (when write - "exports", when use tsd - "typesVersion") 
function testSerializer<T>(
  name: string,
  stringify: (value: T) => string,
  value: T
) {
  it(name, () => {
    expect(stringify(value)).toBe(JSON.stringify(value));
  });
}
function escapeThisHell(version: string, module: typeof import("@ublitzjs/niche-json-stringify"), escape: (str: string) => string) {
  function ver(param: string) { return version + " - " + param }
  var stringify = module.createStringify(Type.Object({s: Type.String()}), escape)
  describe("escaping", () => {
    testSerializer(ver("quotes"), stringify, { s: '"hello"', });
    testSerializer(ver("backslashes"), stringify, { s: "\\", });
    testSerializer(ver("newline"), stringify, { s: "a\nb", });
    testSerializer(ver("tab"), stringify, { s: "a\tb", });
    testSerializer(ver("mixed"), stringify, { s: "\"hello\"\n\\world\t!", });
  });
  describe("unicode", () => {
    describe("surrogate", {fails: version == "CJS escape"}, ()=>{
      testSerializer(ver("high"), stringify, { s: "\uD800", });

      testSerializer(ver("low"), stringify, { s: "\uDC00", });
    })

    testSerializer(ver("emoji"), stringify, { s: "😀🚀", });

    testSerializer(ver("cyrillic"), stringify, { s: "Привіт", });

    testSerializer(ver("japanese"), stringify, { s: "こんにちは", });
  });
}
export function testIndexModule(module: typeof import("@ublitzjs/niche-json-stringify")) {
  describe("HUGE 2KB input", () => {
    var stringify = module.createStringify(BenchmarkSchema({format: "safe"}))
    expect(stringify([benchmarkValue, benchmarkValue]), JSON.stringify([benchmarkValue, benchmarkValue]))
    it("is deterministic", () => {
      const a = module.createStringify(BenchmarkSchema({format: "safe"}))([benchmarkValue]);
      const b = module.createStringify(BenchmarkSchema({format: "safe"}))([benchmarkValue]);
      const c = module.createStringify(BenchmarkSchema({format: "safe"}))([benchmarkValue]);

      expect(a).toBe(b);
      expect(b).toBe(c);
    });
  })
  describe("arrays", () => {
    testSerializer(
      "empty string array",
      module.createStringify({ type: "array", items: { type: "string" } }),
      []
    );

    testSerializer(
      "string array",
      module.createStringify({ type: "array", items: { type: "string" } }),
      ["a", "b", "c",]
    );

    testSerializer(
      "escaping string array",
      module.createStringify({ type: "array", items: { type: "string" } }),
      ["\na", "b", "c",]
    );

    testSerializer(
      "number array",
      module.createStringify({ type: "array", items: { type: "number" } }),
      [1, 2, 3]
    );

    testSerializer(
      "boolean array",
      module.createStringify({ type: "array", items: { type: "boolean" } }),
      [true, false, true]
    );

    testSerializer(
      "object array",
      module.createStringify({
        type: "array",
        items: {
          type: "object",
          properties: {
            a: { type: "number" },
            b: { type: "string" }
          }
        }
      }),
      [{ a: 1, b: "x", }, { a: 2, b: "y", },]
    );
  });
  describe("objects", () => {
    testSerializer(
      "flat object",
      module.createStringify(
        Type.Object({
          a: Type.Integer(),
          b: Type.String(),
          c: Type.Boolean()
        })
      ),
      { a: 1, b: "hello", c: true, }
    );
    testSerializer(
      "nested object",
      module.createStringify(
        Type.Object({
          a: Type.Object({
            b: Type.Object({
              c: Type.Object({
                d: Type.Number()
              })
            }),
          }),
        })
      ),
      { a: { b: { c: { d: 123, }, }, }, }
    );

    testSerializer(
      "deep arrays",
      module.createStringify(
        Type.Array(Type.Array(Type.Array(Type.Array(Type.String()))))
      ),
      [[[["data"]]]]
    );
  });
  // currently no support default values
  describe("empty collections", () => {
    testSerializer("empty object", module.createStringify(Type.Object({})), {});
    testSerializer("empty array", module.createStringify(Type.Array(Type.Number())), []);
  });

  escapeThisHell("FJS escape", module, module.FJSescape);
  escapeThisHell("CJS escape", module, module.CJSescape);

  describe("default values", ()=>{
    describe("outer object", ()=>{
      var defValue = {a: 123, b: "abc"}
      var stringify = module.createStringify(
        Type.Object({ a: Type.Number(), b: Type.String() }, { default: defValue })
      );
      it("fallback if no param", ()=>{
        expect(stringify(undefined as any)).toBe(JSON.stringify(defValue))
      })
      testSerializer("no fallback if has param", stringify, defValue);
    })
    describe("object properties", ()=>{
      var defValue = {
        obj: { a: 123 },
        array: [false],
        num: 10.1,
        int: 10,
        str: "the_str",
        bool: true
      };
      var stringify = module.createStringify(
        Type.Object({
          obj: Type.Object({ a: Type.Number() }, { default: { a: 123 } }),
          array: Type.Array(Type.Boolean(), { default: [false] }),
          num: Type.Number({ default: 10.1 }),
          int: Type.Integer({ default: 10 }),
          str: Type.String({ default: "the_str"}),
          bool: Type.Boolean({ default: true }),
        })
      );
      it("fallback if no params", ()=>{
        expect(stringify({} as any)).toBe(JSON.stringify(defValue))
      })
      testSerializer("no fallback if has param", stringify, defValue);
    })
  })
  testSerializer("additional properties in object", module.createStringify(Type.Object({
    a: Type.Object({}, { additionalProperties: true })
  })), { a: { prop: 123, prop2: "true" } } as any);
}
