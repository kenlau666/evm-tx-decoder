import { DecodeError } from '@/types';

// Re-export DecodeError from types
export { DecodeError };

export function getErrorMessage(error: unknown): string {
  if (error instanceof DecodeError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
