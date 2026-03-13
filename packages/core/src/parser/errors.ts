export class TokenParseError extends Error {
  constructor(message: string, public filePath?: string, public tokenPath?: string[]) {
    super(message);
    this.name = 'TokenParseError';
  }
}

export class TokenValidationError extends Error {
  constructor(
    message: string,
    public errors: ValidationIssue[]
  ) {
    super(message);
    this.name = 'TokenValidationError';
  }
}

export interface ValidationIssue {
  path: string[];
  message: string;
  severity: 'error' | 'warning';
}

export class CircularReferenceError extends Error {
  constructor(
    message: string,
    public cycle: string[]
  ) {
    super(message);
    this.name = 'CircularReferenceError';
  }
}
