# TidyID

[English](https://github.com/sheldonix/tidyid/blob/main/README.md) | [简体中文](https://github.com/sheldonix/tidyid/blob/main/docs/README_zh-CN.md) | 日本語 | [한국어](https://github.com/sheldonix/tidyid/blob/main/docs/README_ko.md) | [Русский](https://github.com/sheldonix/tidyid/blob/main/docs/README_ru.md)

[![npm version](https://img.shields.io/npm/v/tidyid.svg)](https://www.npmjs.com/package/tidyid)
[![Node.js](https://img.shields.io/node/v/tidyid.svg)](https://www.npmjs.com/package/tidyid)
[![TypeScript](https://img.shields.io/badge/TypeScript-types%20included-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/sheldonix/tidyid/blob/main/LICENSE)

JavaScript 向けの小さく、安全で、人にやさしい ID ジェネレーターです。

- **小型** `tidyid()` は 506 バイト（minify + Brotli 圧縮）。実行時依存はありません。
- **安全** プラットフォームの CSPRNG と偏りのないサンプリングを使用し、弱い乱数へのフォールバックは行いません。スレッド、プロセス、クラスターノードごとに独立して生成できます。絶対的な一意性が必要な場合は、データベース制約で保証してください。
- **人にやさしい** デフォルトでは、英字で始まり、小文字英数字だけで構成された ID を固定の `LLD` リズムで生成します。長い単語が偶然現れにくく、記号や紛らわしい文字もありません。読み取り、入力、転記がしやすく、URL、ファイル名、データベース・キャッシュ・オブジェクトストレージのキー、DOM/CSS ID、コマンドライン、ログなどにそのまま使えます。

```js
import { tidyid } from 'tidyid'

const id1 = tidyid(32)       // ag8dw2tx7qx6qw4ck2mf4cc3xb8gd9vc（length = 32）
const id2 = tidyid(16)       // mh4dx8tq3bd2rz7h（length = 16）
const id3 = tidyid(10)       // td7et3cv6w（length = 10）
const id4 = tidyid(10, true) // rN9gK6cM2w（length = 10、allowUppercase = true）
```

アプリケーションコードでは、デフォルトの 32 文字を使用する場合でも、呼び出し箇所で ID の長さが明確になるよう、必要な長さを明示的に渡すことを強く推奨します。

## インストール

```sh
npm i tidyid
```

**または**

```sh
pnpm add tidyid
```

## CLI

TidyID をグローバルインストールします。

```sh
npm i -g tidyid
```

次に、ID を生成します。

```sh
tidyid
# wq3cc5gt9gj8nc7kh4fq2mq3yf6gk2wx（length = 32）

tidyid -s 16
# bq7th2vj6xn4zk9b（length = 16）

tidyid -s 10 -u
# Av2Mr4Aw3Y（length = 10、allowUppercase = true）
```

長さは `--size` または `-s` で指定します。大文字を許可するには `--allow-uppercase` または `-u` を使用します。

## フォーマット

デフォルトでは、ID は小文字 2 文字と数字 1 文字（`LLD`）を繰り返します。

```text
xr3 fc9 xy2
```

| 文字 | 位置 | アルファベット |
| --- | --- | --- |
| 英字 | 各グループの先頭 2 文字 | `abcdefghjkmnpqrtuvwxyz` |
| 数字 | 各グループの 3 文字目 | `23456789` |

- すべての ID は英字で始まります。
- 見た目や手書きでの混同を減らすため、`i`、`l`、`o`、`s`、`0`、`1` を除外しています。
- このパターンにより長い英字列を防ぎ、URL パス、ファイル名、HTML/CSS ID でエスケープする必要がありません。
- デフォルトモードでは、Shift キー、`_`、`-`、その他の記号を使わずに入力できます。

`allowUppercase` のデフォルト値は `false` です。`true` に設定すると、英字の位置は曖昧な文字を除いた大文字と小文字の組み合わせから均等に選ばれます。

## API

| API | 説明 |
| --- | --- |
| `tidyid(length = 32, allowUppercase = false)` | 3〜256 文字の ID を生成します。デフォルトは 32 文字です。 |
| `isValidId(value, length?, allowUppercase = false)` | フォーマットと、任意で指定した正確な長さを検証します。 |
| `ensureValidId(value, length?, allowUppercase = false)` | `InvalidIdLengthError` または `InvalidIdFormatError` をスローします。 |
| `getIdCapacity(length = 32, allowUppercase = false)` | 正確な ID 空間を `bigint` で返します。 |
| `getIdEntropy(length = 32, allowUppercase = false)` | エントロピーをビット単位で返します。 |

定数：`LETTERS`、`LETTERS_WITH_UPPERCASE`、`DIGITS`、`DEFAULT_LENGTH`、`MIN_LENGTH`、`MAX_LENGTH`。

エラー：`InvalidIdLengthError`、`InvalidIdFormatError`。

## セキュリティ

- **予測困難性** Node.js では `node:crypto.randomFillSync`、ブラウザーでは `crypto.getRandomValues` を使用します。どちらもプラットフォームの暗号学的に安全な乱数生成器を使用し、`Math.random()` は一切使用しません。
- **均一性** 英字位置では棄却サンプリングを使用し、数字位置では8通りへの厳密なマッピングを使用します。どちらも剰余バイアスを回避するため、同じ長さ・同じモードの有効な ID はすべて同じ確率で生成されます。

  <img src="https://raw.githubusercontent.com/sheldonix/tidyid/main/docs/media/uniformity-default.svg" alt="TidyID のデフォルトモードで観測された英字と数字の頻度は、期待される一様確率に近い値です" width="680">

  *デフォルトモード（`allowUppercase = false`）：10,000,000 個の 3 文字 ID から観測した文字頻度は、期待される一様分布に近い値です。*

  <img src="https://raw.githubusercontent.com/sheldonix/tidyid/main/docs/media/uniformity-allow-uppercase.svg" alt="TidyID の大文字許可モードで観測された文字頻度は、期待される一様確率に近い値です" width="680">

  *大文字許可モード（`allowUppercase = true`）：10,000,000 個の 3 文字 ID から観測した英字と数字の頻度は、期待される一様分布に近い値です。*

- **安全側に失敗** 乱数源のエラーはそのまま伝播します。TidyID が予測可能な乱数へフォールバックすることはありません。
- **衝突を考慮** 規模に合った長さを選べば、衝突確率を極めて低くできます。絶対的な一意性が必要な場合は、データベースの `PRIMARY KEY` または `UNIQUE` 制約を使用してください。

  > **デフォルトモード（`allowUppercase = false`）**
  >
  > | 長さ | 容量 | エントロピー |
  > | ---: | ---: | ---: |
  > | 8 | 7,256,313,856 | 32.76 bits |
  > | 10 | 1,277,111,238,656 | 40.22 bits |
  > | 12 | 224,771,578,003,456 | 47.68 bits |
  > | 16 | 19,146,942,100,646,395,904 | 64.05 bits |
  > | 23 | 6,315,282,784,770,463,143,393,492,992 | 92.35 bits |
  > | 32 | 366,605,391,805,505,419,895,548,144,464,707,977,216 | 128.11 bits |

  > **大文字を許可（`allowUppercase = true`）**
  >
  > | 長さ | 容量 | エントロピー |
  > | ---: | ---: | ---: |
  > | 8 | 464,404,086,784 | 38.76 bits |
  > | 10 | 163,470,238,547,968 | 47.22 bits |
  > | 12 | 57,541,523,968,884,736 | 55.68 bits |
  > | 16 | 39,212,937,422,123,818,811,392 | 75.05 bits |
  > | 23 | 413,878,372,582,717,072,565,435,956,723,712 | 108.35 bits |
  > | 32 | 1,537,654,461,271,398,604,689,577,164,520,902,527,668,977,664 | 150.11 bits |

  大規模な公開データセットには 16 文字以上を推奨します。セキュリティトークンの長さは脅威モデルに基づいて選択してください。32 文字の TidyID はデフォルトで 128.11 ビット、`allowUppercase = true` では 150.11 ビットのエントロピーを持ちます。

## データベースでの一意性

主キーまたは一意制約を使用してください。挿入前に検索するのではなく、まず挿入し、ID が衝突した場合だけ再試行します。

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

ネットワーク、権限、トランザクション、および ID 以外の制約エラーは、そのまま伝播させてください。

## 動作要件

- Node.js `>=22.12`
- Web Crypto と `TextDecoder` を備えたモダンブラウザー
- 条件付きエクスポートに対応するバンドラーはブラウザー用エントリーを自動選択します

## ライセンス

MIT
