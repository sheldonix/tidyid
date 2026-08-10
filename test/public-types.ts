import {
  DEFAULT_LENGTH,
  DIGITS,
  InvalidIdFormatError,
  InvalidIdLengthError,
  LETTERS,
  MAX_LENGTH,
  MIN_LENGTH,
  ensureValidId,
  getIdCapacity,
  getIdEntropy,
  isValidId,
  tidyid,
} from 'tidyid';

const id: string = tidyid();
const capacity: bigint = getIdCapacity();
const entropy: number = getIdEntropy();
let candidate: unknown = id;

if (isValidId(candidate)) candidate.toUpperCase();
ensureValidId(candidate, DEFAULT_LENGTH);
candidate.toUpperCase();

void [
  LETTERS,
  DIGITS,
  MIN_LENGTH,
  MAX_LENGTH,
  capacity,
  entropy,
  new InvalidIdLengthError(),
  new InvalidIdFormatError(),
];
