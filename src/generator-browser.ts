import { DEFAULT_LENGTH } from './alphabets.js';
import { assertValidLength } from './length.js';
import { fillStructuredId } from './random.js';

interface WebCryptoRandom {
  getRandomValues<T extends Uint8Array>(buffer: T): T;
}

const decoder = new TextDecoder();

function getBrowserCrypto(): WebCryptoRandom {
  const source = (globalThis as typeof globalThis & {
    readonly crypto?: WebCryptoRandom;
  }).crypto;
  if (source === undefined || typeof source.getRandomValues !== 'function') {
    throw new Error('Web Crypto API is unavailable');
  }
  return source;
}

export function tidyid(
  length: number = DEFAULT_LENGTH,
  allowUppercase = false,
): string {
  assertValidLength(length);
  const output = new Uint8Array(length);
  const random = new Uint8Array(length * 2);
  let outputOffset = 0;
  while (outputOffset < length) {
    getBrowserCrypto().getRandomValues(random);
    outputOffset = fillStructuredId(
      output,
      outputOffset,
      random,
      allowUppercase,
    );
  }
  return decoder.decode(output);
}
