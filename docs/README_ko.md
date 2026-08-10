# TidyID

[English](https://github.com/sheldonix/tidyid/blob/main/README.md) | [简体中文](https://github.com/sheldonix/tidyid/blob/main/docs/README_zh-CN.md) | [日本語](https://github.com/sheldonix/tidyid/blob/main/docs/README_ja.md) | 한국어 | [Русский](https://github.com/sheldonix/tidyid/blob/main/docs/README_ru.md)

[![npm version](https://img.shields.io/npm/v/tidyid.svg)](https://www.npmjs.com/package/tidyid)
[![Node.js](https://img.shields.io/node/v/tidyid.svg)](https://www.npmjs.com/package/tidyid)
[![TypeScript](https://img.shields.io/badge/TypeScript-types%20included-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/sheldonix/tidyid/blob/main/LICENSE)

JavaScript를 위한 작고 안전하며 사람이 사용하기 편한 ID 생성기입니다.

- **작고 가벼움** `tidyid()`는 최소화 및 Brotli 압축 기준 506바이트이며 런타임 의존성이 없습니다.
- **안전** 플랫폼 CSPRNG와 편향 없는 샘플링을 사용하며 약한 난수 생성기로 대체하지 않습니다. 스레드, 프로세스, 클러스터 노드에서 독립적으로 생성할 수 있으며, 절대적인 고유성이 필요하면 데이터베이스 제약 조건으로 보장해야 합니다.
- **사람 친화적** 기본적으로 문자로 시작하며, 소문자와 숫자로만 구성된 ID를 고정된 `LLD` 리듬으로 생성합니다. 우연히 긴 단어가 만들어지지 않고 문장 부호나 혼동하기 쉬운 문자도 없습니다. 읽기, 입력, 옮겨 적기가 쉬우며 URL, 파일 이름, 데이터베이스·캐시·객체 스토리지 키, DOM/CSS ID, 명령줄, 로그 등에 바로 사용할 수 있습니다.

```js
import { tidyid } from 'tidyid'

const id1 = tidyid(32)       // ag8dw2tx7qx6qw4ck2mf4cc3xb8gd9vc (length = 32)
const id2 = tidyid(16)       // mh4dx8tq3bd2rz7h (length = 16)
const id3 = tidyid(10)       // td7et3cv6w (length = 10)
const id4 = tidyid(10, true) // rN9gK6cM2w (length = 10, allowUppercase = true)
```

애플리케이션 코드에서는 기본 32자 길이를 사용할 때도 호출 위치에서 ID 길이가 명확하도록 원하는 길이를 명시적으로 전달하는 것을 강력히 권장합니다.

## 설치

```sh
npm i tidyid
```

**또는**

```sh
pnpm add tidyid
```

## CLI

TidyID를 전역으로 설치합니다.

```sh
npm i -g tidyid
```

그런 다음 ID를 생성합니다.

```sh
tidyid
# wq3cc5gt9gj8nc7kh4fq2mq3yf6gk2wx (length = 32)

tidyid -s 16
# bq7th2vj6xn4zk9b (length = 16)

tidyid -s 10 -u
# Av2Mr4Aw3Y (length = 10, allowUppercase = true)
```

`--size` 또는 `-s`로 길이를 지정합니다. 대문자를 허용하려면 `--allow-uppercase` 또는 `-u`를 사용합니다.

## 형식

기본적으로 ID는 소문자 두 개와 숫자 한 개(`LLD`)를 반복합니다.

```text
xr3 fc9 xy2
```

| 문자 | 위치 | 문자 집합 |
| --- | --- | --- |
| 영문자 | 각 그룹의 첫 두 자리 | `abcdefghjkmnpqrtuvwxyz` |
| 숫자 | 세 번째 자리마다 | `23456789` |

- 모든 ID는 영문자로 시작합니다.
- 시각적·필기상 혼동을 줄이기 위해 `i`, `l`, `o`, `s`, `0`, `1`을 제외합니다.
- 이 패턴은 긴 문자 나열을 방지하며 URL 경로, 파일 이름, HTML/CSS ID에서 이스케이프할 필요가 없습니다.
- 기본 모드에서는 Shift 키, `_`, `-` 또는 다른 문장 부호 없이 입력할 수 있습니다.

`allowUppercase`의 기본값은 `false`입니다. `true`로 설정하면 영문자 위치에서 모호한 문자를 제외한 대문자와 소문자의 조합을 균등하게 선택합니다.

## API

| API | 설명 |
| --- | --- |
| `tidyid(length = 32, allowUppercase = false)` | 3~256자 ID를 생성합니다. 기본값은 32자입니다. |
| `isValidId(value, length?, allowUppercase = false)` | 형식과 선택적으로 지정한 정확한 길이를 확인합니다. |
| `ensureValidId(value, length?, allowUppercase = false)` | `InvalidIdLengthError` 또는 `InvalidIdFormatError`를 던집니다. |
| `getIdCapacity(length = 32, allowUppercase = false)` | 정확한 ID 공간을 `bigint`로 반환합니다. |
| `getIdEntropy(length = 32, allowUppercase = false)` | 엔트로피를 비트 단위로 반환합니다. |

상수: `LETTERS`, `LETTERS_WITH_UPPERCASE`, `DIGITS`, `DEFAULT_LENGTH`, `MIN_LENGTH`, `MAX_LENGTH`.

오류: `InvalidIdLengthError`, `InvalidIdFormatError`.

## 보안

- **예측 불가능성** Node.js에서는 `node:crypto.randomFillSync`, 브라우저에서는 `crypto.getRandomValues`를 사용합니다. 두 API 모두 플랫폼의 암호학적으로 안전한 난수 생성기를 사용하며 `Math.random()`은 절대 사용하지 않습니다.
- **균일성** 영문자 위치는 거부 샘플링을 사용하고 숫자 위치는 8개 숫자에 정확히 균등하게 매핑합니다. 두 방식 모두 모듈로 편향을 방지하므로 길이와 모드가 같은 모든 유효한 ID가 동일한 확률을 가집니다.

  <img src="https://raw.githubusercontent.com/sheldonix/tidyid/main/docs/media/uniformity-default.svg" alt="TidyID 기본 모드에서 관측된 문자와 숫자 빈도는 기대되는 균일 확률에 가깝습니다" width="680">

  *기본 모드(`allowUppercase = false`): 10,000,000개의 3자리 ID에서 관측한 문자 빈도는 기대되는 균일 분포에 가깝습니다.*

  <img src="https://raw.githubusercontent.com/sheldonix/tidyid/main/docs/media/uniformity-allow-uppercase.svg" alt="TidyID 대문자 허용 모드에서 관측된 문자 빈도는 기대되는 균일 확률에 가깝습니다" width="680">

  *대문자 허용 모드(`allowUppercase = true`): 10,000,000개의 3자리 ID에서 관측한 문자와 숫자 빈도는 기대되는 균일 분포에 가깝습니다.*

- **안전한 실패** 난수 소스 오류는 호출자에게 그대로 전달됩니다. TidyID는 예측 가능한 난수 생성기로 대체하지 않습니다.
- **충돌 고려** 규모에 맞는 길이를 선택하면 충돌 확률을 극히 낮게 만들 수 있습니다. 절대적인 고유성이 필요하면 데이터베이스의 `PRIMARY KEY` 또는 `UNIQUE` 제약 조건을 사용하세요.

  > **기본 모드 (`allowUppercase = false`)**
  >
  > | 길이 | 용량 | 엔트로피 |
  > | ---: | ---: | ---: |
  > | 8 | 7,256,313,856 | 32.76 bits |
  > | 10 | 1,277,111,238,656 | 40.22 bits |
  > | 12 | 224,771,578,003,456 | 47.68 bits |
  > | 16 | 19,146,942,100,646,395,904 | 64.05 bits |
  > | 23 | 6,315,282,784,770,463,143,393,492,992 | 92.35 bits |
  > | 32 | 366,605,391,805,505,419,895,548,144,464,707,977,216 | 128.11 bits |

  > **대문자 허용 (`allowUppercase = true`)**
  >
  > | 길이 | 용량 | 엔트로피 |
  > | ---: | ---: | ---: |
  > | 8 | 464,404,086,784 | 38.76 bits |
  > | 10 | 163,470,238,547,968 | 47.22 bits |
  > | 12 | 57,541,523,968,884,736 | 55.68 bits |
  > | 16 | 39,212,937,422,123,818,811,392 | 75.05 bits |
  > | 23 | 413,878,372,582,717,072,565,435,956,723,712 | 108.35 bits |
  > | 32 | 1,537,654,461,271,398,604,689,577,164,520,902,527,668,977,664 | 150.11 bits |

  대규모 공개 데이터 세트에는 16자 이상을 사용하세요. 보안 토큰은 위협 모델에 따라 길이를 선택해야 합니다. 32자 TidyID는 기본적으로 128.11비트, `allowUppercase = true`에서는 150.11비트의 엔트로피를 제공합니다.

## 데이터베이스 고유성

기본 키 또는 고유 제약 조건을 사용하세요. 삽입 전에 조회하지 말고 먼저 삽입한 다음, ID 충돌이 발생한 경우에만 다시 시도하세요.

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

네트워크, 권한, 트랜잭션 및 ID와 관련 없는 제약 조건 오류는 호출자에게 그대로 전달하세요.

## 요구 사항

- Node.js `>=22.12`
- Web Crypto와 `TextDecoder`를 지원하는 최신 브라우저
- 조건부 내보내기를 지원하는 번들러는 브라우저 엔트리를 자동으로 선택합니다

## 라이선스

MIT
