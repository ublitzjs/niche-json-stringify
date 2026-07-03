import {Bench} from "tinybench"
import {createStringify} from "@ublitzjs/niche-json-stringify"
import {build} from "fast-json-stringify"
//@ts-ignore
import compileJSONStringify from "compile-json-stringify"
import { BenchmarkSchema, benchmarkValue } from "./hugeJSONSchema"
var closure = (name: string, cb: (bench: Bench)=>void)=>{console.info(name); cb(new Bench({name, time: 1000}))}
var ARR = Array(100).fill(benchmarkValue)
var KB = Math.floor(JSON.stringify(ARR).length / 1024) + " KB "
function normalise(task: any) {
  
    return {
      name: task.name,
      throuput: task.result.state === "completed" ? task.result.throughput.mean : "ERRORED"
    }
}
closure("Bench " + KB + "payload with safe strings", (bench)=>{
  var schema = BenchmarkSchema({format: "safe"})
  var fastStringify = build(schema)
  var nicheStringify = createStringify(schema)
  var compiledStringify = compileJSONStringify(schema)
  bench.add("fast-json-stringify", ()=>{
    fastStringify(ARR);
  }).add("compiled-json-stringify", ()=>{
    compiledStringify(ARR);
  }).add("niche-json-stringify", ()=>{
    nicheStringify(ARR);
  }).add("JSON.stringify", ()=>{
    JSON.stringify(ARR)
  }).runSync()
  console.table(bench.table(normalise))
})
closure("Bench " + KB + "payload with unsafe strings", (bench)=>{
  var schema = BenchmarkSchema({format: "unsafe"})
  var fastStringify = build(schema)
  var nicheStringify = createStringify(schema)
  bench.add("fast-json-stringify", ()=>{
    fastStringify(ARR);
  }).add("niche-json-stringify", ()=>{
    nicheStringify(ARR);
  }).runSync()
  console.table(bench.table(normalise))
})
