/**
 * This benchmark is adapted from the fast-json-stringify project.
 *
 * Copyright (c) Fastify contributors
 * Licensed under the MIT License.
 *
 * Original source:
 * https://github.com/fastify/fast-json-stringify
 */
'use strict'

import { workerData as benchmark, parentPort } from 'worker_threads'

import { Bench } from 'tinybench'

const bench = new Bench({
  name: benchmark.name,
  setup: (_task, mode) => {
    // Run the garbage collector before warmup at each cycle
    if (mode === 'warmup' && typeof globalThis.gc === 'function') {
      globalThis.gc()
    }
  }
})

import { createStringify } from "@ublitzjs/niche-json-stringify"
import createFastJSON from "fast-json-stringify"

try {
  var stringify = createStringify(benchmark.schema)
  var stringify2 = createFastJSON(benchmark.schema)
} catch(ERR) {
  console.error("ERR", ERR, benchmark)
  process.exit(0)
}

bench.add("niche", () => {
  stringify(benchmark.input)
}).add("fast", () => {
  stringify2(benchmark.input)
}).add("standard", () => {
  JSON.stringify(benchmark.input)
}).run().then(() => {
  const results = bench.tasks.map((task)=>{
    const hz = (task.result as any).throughput.mean // ops/sec
    //const rme = task!.result.latency.rme // relative margin of error (%)
    //const samples = task!.result.latency.df + 1 // degrees of freedom + 1 = sample count
    const formattedHz = hz.toLocaleString('en-US', { maximumFractionDigits: 0 })
    return `${task.name}(${formattedHz} ops/sec)`
  })
  //const formattedRme = rme.toFixed(2)

  //const output = `${task!.name} x ${formattedHz} ops/sec ±${formattedRme}% (${samples} runs sampled)`
  parentPort!.postMessage(benchmark.name +": \n\t"+ results.join(" vs ") + "\n")
}).catch(err => parentPort!.postMessage(`Error: ${err.message}`))
