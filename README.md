# TidyID

English | [简体中文](https://github.com/sheldonix/tidyid/blob/main/docs/README_zh-CN.md) | [日本語](https://github.com/sheldonix/tidyid/blob/main/docs/README_ja.md) | [한국어](https://github.com/sheldonix/tidyid/blob/main/docs/README_ko.md) | [Русский](https://github.com/sheldonix/tidyid/blob/main/docs/README_ru.md)

[![npm version](https://img.shields.io/npm/v/tidyid.svg)](https://www.npmjs.com/package/tidyid)
[![Node.js](https://img.shields.io/node/v/tidyid.svg)](https://www.npmjs.com/package/tidyid)
[![TypeScript](https://img.shields.io/badge/TypeScript-types%20included-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/sheldonix/tidyid/blob/main/LICENSE)

A tiny, secure, and human-friendly ID generator for JavaScript.

- **Tiny** 506 bytes for `tidyid()` (minified and Brotli-compressed). Zero runtime dependencies.
- **Secure** Uses the platform CSPRNG with unbiased sampling and no weak fallback. Generate independently across threads, processes, and cluster nodes; enforce absolute uniqueness with a database constraint.
- **Human-friendly** Creates letter-first, lowercase-alphanumeric IDs by default with a fixed `LLD` rhythm—no accidental long words, punctuation, or ambiguous characters. Easy to read, type, and transcribe; ready for URLs, filenames, database/cache/object-storage keys, DOM/CSS IDs, command lines, logs, and more.

```js
import { tidyid } from 'tidyid'

const id1 = tidyid(32)       // ag8dw2tx7qx6qw4ck2mf4cc3xb8gd9vc (length = 32)
const id2 = tidyid(16)       // mh4dx8tq3bd2rz7h (length = 16)
const id3 = tidyid(10)       // td7et3cv6w (length = 10)
const id4 = tidyid(10, true) // rN9gK6cM2w (length = 10, allowUppercase = true)
```

Explicitly passing the length in application code is strongly recommended, even when using the default of 32.

## Install

```sh
npm i tidyid
```

**or**

```sh
pnpm add tidyid
```

## CLI

Install TidyID globally:

```sh
npm i -g tidyid
```

Then generate an ID:

```sh
tidyid
# wq3cc5gt9gj8nc7kh4fq2mq3yf6gk2wx (length = 32)

tidyid -s 16
# bq7th2vj6xn4zk9b (length = 16)

tidyid -s 10 -u
# Av2Mr4Aw3Y (length = 10, allowUppercase = true)
```

Use `--size` or `-s` to set the length. Use `--allow-uppercase` or `-u`
to allow uppercase letters.

## Format

By default, IDs repeat two lowercase letters followed by one digit (`LLD`):

```text
xr3 fc9 xy2
```

| Characters | Positions | Alphabet |
| --- | --- | --- |
| Letters | First two of each group | `abcdefghjkmnpqrtuvwxyz` |
| Digits | Every third character | `23456789` |

- Every ID starts with a letter.
- `i`, `l`, `o`, `s`, `0`, and `1` are excluded to reduce visual and handwritten ambiguity.
- The pattern prevents long letter sequences and needs no escaping in URL paths, filenames, or HTML/CSS IDs.
- In default mode, typing needs no Shift key, `_`, `-`, or other punctuation.

`allowUppercase` defaults to `false`. Set it to `true` to sample letter
positions from the combined uppercase and lowercase alphabet.

## API

| API | Description |
| --- | --- |
| `tidyid(length = 32, allowUppercase = false)` | Generate a 3–256 character ID; defaults to 32. |
| `isValidId(value, length?, allowUppercase = false)` | Check format and optional exact length. |
| `ensureValidId(value, length?, allowUppercase = false)` | Throw `InvalidIdLengthError` or `InvalidIdFormatError`. |
| `getIdCapacity(length = 32, allowUppercase = false)` | Return the exact ID space as `bigint`. |
| `getIdEntropy(length = 32, allowUppercase = false)` | Return entropy in bits. |

Constants: `LETTERS`, `LETTERS_WITH_UPPERCASE`, `DIGITS`, `DEFAULT_LENGTH`, `MIN_LENGTH`, `MAX_LENGTH`.

Errors: `InvalidIdLengthError`, `InvalidIdFormatError`.

## Security

- **Unpredictability** Node.js uses `node:crypto.randomFillSync`; browsers use `crypto.getRandomValues`. Both use the platform cryptographically secure random number generator, never `Math.random()`.
- **Uniformity** Letter positions use rejection sampling, while digit positions use an exact eight-way mapping. Both avoid modulo bias, so every valid ID of the same length and mode has equal probability.

  <img src="https://raw.githubusercontent.com/sheldonix/tidyid/main/docs/media/uniformity-default.svg" alt="Observed TidyID default-mode letter and digit frequencies remain close to their expected uniform probabilities" width="680">

  *Default mode (`allowUppercase = false`): observed frequencies from 10,000,000 generated 3-character IDs stay close to the expected uniform distribution.*

  <img src="https://raw.githubusercontent.com/sheldonix/tidyid/main/docs/media/uniformity-allow-uppercase.svg" alt="Observed TidyID uppercase-enabled character frequencies remain close to their expected uniform probabilities" width="680">

  *Uppercase-enabled mode (`allowUppercase = true`): observed letter and digit frequencies from 10,000,000 generated 3-character IDs stay close to the expected uniform distribution.*

- **Fail closed** Random-source failures are propagated. TidyID never falls back to predictable randomness.
- **Collision-aware** Choose a length for your scale to make collisions extremely unlikely. Use a database `PRIMARY KEY` or `UNIQUE` constraint when absolute uniqueness must be enforced.

  > **Default mode (`allowUppercase = false`)**
  >
  > | Length | Capacity | Entropy |
  > | ---: | ---: | ---: |
  > | 8 | 7,256,313,856 | 32.76 bits |
  > | 10 | 1,277,111,238,656 | 40.22 bits |
  > | 12 | 224,771,578,003,456 | 47.68 bits |
  > | 16 | 19,146,942,100,646,395,904 | 64.05 bits |
  > | 23 | 6,315,282,784,770,463,143,393,492,992 | 92.35 bits |
  > | 32 | 366,605,391,805,505,419,895,548,144,464,707,977,216 | 128.11 bits |

  > **Uppercase allowed (`allowUppercase = true`)**
  >
  > | Length | Capacity | Entropy |
  > | ---: | ---: | ---: |
  > | 8 | 464,404,086,784 | 38.76 bits |
  > | 10 | 163,470,238,547,968 | 47.22 bits |
  > | 12 | 57,541,523,968,884,736 | 55.68 bits |
  > | 16 | 39,212,937,422,123,818,811,392 | 75.05 bits |
  > | 23 | 413,878,372,582,717,072,565,435,956,723,712 | 108.35 bits |
  > | 32 | 1,537,654,461,271,398,604,689,577,164,520,902,527,668,977,664 | 150.11 bits |

  Use 16 or more characters for large public datasets. For security tokens, choose the length based on your threat model. A 32-character TidyID provides 128.11 bits of entropy by default, or 150.11 bits with `allowUppercase = true`.

## Database uniqueness

Use a primary key or unique constraint. Insert first and retry only an ID conflict—never query before inserting:

```js
for (let attempt = 0; attempt < 128; attempt += 1) {
  const id = tidyid(16)
  const { rowCount } = await db.query(
    `INSERT INTO resources (id) VALUES ($1)
     ON CONFLICT (id) DO NOTHING RETURNING id`,
    [id],
  )
  if (rowCount === 1) return id
}
throw new Error('unable to insert a resource with a unique TidyID')
```

Propagate network, permission, transaction, and non-ID constraint errors.

## Requirements

- Node.js `>=22.12`
- Modern browsers with Web Crypto and `TextDecoder`
- Condition-aware bundlers select the browser entry automatically

## License

MIT
