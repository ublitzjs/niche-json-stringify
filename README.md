# @ublitzjs/niche-json-stringify - fastest pre-optimised niche JSON.stringify alternative

A blazing-fast, preoptimising stringifier generator, designed to outpace `JSON.stringify` in Web on both frontend and backend, while being type-safe and still handling all character escaping.

Inspired by [fast-json-stringify](https://github.com/fastify/fast-json-stringify) and [compile-json-stringify](https://github.com/nwoltman/compile-json-stringify). As in `compile-json-stringify`, `niche-json-stringify` uses JSONSchema to define the input type, unlike `fast-json-stringify`. However, it handles only the most popular cases, that's why it is "niche".

![μBlitz.js](https://github.com/ublitzjs/core/blob/main/logo.png)
<br/>

Built for performance-critical applications, it minimizes creation overhead and leverages an optimized swap-and-pop strategy to achieve **$O(1)$ unsubscription times** for unique listeners.

## Features

- **No Dependencies:** Works in NodeJS, Bun and a Web browser
- **TypeScript-first** 
- **Prebuilt for ESM and CJS**
- **Thoroughly tested**

---

## Benchmarks
- [NodeJS](./nodejs_benchmark.md)
- [Bun](./bunjs_benchmark.md)

## Installation

```bash
bun add @ublitzjs/niche-json-stringify
```

## Quick Start

## Core Guide & Performance Optimization
