import runTests from "./abstraction"
import {createRequire} from "node:module"
var require = createRequire(import.meta.url);
await runTests(/*External dependencies not to be bundled with esbuild*/ [], [
  {
    // test "exports" field in package.json when running vitest
    normalCJS: require("@ublitzjs/niche-json-stringify"),
    // test "exports" field in package.json when running vitest
    normalESM: await import("@ublitzjs/niche-json-stringify"),
    // name of testing function from "all.ts"
    test: "testIndexModule",
    // name of file in 'src' with .js extension to be minified and bundled 
    name: "index.js"
  },
])
