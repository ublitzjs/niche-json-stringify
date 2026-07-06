# @ublitzjs/niche-json-stringify - fastest pre-optimised niche JSON.stringify alternative

A blazing-fast, preoptimising stringifier generator, designed to outpace `JSON.stringify` in Web on both frontend and backend, while being type-safe and still handling all character escaping.

Inspired by [fast-json-stringify](https://github.com/fastify/fast-json-stringify) and [compile-json-stringify](https://github.com/nwoltman/compile-json-stringify). As in `compile-json-stringify`, `niche-json-stringify` uses JSONSchema to define the input type, unlike `fast-json-stringify`. However, it handles only the most popular cases, that's why it is "niche".

![μBlitz.js](https://github.com/ublitzjs/core/blob/main/logo.png)

## Features

- **No Dependencies:** Works in NodeJS, Bun and a Web browser
- **The fastest for small payloads:** "niche" approach helped achieve these results. See benchmarks
- **Comparable speed with JSON.stringify for large payloads:** in NodeJS for non-escaped strings and in Bun for both
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

## Quick start

Generate a specialized serializer from a JSON Schema (or a TypeBox schema). The generated function **does not validate** its input—it assumes the data already matches the schema.

```ts
import { Type, Static } from "@sinclair/typebox";
import { createStringify } from "@ublitzjs/niche-json-stringify";

const User = Type.Object({
  id: Type.Integer(),
  name: Type.String(),
  admin: Type.Optional(Type.Boolean({ default: false })),
  tags: Type.Array(Type.String(), { default: [] }),
});

type User = Static<typeof User>;

const stringify = createStringify(User);

const json = stringify({
  id: 1,
  name: "Alice",
});

console.log(json);
// {"id":1,"name":"Alice","admin":false,"tags":[]}
```

### Default values

Schemas may define a `default` value for any supported type. If the corresponding property is `undefined`, the generated serializer emits the default instead.

```ts
const Config = Type.Object({
  host: Type.String({ default: "localhost" }),
  port: Type.Integer({ default: 3000 }),
  tls: Type.Boolean({ default: false }),
  retries: Type.Integer({ default: 3 }),
});

const stringify = createStringify(Config);

stringify({});
// {"host":"localhost","port":3000,"tls":false,"retries":3}
```

### Unsafe strings

By default, all string values are JSON-escaped.

If you know a string is already safe (contains no characters requiring escaping), mark it with `format: "unsafe"` to skip escaping.

```ts
const LogEntry = Type.Object({
  timestamp: Type.String({ format: "unsafe" }),
  level: Type.String({ format: "unsafe" }),
  message: Type.String(), // escaped
});

const stringify = createStringify(LogEntry);
```

### Additional properties

`additionalProperties` is supported. Unknown properties are serialized using `JSON.stringify`.

```ts
const Payload = Type.Object(
  { id: Type.Integer() },
  { additionalProperties: true }
);

const stringify = createStringify(Payload);

stringify({
  id: 1,
  extra: { hello: "world" },
});
// {"id":1,"extra":{"hello":"world"}}
```

### Custom string escaping

By default, `createStringify()` uses the escaping implementation from [**fast-json-stringify**](https://github.com/fastify/fast-json-stringify).

You can supply another escaping function, for example the one from [**compile-json-stringify**](https://github.com/nwoltman/compile-json-stringify):

```ts
import {
  createStringify,
  CJSescape,
} from "@ublitzjs/niche-json-stringify";

const stringify = createStringify(User, CJSescape);
```

### Specialized array serializers

For hot paths, the package also exports highly optimized serializers for common array types.

```ts
import {
  int_arr,
  bool_arr,
  str_arr_node,
  str_arr_bun,
} from "@ublitzjs/niche-json-stringify";

int_arr([1, 2, 3]);
// "[1,2,3]"

bool_arr([true, false]);
// "[true,false]"

// optimised non-escaping serialisers
str_arr_node(["a", "b"]);
str_arr_bun(["a", "b"]);
```

> **Note:** Generated serializers prioritize speed over safety. They do **not** validate input, so invalid data may produce invalid JSON or incorrect output. Validate your data before serialization if necessary.

