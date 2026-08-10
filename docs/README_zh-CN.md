# TidyID

[English](https://github.com/sheldonix/tidyid/blob/main/README.md) | 简体中文 | [日本語](https://github.com/sheldonix/tidyid/blob/main/docs/README_ja.md) | [한국어](https://github.com/sheldonix/tidyid/blob/main/docs/README_ko.md) | [Русский](https://github.com/sheldonix/tidyid/blob/main/docs/README_ru.md)

[![npm version](https://img.shields.io/npm/v/tidyid.svg)](https://www.npmjs.com/package/tidyid)
[![Node.js](https://img.shields.io/node/v/tidyid.svg)](https://www.npmjs.com/package/tidyid)
[![TypeScript](https://img.shields.io/badge/TypeScript-types%20included-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/sheldonix/tidyid/blob/main/LICENSE)

面向 JavaScript 的小巧、安全且人性化的 ID 生成器。

- **小巧** `tidyid()` 仅 506 字节（压缩并经 Brotli 处理），零运行时依赖。
- **安全** 使用平台 CSPRNG 和无偏采样，不提供弱随机回退。可在多个线程、进程和集群节点上独立生成；需要绝对唯一时，请使用数据库唯一约束。
- **人性化** 默认生成字母开头、仅含小写字母和数字的 ID，并采用固定 `LLD` 节奏——不会意外形成长单词，不含标点和易混淆字符。易于阅读、输入和转录，可直接用于 URL、文件名、数据库/缓存/对象存储键、DOM/CSS ID、命令行和日志等场景。

```js
import { tidyid } from 'tidyid'

const id1 = tidyid(32)       // ag8dw2tx7qx6qw4ck2mf4cc3xb8gd9vc（length = 32）
const id2 = tidyid(16)       // mh4dx8tq3bd2rz7h（length = 16）
const id3 = tidyid(10)       // td7et3cv6w（length = 10）
const id4 = tidyid(10, true) // rN9gK6cM2w（length = 10，allowUppercase = true）
```

强烈建议在应用代码中始终明确传入所需长度，即使使用默认的 32 位长度，也能让调用处清楚体现 ID 的尺寸。

## 安装

```sh
npm i tidyid
```

**或**

```sh
pnpm add tidyid
```

## 命令行

全局安装 TidyID：

```sh
npm i -g tidyid
```

然后生成 ID：

```sh
tidyid
# wq3cc5gt9gj8nc7kh4fq2mq3yf6gk2wx（length = 32）

tidyid -s 16
# bq7th2vj6xn4zk9b（length = 16）

tidyid -s 10 -u
# Av2Mr4Aw3Y（length = 10，allowUppercase = true）
```

使用 `--size` 或 `-s` 设置长度；使用 `--allow-uppercase` 或 `-u` 允许生成大写字母。

## 格式

默认情况下，ID 按“两个小写字母后跟一个数字”（`LLD`）循环：

```text
xr3 fc9 xy2
```

| 字符 | 位置 | 字符表 |
| --- | --- | --- |
| 字母 | 每组前两位 | `abcdefghjkmnpqrtuvwxyz` |
| 数字 | 每组第三位 | `23456789` |

- 每个 ID 都以字母开头。
- 排除 `i`、`l`、`o`、`s`、`0` 和 `1`，减少视觉和手写混淆。
- 固定结构避免出现长字母序列，在 URL 路径、文件名和 HTML/CSS ID 中无需转义。
- 默认模式输入时无需 Shift 键，也不含 `_`、`-` 或其他标点。

`allowUppercase` 默认为 `false`。设为 `true` 后，字母位会从去歧义的大小写字母组合中均匀抽取。

## API

| API | 说明 |
| --- | --- |
| `tidyid(length = 32, allowUppercase = false)` | 生成 3–256 字符的 ID；默认长度为 32。 |
| `isValidId(value, length?, allowUppercase = false)` | 检查格式和可选的精确长度。 |
| `ensureValidId(value, length?, allowUppercase = false)` | 抛出 `InvalidIdLengthError` 或 `InvalidIdFormatError`。 |
| `getIdCapacity(length = 32, allowUppercase = false)` | 以 `bigint` 返回精确的 ID 空间大小。 |
| `getIdEntropy(length = 32, allowUppercase = false)` | 返回以 bit 为单位的熵。 |

常量：`LETTERS`、`LETTERS_WITH_UPPERCASE`、`DIGITS`、`DEFAULT_LENGTH`、`MIN_LENGTH`、`MAX_LENGTH`。

错误：`InvalidIdLengthError`、`InvalidIdFormatError`。

## 安全性

- **不可预测** Node.js 使用 `node:crypto.randomFillSync`，浏览器使用 `crypto.getRandomValues`。两者都使用平台密码学安全随机数生成器，绝不使用 `Math.random()`。
- **均匀性** 字母位使用拒绝采样，数字位则将随机字节精确映射到八个数字。两种方式都不会产生取模偏差，因此相同长度且相同模式的每个有效 ID 都具有相同概率。

  <img src="https://raw.githubusercontent.com/sheldonix/tidyid/main/docs/media/uniformity-default.svg" alt="TidyID 默认模式实测字母和数字频率接近预期的均匀概率" width="680">

  *默认模式（`allowUppercase = false`）：从 10,000,000 个 3 字符 ID 统计的字符频率接近预期均匀分布。*

  <img src="https://raw.githubusercontent.com/sheldonix/tidyid/main/docs/media/uniformity-allow-uppercase.svg" alt="TidyID 允许大写模式实测字符频率接近预期的均匀概率" width="680">

  *允许大写模式（`allowUppercase = true`）：从 10,000,000 个 3 字符 ID 统计的字母和数字频率接近预期均匀分布。*

- **失败即关闭** 随机源错误会直接向上传播；TidyID 永远不会回退到可预测随机源。
- **碰撞可控** 根据数据规模选择长度，可使碰撞概率极低。必须保证绝对唯一时，请使用数据库 `PRIMARY KEY` 或 `UNIQUE` 约束。

  > **默认模式（`allowUppercase = false`）**
  >
  > | 长度 | 容量 | 熵 |
  > | ---: | ---: | ---: |
  > | 8 | 7,256,313,856 | 32.76 bits |
  > | 10 | 1,277,111,238,656 | 40.22 bits |
  > | 12 | 224,771,578,003,456 | 47.68 bits |
  > | 16 | 19,146,942,100,646,395,904 | 64.05 bits |
  > | 23 | 6,315,282,784,770,463,143,393,492,992 | 92.35 bits |
  > | 32 | 366,605,391,805,505,419,895,548,144,464,707,977,216 | 128.11 bits |

  > **允许大写（`allowUppercase = true`）**
  >
  > | 长度 | 容量 | 熵 |
  > | ---: | ---: | ---: |
  > | 8 | 464,404,086,784 | 38.76 bits |
  > | 10 | 163,470,238,547,968 | 47.22 bits |
  > | 12 | 57,541,523,968,884,736 | 55.68 bits |
  > | 16 | 39,212,937,422,123,818,811,392 | 75.05 bits |
  > | 23 | 413,878,372,582,717,072,565,435,956,723,712 | 108.35 bits |
  > | 32 | 1,537,654,461,271,398,604,689,577,164,520,902,527,668,977,664 | 150.11 bits |

  大型公开数据集建议使用 16 个或更多字符。安全令牌应根据威胁模型选择长度。32 字符 TidyID 默认提供 128.11 bits 熵，设置 `allowUppercase = true` 时提供 150.11 bits。

## 数据库唯一性

使用主键或唯一约束。先插入，并且只在 ID 冲突时重试——不要在插入前查询：

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

网络、权限、事务和非 ID 约束错误应直接向上传播。

## 环境要求

- Node.js `>=22.12`
- 支持 Web Crypto 和 `TextDecoder` 的现代浏览器
- 支持条件导出的打包器会自动选择浏览器入口

## 许可证

MIT
