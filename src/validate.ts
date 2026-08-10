import {
  DIGITS,
  LETTERS,
  LETTERS_WITH_UPPERCASE,
  MAX_LENGTH,
  MIN_LENGTH,
} from './alphabets.js';
import { InvalidIdFormatError } from './errors.js';
import { assertValidLength, isValidLength } from './length.js';

export function isValidId(
  value: unknown,
  length?: number,
  allowUppercase = false,
): value is string {
  if (typeof value !== 'string') return false;
  if (length !== undefined && (!isValidLength(length) || value.length !== length)) {
    return false;
  }
  if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) return false;

  const letters = allowUppercase ? LETTERS_WITH_UPPERCASE : LETTERS;
  for (let index = 0; index < value.length; index += 1) {
    const alphabet: string = (index + 1) % 3 === 0 ? DIGITS : letters;
    if (alphabet.indexOf(value[index]!) === -1) return false;
  }

  return true;
}

export function ensureValidId(
  value: unknown,
  length?: number,
  allowUppercase = false,
): asserts value is string {
  if (length !== undefined) assertValidLength(length);
  if (!isValidId(value, length, allowUppercase)) {
    throw new InvalidIdFormatError();
  }
}
