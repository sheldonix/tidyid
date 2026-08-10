# TidyID

[English](https://github.com/sheldonix/tidyid/blob/main/README.md) | [简体中文](https://github.com/sheldonix/tidyid/blob/main/docs/README_zh-CN.md) | [日本語](https://github.com/sheldonix/tidyid/blob/main/docs/README_ja.md) | [한국어](https://github.com/sheldonix/tidyid/blob/main/docs/README_ko.md) | Русский

[![npm version](https://img.shields.io/npm/v/tidyid.svg)](https://www.npmjs.com/package/tidyid)
[![Node.js](https://img.shields.io/node/v/tidyid.svg)](https://www.npmjs.com/package/tidyid)
[![TypeScript](https://img.shields.io/badge/TypeScript-types%20included-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/sheldonix/tidyid/blob/main/LICENSE)

Компактный, безопасный и удобный для человека генератор ID для JavaScript.

- **Компактный** `tidyid()` занимает 506 байт после минификации и сжатия Brotli. Нет зависимостей времени выполнения.
- **Безопасный** Использует платформенный CSPRNG и несмещённую выборку без небезопасного запасного генератора. ID можно независимо генерировать в разных потоках, процессах и узлах кластера; абсолютную уникальность следует обеспечивать ограничением базы данных.
- **Удобный для человека** По умолчанию создаёт ID из строчных букв и цифр, начинающиеся с буквы и имеющие фиксированный ритм `LLD`. Никаких случайных длинных слов, знаков пунктуации или неоднозначных символов. ID легко читать, вводить и переписывать; они подходят для URL, имён файлов, ключей баз данных, кэшей и объектных хранилищ, DOM/CSS ID, командной строки, журналов и других задач.

```js
import { tidyid } from 'tidyid'

const id1 = tidyid(32)       // ag8dw2tx7qx6qw4ck2mf4cc3xb8gd9vc (length = 32)
const id2 = tidyid(16)       // mh4dx8tq3bd2rz7h (length = 16)
const id3 = tidyid(10)       // td7et3cv6w (length = 10)
const id4 = tidyid(10, true) // rN9gK6cM2w (length = 10, allowUppercase = true)
```

В коде приложения настоятельно рекомендуется всегда явно передавать требуемую длину, даже при использовании значения по умолчанию 32, чтобы размер ID был виден непосредственно в месте вызова.

## Установка

```sh
npm i tidyid
```

**или**

```sh
pnpm add tidyid
```

## CLI

Установите TidyID глобально:

```sh
npm i -g tidyid
```

Затем создайте ID:

```sh
tidyid
# wq3cc5gt9gj8nc7kh4fq2mq3yf6gk2wx (length = 32)

tidyid -s 16
# bq7th2vj6xn4zk9b (length = 16)

tidyid -s 10 -u
# Av2Mr4Aw3Y (length = 10, allowUppercase = true)
```

Задайте длину с помощью `--size` или `-s`. Разрешите прописные буквы с помощью `--allow-uppercase` или `-u`.

## Формат

По умолчанию в ID повторяются две строчные буквы и одна цифра (`LLD`):

```text
xr3 fc9 xy2
```

| Символы | Позиции | Алфавит |
| --- | --- | --- |
| Буквы | Первые две позиции каждой группы | `abcdefghjkmnpqrtuvwxyz` |
| Цифры | Каждая третья позиция | `23456789` |

- Каждый ID начинается с буквы.
- Символы `i`, `l`, `o`, `s`, `0` и `1` исключены, чтобы уменьшить визуальную неоднозначность и ошибки при рукописном вводе.
- Формат предотвращает длинные последовательности букв и не требует экранирования в путях URL, именах файлов и HTML/CSS ID.
- В режиме по умолчанию при вводе не нужны Shift, `_`, `-` и другие знаки пунктуации.

По умолчанию `allowUppercase` имеет значение `false`. При значении `true` символы в буквенных позициях равномерно выбираются из объединённого алфавита прописных и строчных букв без неоднозначных символов.

## API

| API | Описание |
| --- | --- |
| `tidyid(length = 32, allowUppercase = false)` | Создать ID длиной от 3 до 256 символов; по умолчанию 32. |
| `isValidId(value, length?, allowUppercase = false)` | Проверить формат и, при необходимости, точную длину. |
| `ensureValidId(value, length?, allowUppercase = false)` | Выбросить `InvalidIdLengthError` или `InvalidIdFormatError`. |
| `getIdCapacity(length = 32, allowUppercase = false)` | Вернуть точный размер пространства ID как `bigint`. |
| `getIdEntropy(length = 32, allowUppercase = false)` | Вернуть энтропию в битах. |

Константы: `LETTERS`, `LETTERS_WITH_UPPERCASE`, `DIGITS`, `DEFAULT_LENGTH`, `MIN_LENGTH`, `MAX_LENGTH`.

Ошибки: `InvalidIdLengthError`, `InvalidIdFormatError`.

## Безопасность

- **Непредсказуемость** В Node.js используется `node:crypto.randomFillSync`, а в браузерах — `crypto.getRandomValues`. Оба API используют платформенный криптографически стойкий генератор случайных чисел; `Math.random()` не используется никогда.
- **Равномерность** Для буквенных позиций используется выборка с отбрасыванием, а для цифровых — точное отображение на восемь вариантов. Оба подхода исключают смещение при взятии остатка, поэтому все допустимые ID одинаковой длины и режима имеют одинаковую вероятность.

  <img src="https://raw.githubusercontent.com/sheldonix/tidyid/main/docs/media/uniformity-default.svg" alt="Наблюдаемые частоты букв и цифр TidyID в режиме по умолчанию близки к ожидаемому равномерному распределению" width="680">

  *Режим по умолчанию (`allowUppercase = false`): частоты символов в 10 000 000 сгенерированных трёхсимвольных ID близки к ожидаемому равномерному распределению.*

  <img src="https://raw.githubusercontent.com/sheldonix/tidyid/main/docs/media/uniformity-allow-uppercase.svg" alt="Наблюдаемые частоты символов TidyID в режиме с прописными буквами близки к ожидаемому равномерному распределению" width="680">

  *Режим с прописными буквами (`allowUppercase = true`): частоты букв и цифр в 10 000 000 трёхсимвольных ID близки к ожидаемому равномерному распределению.*

- **Безопасный отказ** Ошибки источника случайности передаются вызывающему коду. TidyID никогда не переключается на предсказуемый генератор.
- **Контроль коллизий** Выберите длину, соответствующую масштабу данных, чтобы сделать вероятность коллизии крайне малой. Если нужна абсолютная уникальность, используйте ограничение `PRIMARY KEY` или `UNIQUE` в базе данных.

  > **Режим по умолчанию (`allowUppercase = false`)**
  >
  > | Длина | Ёмкость | Энтропия |
  > | ---: | ---: | ---: |
  > | 8 | 7,256,313,856 | 32.76 bits |
  > | 10 | 1,277,111,238,656 | 40.22 bits |
  > | 12 | 224,771,578,003,456 | 47.68 bits |
  > | 16 | 19,146,942,100,646,395,904 | 64.05 bits |
  > | 23 | 6,315,282,784,770,463,143,393,492,992 | 92.35 bits |
  > | 32 | 366,605,391,805,505,419,895,548,144,464,707,977,216 | 128.11 bits |

  > **Прописные буквы разрешены (`allowUppercase = true`)**
  >
  > | Длина | Ёмкость | Энтропия |
  > | ---: | ---: | ---: |
  > | 8 | 464,404,086,784 | 38.76 bits |
  > | 10 | 163,470,238,547,968 | 47.22 bits |
  > | 12 | 57,541,523,968,884,736 | 55.68 bits |
  > | 16 | 39,212,937,422,123,818,811,392 | 75.05 bits |
  > | 23 | 413,878,372,582,717,072,565,435,956,723,712 | 108.35 bits |
  > | 32 | 1,537,654,461,271,398,604,689,577,164,520,902,527,668,977,664 | 150.11 bits |

  Для больших общедоступных наборов данных используйте не менее 16 символов. Для токенов безопасности выбирайте длину на основе модели угроз. TidyID длиной 32 символа обеспечивает 128.11 бита энтропии по умолчанию и 150.11 бита при `allowUppercase = true`.

## Уникальность в базе данных

Используйте первичный ключ или ограничение уникальности. Сначала выполняйте вставку и повторяйте попытку только при конфликте ID — не делайте запрос перед вставкой:

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

Ошибки сети, разрешений, транзакций и ограничений, не связанных с ID, должны передаваться вызывающему коду.

## Требования

- Node.js `>=22.12`
- Современные браузеры с Web Crypto и `TextDecoder`
- Сборщики с поддержкой условных экспортов автоматически выбирают браузерную точку входа

## Лицензия

MIT
