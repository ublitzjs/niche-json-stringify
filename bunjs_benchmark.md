1. bun tests/benchmark.ts
Bench 189 KB payload with safe strings
┌───┬─────────────────────────┬────────────────────┐
│   │ name                    │ throuput           │
├───┼─────────────────────────┼────────────────────┤
│ 0 │ fast-json-stringify     │ 898.023144251112   │
│ 1 │ compiled-json-stringify │ 2086.8277888335806 │
│ 2 │ niche-json-stringify    │ 2240.496009381406  │
│ 3 │ JSON.stringify          │ 1823.4067453361497 │
└───┴─────────────────────────┴────────────────────┘
Bench 189 KB payload with unsafe strings
┌───┬──────────────────────┬───────────────────┐
│   │ name                 │ throuput          │
├───┼──────────────────────┼───────────────────┤
│ 0 │ fast-json-stringify  │ 2568.058127749514 │
│ 1 │ niche-json-stringify │ 6805.366821565045 │
└───┴──────────────────────┴───────────────────┘


2. bun tests/fast-json-stringify-benchmark.ts
short array of numbers...................................: 
	fast(151,346 ops/sec) vs niche(269,419 ops/sec) vs standard(187,449 ops/sec)

short array of integers..................................: 
	fast(165,850 ops/sec) vs niche(268,305 ops/sec) vs standard(190,396 ops/sec)

short array of short escaped strings.....................: 
	fast(29,177 ops/sec) vs niche(37,533 ops/sec) vs standard(37,014 ops/sec)

short array of long escaped strings......................: 
	fast(28,311 ops/sec) vs niche(37,500 ops/sec) vs standard(36,025 ops/sec)

short array of long strings..............................: 
	fast(97,302 ops/sec) vs niche(129,034 ops/sec) vs standard(37,382 ops/sec)

short array of objects with properties of different types: 
	fast(14,125 ops/sec) vs niche(26,878 ops/sec) vs standard(13,852 ops/sec)

object with number property..............................: 
	fast(21,125,633 ops/sec) vs niche(21,956,709 ops/sec) vs standard(8,794,506 ops/sec)

object with integer property.............................: 
	fast(21,442,215 ops/sec) vs niche(21,920,630 ops/sec) vs standard(8,925,010 ops/sec)

object with short string property........................: 
	fast(12,836,028 ops/sec) vs niche(15,793,224 ops/sec) vs standard(8,325,284 ops/sec)

object with long string property.........................: 
	fast(16,234 ops/sec) vs niche(16,046 ops/sec) vs standard(15,217 ops/sec)

object with properties of different types................: 
	fast(2,526,405 ops/sec) vs niche(3,670,994 ops/sec) vs standard(3,375,536 ops/sec)
