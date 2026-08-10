export class InvalidIdLengthError extends RangeError {
  static {
    Object.defineProperty(this, 'name', { value: 'InvalidIdLengthError' });
  }

  override readonly name = 'InvalidIdLengthError';

  constructor() {
    super('length must be between 3 and 256');
  }
}

export class InvalidIdFormatError extends TypeError {
  static {
    Object.defineProperty(this, 'name', { value: 'InvalidIdFormatError' });
  }

  override readonly name = 'InvalidIdFormatError';

  constructor() {
    super('value is not a valid TidyID');
  }
}
