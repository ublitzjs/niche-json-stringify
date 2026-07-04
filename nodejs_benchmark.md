1. bun x tsx tests/benchmark.ts
```
Bench 189 KB payload with safe strings
┌─────────┬───────────────────────────┬────────────────────┐
│ (index) │ name                      │ throuput           │
├─────────┼───────────────────────────┼────────────────────┤
│ 0       │ 'fast-json-stringify'     │ 2269.3590564661718 │
│ 1       │ 'compiled-json-stringify' │ 2280.0609560836597 │
│ 2       │ 'niche-json-stringify'    │ 2626.764571184026  │
│ 3       │ 'JSON.stringify'          │ 3066.664420855007  │
└─────────┴───────────────────────────┴────────────────────┘
Bench 189 KB payload with unsafe strings
┌─────────┬────────────────────────┬────────────────────┐
│ (index) │ name                   │ throuput           │
├─────────┼────────────────────────┼────────────────────┤
│ 0       │ 'fast-json-stringify'  │ 3365.9561674628885 │
│ 1       │ 'niche-json-stringify' │ 5290.381487286346  │
└─────────┴────────────────────────┴────────────────────┘
```

2. bun x tsx tests/fast-json-stringify-benchmark.ts
```
short array of numbers...................................: 
	fast(77,788 ops/sec) vs niche(85,655 ops/sec) vs standard(108,168 ops/sec)

short array of integers..................................: 
	fast(69,777 ops/sec) vs niche(89,462 ops/sec) vs standard(108,272 ops/sec)

short array of short escaped strings.....................: 
	fast(22,494 ops/sec) vs niche(91,209 ops/sec) vs standard(90,121 ops/sec)

short array of long escaped strings......................: 
	fast(22,558 ops/sec) vs niche(91,267 ops/sec) vs standard(90,222 ops/sec)

short array of long strings..............................: 
	fast(52,601 ops/sec) vs niche(90,096 ops/sec) vs standard(89,829 ops/sec)

short array of objects with properties of different types: 
	fast(13,012 ops/sec) vs niche(13,671 ops/sec) vs standard(14,643 ops/sec)

object with number property..............................: 
	fast(19,682,899 ops/sec) vs niche(20,329,015 ops/sec) vs standard(9,245,971 ops/sec)

object with integer property.............................: 
	fast(19,729,440 ops/sec) vs niche(20,300,122 ops/sec) vs standard(9,293,621 ops/sec)

object with short string property........................: 
	fast(12,581,694 ops/sec) vs niche(13,353,786 ops/sec) vs standard(8,552,329 ops/sec)

object with long string property.........................: 
	fast(197,758 ops/sec) vs niche(170,370 ops/sec) vs standard(156,769 ops/sec)

object with properties of different types................: 
	fast(2,195,924 ops/sec) vs niche(2,894,493 ops/sec) vs standard(3,383,153 ops/sec)
```
