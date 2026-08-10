import {
  DIGITS,
  LETTERS,
  LETTERS_WITH_UPPERCASE,
} from './alphabets.js';

export function fillStructuredId(
  output: Uint8Array,
  outputOffset: number,
  random: Uint8Array,
  allowUppercase = false,
): number {
  const letters = allowUppercase ? LETTERS_WITH_UPPERCASE : LETTERS;
  const letterLimit = 256 - (256 % letters.length);

  for (
    let randomOffset = 0;
    randomOffset < random.length && outputOffset < output.length;
    randomOffset += 1
  ) {
    const isDigit = (outputOffset + 1) % 3 === 0;
    const byte = random[randomOffset]!;
    if (!isDigit && byte >= letterLimit) continue;

    output[outputOffset] = isDigit
      ? DIGITS.charCodeAt(byte & 7)
      : letters.charCodeAt(byte % letters.length);
    outputOffset += 1;
  }
  return outputOffset;
}
