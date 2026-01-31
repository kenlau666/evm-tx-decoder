import type { DecodeErrorCode } from '@/types';

export class DecodeError extends Error {
  constructor(
    message: string,
    public readonly code: DecodeErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DecodeError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof DecodeError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
