import { MAX_LENGTH, MIN_LENGTH } from './alphabets.js';
import { InvalidIdLengthError } from './errors.js';

export function isValidLength(length: number): boolean {
  return Number.isSafeInteger(length)
    && length >= MIN_LENGTH
    && length <= MAX_LENGTH;
}

export function assertValidLength(length: number): void {
  if (!isValidLength(length)) throw new InvalidIdLengthError();
}
