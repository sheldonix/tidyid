export const LETTERS: 'abcdefghjkmnpqrtuvwxyz';
export const DIGITS: '23456789';
export const LETTERS_WITH_UPPERCASE: 'ABCDEFGHJKMNPQRTUVWXYZabcdefghjkmnpqrtuvwxyz';
export const DEFAULT_LENGTH: 32;
export const MIN_LENGTH: 3;
export const MAX_LENGTH: 256;

export class InvalidIdLengthError extends RangeError {
  readonly name: 'InvalidIdLengthError';
  constructor();
}

export class InvalidIdFormatError extends TypeError {
  readonly name: 'InvalidIdFormatError';
  constructor(length?: number);
}

export function tidyid(length?: number, allowUppercase?: boolean): string;
export function isValidId(
  value: unknown,
  length?: number,
  /** Defaults to `false`. */
  allowUppercase?: boolean,
): value is string;
export function ensureValidId(
  value: unknown,
  length?: number,
  /** Defaults to `false`. */
  allowUppercase?: boolean,
): asserts value is string;
export function getIdCapacity(length?: number, allowUppercase?: boolean): bigint;
export function getIdEntropy(length?: number, allowUppercase?: boolean): number;
