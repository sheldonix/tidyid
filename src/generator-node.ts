import { Buffer } from 'node:buffer';
import { randomFillSync } from 'node:crypto';
import { DEFAULT_LENGTH } from './alphabets.js';
import { assertValidLength } from './length.js';
import { fillStructuredId } from './random.js';

export function tidyid(
  length: number = DEFAULT_LENGTH,
  allowUppercase = false,
): string {
  assertValidLength(length);
  const output = Buffer.allocUnsafe(length);
  const random = Buffer.allocUnsafe(length * 2);
  let outputOffset = 0;
  while (outputOffset < length) {
    randomFillSync(random);
    outputOffset = fillStructuredId(
      output,
      outputOffset,
      random,
      allowUppercase,
    );
  }
  return output.toString('latin1');
}
