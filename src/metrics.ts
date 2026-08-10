import {
  DEFAULT_LENGTH,
  DIGITS,
  LETTERS,
  LETTERS_WITH_UPPERCASE,
} from './alphabets.js';
import { assertValidLength } from './length.js';

export function getIdCapacity(
  length: number = DEFAULT_LENGTH,
  allowUppercase = false,
): bigint {
  assertValidLength(length);
  const digitCount = Math.floor(length / 3);
  const letters = allowUppercase ? LETTERS_WITH_UPPERCASE : LETTERS;
  return BigInt(letters.length) ** BigInt(length - digitCount)
    * BigInt(DIGITS.length) ** BigInt(digitCount);
}

export function getIdEntropy(
  length: number = DEFAULT_LENGTH,
  allowUppercase = false,
): number {
  assertValidLength(length);
  const digitCount = Math.floor(length / 3);
  const letterCount = length - digitCount;
  const letters = allowUppercase ? LETTERS_WITH_UPPERCASE : LETTERS;
  return letterCount * Math.log2(letters.length)
    + digitCount * Math.log2(DIGITS.length);
}
